"""旁白合成 + 时间轴生成。

读 script/narration.json，用 Kokoro-82M-v1.1-zh 逐句合成中文配音，输出：
  build/vo.wav         24 kHz 单声道配音
  build/timeline.json  每个镜头的起止时间、同步点（cues）和字幕时间

用法：python tools/tts.py          （需在装了 kokoro 的 Python 3.12 环境里运行）
"""
import json
import re
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
import torch
from kokoro import KModel, KPipeline

ROOT = Path(__file__).resolve().parent.parent
SR = 24000
FPS = 30
REPO_ID = "hexgrad/Kokoro-82M-v1.1-zh"

# 旁白里出现的英文词，手写音标（misaki 记号），不依赖英文 G2P 和 spaCy 模型
EN_LEXICON = {
    "opus": "ˈOpəs",
    "fable": "fˈAbᵊl",
    "mythos": "mˈIθɑs",
    "claude": "klˈɔd",
    "foundry": "fˈWndɹi",
    "id": "ˌIdˈi",
}


def en_callable(text: str) -> str:
    out = []
    for w in text.split():
        key = w.strip(" '-").lower()
        if key not in EN_LEXICON:
            raise ValueError(f"旁白里的英文词没有音标：{w!r}，请加进 EN_LEXICON")
        out.append(EN_LEXICON[key])
    return " ".join(out)


def speed_callable(len_ps: int) -> float:
    # 官方示例的做法：长句略放慢，避免赶字
    speed = 0.8
    if len_ps <= 83:
        speed = 1.0
    elif len_ps < 183:
        speed = 1 - (len_ps - 83) / 500
    return speed * 1.06


CUE_RE = re.compile(r"\{(\w+)\}")


def weight(text: str) -> float:
    """朗读时长的粗略权重：汉字 1，标点算停顿，英文按音节估。"""
    w = 0.0
    for tok in re.findall(r"[A-Za-z]+|.", text):
        if re.fullmatch(r"[A-Za-z]+", tok):
            w += max(1.0, round(len(tok) / 3))
        elif tok in "，、：；":
            w += 0.55
        elif tok in "。？！":
            w += 0.5
        elif tok.isspace() or tok == "|":
            continue
        else:
            w += 1.0
    return w


def parse_say(say: str):
    """去掉 {cue} 和 |，返回 (纯文本, {cue: 权重位置}, [| 的权重位置], 总权重)。"""
    cues, splits = {}, []
    clean, acc = "", 0.0
    pos = 0
    for m in re.finditer(r"\{(\w+)\}|\|", say):
        chunk = say[pos:m.start()]
        clean += chunk
        acc += weight(chunk)
        if m.group(0) == "|":
            splits.append(acc)
        else:
            cues[m.group(1)] = acc
        pos = m.end()
    tail = say[pos:]
    clean += tail
    acc += weight(tail)
    return clean, cues, splits, acc


def trim(wav: np.ndarray, thr=0.006):
    idx = np.where(np.abs(wav) > thr)[0]
    if len(idx) == 0:
        return wav
    a = max(0, idx[0] - int(0.02 * SR))
    b = min(len(wav), idx[-1] + int(0.06 * SR))
    return wav[a:b]


def main():
    data = json.loads((ROOT / "script/narration.json").read_text("utf-8"))
    voice = data.get("voice", "zm_010")
    gap = float(data.get("gap", 0.3))

    torch.set_num_threads(4)
    model = KModel(repo_id=REPO_ID).eval()
    pipe = KPipeline(lang_code="z", repo_id=REPO_ID, model=model, en_callable=en_callable)

    audio = []
    t = 0.0
    scenes_out = []
    for sc in data["scenes"]:
        start = t
        cues, subs = {}, []
        if "fixed" in sc:
            n = int(round(sc["fixed"] * SR))
            audio.append(np.zeros(n, dtype=np.float32))
            t += n / SR
        else:
            n = int(round(sc.get("pre", 0.5) * SR))
            audio.append(np.zeros(n, dtype=np.float32))
            t += n / SR
            for li, line in enumerate(sc["lines"]):
                clean, lcues, lsplits, total = parse_say(line["say"])
                parts = line["sub"].split("|")
                if len(parts) != len(lsplits) + 1:
                    sys.exit(f"{sc['id']} 第 {li+1} 句：sub 和 say 的 | 数量不一致")
                res = next(pipe(clean, voice=voice, speed=speed_callable))
                wav = trim(res.audio.detach().cpu().numpy().astype(np.float32))
                dur = len(wav) / SR
                for k, v in lcues.items():
                    cues[k] = round(t + dur * v / total, 3)
                bounds = [0.0] + [dur * s / total for s in lsplits] + [dur]
                for pi, ptxt in enumerate(parts):
                    subs.append({
                        "text": ptxt.strip(),
                        "start": round(t + bounds[pi], 3),
                        "end": round(t + bounds[pi + 1], 3),
                    })
                cues.setdefault(f"line{li+1}", round(t, 3))
                audio.append(wav)
                t += dur
                print(f"{sc['id']} L{li+1} {dur:5.2f}s  {clean}", flush=True)
                if li < len(sc["lines"]) - 1:
                    n = int(round(gap * SR))
                    audio.append(np.zeros(n, dtype=np.float32))
                    t += n / SR
            n = int(round(sc.get("post", 0.8) * SR))
            audio.append(np.zeros(n, dtype=np.float32))
            t += n / SR
        # 镜头边界对齐到整帧
        end_frame = int(np.ceil(t * FPS))
        pad = int(round(end_frame / FPS * SR)) - int(round(t * SR))
        if pad > 0:
            audio.append(np.zeros(pad, dtype=np.float32))
        t = end_frame / FPS
        scenes_out.append({
            "id": sc["id"], "title": sc["title"],
            "start": round(start, 4), "end": round(t, 4),
            "cues": cues, "subs": subs,
        })

    vo = np.concatenate(audio)
    (ROOT / "build").mkdir(exist_ok=True)
    sf.write(ROOT / "build/vo.wav", vo, SR)
    tl = {"fps": FPS, "duration": round(t, 4), "scenes": scenes_out}
    (ROOT / "build/timeline.json").write_text(json.dumps(tl, ensure_ascii=False, indent=1), "utf-8")
    print(f"总时长 {t:.2f}s，{len(scenes_out)} 个镜头")


if __name__ == "__main__":
    main()
