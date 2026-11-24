"""《你好，世界》配乐 + 音效：全部用 numpy/scipy 合成（无外部素材，无版权问题）。

输出 film/work/audio.wav（44.1kHz 立体声，50 秒，对应 24fps 的 1~1200 帧）。
用法：~/.venvs/audio/bin/python film/audio.py
"""
import os

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, fftconvolve, sosfilt

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "work", "audio.wav")
SR = 44100
FPS = 24
TOTAL_FRAMES = 1200
N = int(SR * TOTAL_FRAMES / FPS) + SR
rng = np.random.default_rng(11)

dry = np.zeros((2, N))   # 干声
wet = np.zeros((2, N))   # 送混响


def t_of(f):
    return (f - 1) / FPS


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


NOTE = {n: i for i, n in enumerate(["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"])}


def nm(s):
    """'A4' / 'C#5' -> 频率"""
    name, octv = s[:-1], int(s[-1])
    return midi(12 * (octv + 1) + NOTE[name])


def mx(*sigs):
    """把长度不同的信号相加（短的补零）。"""
    n = max(len(x) for x in sigs)
    out = np.zeros(n)
    for x in sigs:
        out[:len(x)] += x
    return out


def place(sig, f, gain=1.0, pan=0.0, rev=0.2):
    i = int(t_of(f) * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    lg, rg = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    dry[0, i:i + len(sig)] += sig * lg * (1 - rev * 0.5)
    dry[1, i:i + len(sig)] += sig * rg * (1 - rev * 0.5)
    wet[0, i:i + len(sig)] += sig * lg * rev
    wet[1, i:i + len(sig)] += sig * rg * rev


def tt(dur):
    return np.arange(int(dur * SR)) / SR


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, "low", fs=SR, output="sos"), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def fade(x, a=0.005, r=0.02):
    n = len(x)
    e = np.ones(n)
    na, nr = min(n, int(a * SR)), min(n, int(r * SR))
    if na:
        e[:na] = np.linspace(0, 1, na)
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return x * e


# ---------------------------------------------------------------- 乐器
def bell(freq, dur=2.5, decay=2.2, bright=1.0):
    """八音盒/钟琴：带一点不和谐泛音的衰减正弦。"""
    t = tt(dur)
    parts = [(1, 1.0, 1.0), (2.0, 0.35 * bright, 1.8), (3.01, 0.16 * bright, 2.6), (4.17, 0.08 * bright, 3.5)]
    s = sum(a * np.sin(2 * np.pi * freq * k * t) * np.exp(-t * decay * d) for k, a, d in parts)
    return fade(s, 0.002, 0.05)


def pluck(freq, dur=0.6):
    t = tt(dur)
    s = np.sin(2 * np.pi * freq * t) + 0.5 * np.sin(4 * np.pi * freq * t) * np.exp(-t * 12)
    return fade(s * np.exp(-t * 7), 0.002, 0.03)


def pad(freqs, dur, attack=1.5, release=1.5, cutoff=1400):
    t = tt(dur)
    s = np.zeros_like(t)
    for f in freqs:
        for det in (-0.12, 0.0, 0.13):
            ph = rng.uniform(0, 1)
            s += 2 * ((t * f * 2 ** (det / 12) + ph) % 1.0) - 1  # 锯齿
    s = lp(s / (len(freqs) * 3), cutoff, 2)
    e = np.minimum(1, t / attack) * np.minimum(1, (dur - t) / release)
    return s * np.clip(e, 0, 1)


def chirp_syll(f0, f1, dur, vib=0.0):
    """机器人"说话"的一个音节：带滑音和颤音的柔和方波。"""
    t = tt(dur)
    f = np.geomspace(f0, f1, len(t)) * (1 + vib * np.sin(2 * np.pi * 28 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) + 0.3 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph)
    e = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 0.6
    return lp(s * e, 4500)


def voice(f, sylls, gain=0.22, pan=0.0):
    """sylls: [(开始偏移帧, 起始频率, 结束频率, 时长秒, 颤音)]"""
    for off, a, b, d, v in sylls:
        place(chirp_syll(a, b, d, v), f + off, gain, pan, rev=0.25)


def click(dur=0.012, fc=3500, gain=1.0):
    s = rng.standard_normal(int(dur * SR)) * np.exp(-tt(dur) * 300)
    return bp(s, fc * 0.6, min(fc * 1.6, 20000)) * gain


def tick():
    s = mx(click(0.02, 2800), 0.4 * np.sin(2 * np.pi * 4200 * tt(0.02)) * np.exp(-tt(0.02) * 400))
    return s


def thud(freq=90, dur=0.25):
    t = tt(dur)
    f = freq * np.exp(-t * 8) + 40
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 14)


def kick():
    t = tt(0.35)
    f = 140 * np.exp(-t * 28) + 48
    return np.tanh(2 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9))


def clap():
    s = np.zeros(int(0.2 * SR))
    for k in range(3):
        b = rng.standard_normal(int(0.012 * SR)) * np.exp(-tt(0.012) * 200)
        s[int(k * 0.01 * SR): int(k * 0.01 * SR) + len(b)] += b
    tail = rng.standard_normal(int(0.15 * SR)) * np.exp(-tt(0.15) * 22) * 0.5
    s[int(0.03 * SR): int(0.03 * SR) + len(tail)] += tail
    return bp(s, 900, 5000)


def hat(open_=False):
    d = 0.18 if open_ else 0.05
    s = rng.standard_normal(int(d * SR)) * np.exp(-tt(d) * (18 if open_ else 80))
    return hp(s, 7000)


def noise_sweep(dur, f0, f1, gain=1.0):
    """呼啸声：带通噪声，中心频率从 f0 滑到 f1，音量渐强。"""
    n = int(dur * SR)
    x = rng.standard_normal(n)
    out = np.zeros(n)
    seg = 2048
    for i in range(0, n, seg):
        u = i / n
        fc = f0 * (f1 / f0) ** u
        out[i:i + seg] = bp(x[i:i + seg + 0], fc * 0.7, min(fc * 1.4, 20000))[: len(out[i:i + seg])]
    e = np.linspace(0, 1, n) ** 2
    return lp(out * e, 12000) * gain


# ---------------------------------------------------------------- 编排
def room_and_clock():
    # 房间底噪（暗、轻），开灯后略降
    n = rng.standard_normal(N)
    room = lp(n, 500, 1) * 0.02
    env = np.ones(N)
    i_on = int(t_of(661) * SR)
    env[i_on:] = 0.6
    dry[0] += room * env
    dry[1] += np.roll(room, 300) * env
    # 闹钟秒针：与画面里每 24 帧跳一次对齐
    for f in range(1, 961, 24):
        g = 0.18 if f < 121 else (0.07 if f < 661 else 0.04)
        place(tick(), f, g, pan=-0.5, rev=0.15)


def boot_sequence():
    # BIOS 嘀一声
    place(fade(np.sign(np.sin(2 * np.pi * 1200 * tt(0.12))) * 0.3, 0.002, 0.01), 8, 0.25, 0.1, 0.1)
    # 敲命令：字符出现即一次按键
    cmd_len = len("C:\\> run hello_world.exe")
    prev = 4
    for f in range(34, 100):
        n = min(cmd_len, (f - 34) * 2 // 5 + 4)
        if n != prev:
            place(mx(click(0.02, rng.uniform(2200, 3600)), thud(300, 0.03) * 0.3), f, 0.35, rng.uniform(-0.2, 0.2), 0.08)
            prev = n
    place(mx(click(0.04, 1800), thud(200, 0.06) * 0.5), 101, 0.45, 0, 0.1)  # 回车
    place(bell(nm("E5"), 1.2, 4), 105, 0.07, 0.2)
    # 模块加载 OK 的提示音（逐个升高）
    for f, note in [(128, "C6"), (146, "D6"), (162, "E6"), (178, "G6")]:
        place(bell(nm(note), 1.0, 5, 0.5), f, 0.09, 0.3)
    # 进度条：缓慢升高的电子嗡鸣
    d = (216 - 122) / FPS
    t = tt(d)
    fq = np.geomspace(180, 720, len(t))
    s = np.sin(2 * np.pi * np.cumsum(fq) / SR) * np.minimum(1, t / 1.0) * 0.5
    place(lp(s, 3000), 122, 0.10, 0, 0.3)
    # 闪白：上升呼啸
    place(noise_sweep((216 - 188) / FPS, 400, 9000), 188, 0.35, 0, 0.4)


def birth():
    # 光粒子飞行：零星的高音叮
    for i in range(26):
        f = rng.integers(206, 232)
        place(bell(rng.choice([nm("E6"), nm("A6"), nm("B6"), nm("E7")]), 0.8, 6, 0.3), f, 0.035,
              rng.uniform(-0.7, 0.7), 0.6)
    # 凝聚成形：低频"嗡"+ 和弦闪光
    place(thud(70, 0.8), 226, 0.5, 0, 0.3)
    for k, note in enumerate(["A4", "C5", "E5", "A5", "E6"]):
        place(bell(nm(note), 3.0, 1.3), 228 + k * 2, 0.08, -0.4 + k * 0.2, 0.5)
    # 眼睛开机：哔—哔哔
    voice(262, [(0, 900, 900, 0.06, 0), (5, 1100, 1100, 0.05, 0), (10, 1300, 1700, 0.12, 0)], 0.16)


def night_music():
    # Am 氛围铺底：开场渐入，开灯前结束
    place(pad([nm("A2"), nm("E3"), nm("C4"), nm("B4")], t_of(662) - t_of(1), attack=4, release=0.4, cutoff=900),
          1, 0.15, 0, 0.5)
    # 好奇的八音盒动机
    seq = [(236, "E5"), (244, "A5"), (252, "B5"), (260, "C6"),
           (318, "A4"), (326, "C5"), (334, "E5"), (350, "D5"), (358, "C5"), (366, "B4"),
           (396, "E4"), (406, "D4"), (418, "C4"),   # 好黑啊……
           (452, "E5"), (460, "G5"), (472, "A5"), (488, "C6")]
    for f, n in seq:
        place(bell(nm(n), 2.5, 1.8), f, 0.075, rng.uniform(-0.3, 0.3), 0.45)


def walking():
    # 脚步：Walking 片段从 508 帧开始、放慢 1.25 倍，脚落地约在动作第 2、12 帧
    steps = []
    f = 508 + 2 * 1.25
    while f < 602:
        steps.append(f)
        f += 12.5 if len(steps) % 2 else 17.5
    scale = ["A4", "C5", "D5", "E5", "G5", "A5", "C6", "D6"]
    for k, f in enumerate(steps):
        place(mx(click(0.015, 5200, 1.0), thud(400, 0.04) * 0.4), int(round(f)), 0.16, 0.25 * (-1) ** k, 0.15)
        place(pluck(nm(scale[k % len(scale)])), int(round(f)), 0.14, 0.25 * (-1) ** k, 0.3)


def jump_and_light():
    # 鼓起勇气：起跳前的渐强
    place(noise_sweep((652 - 628) / FPS, 300, 3000, 0.6), 628, 0.15, 0, 0.3)
    voice(636, [(0, 500, 650, 0.12, 0.02)], 0.12)  # "嗯！"
    # 起跳"啵～"
    t = tt(0.3)
    fq = np.geomspace(300, 900, len(t))
    place(fade(np.sin(2 * np.pi * np.cumsum(fq) / SR) * np.exp(-t * 6)), 653, 0.16, 0, 0.3)
    # 落地 + 按钮"咔哒"
    place(thud(110, 0.3), 660, 0.5, 0.1, 0.2)
    place(mx(click(0.03, 2500, 1.5), click(0.02, 1200)), 661, 0.6, 0.1, 0.15)
    # 灯丝"嗡"一下，配合闪烁
    hum = np.sin(2 * np.pi * 100 * tt(0.4)) * 0.5 + 0.3 * np.sin(2 * np.pi * 200 * tt(0.4))
    place(fade(hum * np.exp(-tt(0.4) * 5)), 661, 0.08, 0.3, 0.2)
    # 暖色大和弦 + 闪烁的高音琶音
    place(pad([nm("C3"), nm("G3"), nm("C4"), nm("E4"), nm("G4"), nm("D5")], 4.5, attack=0.8, release=2.5,
              cutoff=2200), 662, 0.12, 0, 0.6)
    for k, n in enumerate(["C6", "E6", "G6", "C7", "G6", "E6"]):
        place(bell(nm(n), 2.5, 2.0), 664 + k * 3, 0.05, -0.5 + k * 0.2, 0.6)


def warm_theme():
    # C 大调温暖主题（每小节 60 帧 = 96 BPM 的 4 拍）
    chords = [(686, ["C3", "G3", "E4"]), (746, ["F2", "C3", "A3"]), (806, ["A2", "E3", "C4"]),
              (866, ["G2", "D3", "B3"]), (926, ["C3", "G3", "E4"])]
    for f, ns in chords:
        place(pad([nm(n) for n in ns], 60 / FPS + 1.2, attack=0.6, release=1.2, cutoff=1600), f, 0.085, 0, 0.5)
    mel = [(686, "C5"), (701, "E5"), (716, "G5"), (731, "E5"),
           (746, "F5"), (761, "A5"), (776, "G5"), (791, "E5"),
           (806, "E5"), (821, "C5"), (836, "D5"), (851, "E5"),
           (866, "D5"), (881, "G5"), (896, "B5"), (911, "D6"),
           (926, "C6"), (941, "G5")]
    for f, n in mel:
        place(bell(nm(n), 2.2, 2.0), f, 0.06, rng.uniform(-0.25, 0.25), 0.45)
    # 挥手：上行刮奏；点赞："叮！"
    for k, n in enumerate(["C6", "D6", "E6", "G6", "A6", "C7"]):
        place(bell(nm(n), 1.2, 4, 0.6), 848 + k * 2, 0.04, -0.4 + k * 0.15, 0.5)
    place(mx(bell(nm("E6"), 2.5, 1.5), 0.6 * bell(nm("B6"), 2.0, 2.0)), 916, 0.10, 0.2, 0.5)


def dance_groove():
    beat = 12  # 120 BPM
    start = 962
    end_f = 1104
    prog = [["C3", "E3", "G3"], ["A2", "C3", "E3"], ["F2", "A2", "C3"], ["G2", "B2", "D3"]]
    arp_notes = [["C5", "E5", "G5", "C6"], ["A4", "C5", "E5", "A5"], ["F4", "A4", "C5", "F5"], ["G4", "B4", "D5", "G5"]]
    b = 0
    f = start
    while f < end_f:
        bar = (b // 4) % 4
        place(kick(), f, 0.26, 0, 0.05)
        if b % 2 == 1:
            place(clap(), f, 0.11, 0.1, 0.2)
        place(hat(), f + beat // 2, 0.04, -0.3, 0.05)
        place(hat(b % 4 == 3), f, 0.035, 0.3, 0.05)
        root = prog[bar][0]
        if b % 2 == 0:
            place(lp(pluck(nm(root), 0.5) * 1.5, 900), f, 0.20, 0, 0.05)
        else:
            place(lp(pluck(nm(root) * 2, 0.3), 900), f + beat // 2, 0.13, 0, 0.05)
        # 八音盒琶音（8 分音符）
        an = arp_notes[bar]
        place(bell(nm(an[(2 * b) % 4]), 0.9, 4), f, 0.05, -0.3, 0.4)
        place(bell(nm(an[(2 * b + 1) % 4]), 0.9, 4), f + beat // 2, 0.045, 0.3, 0.4)
        b += 1
        f += beat
    # 收尾：最后一拍落在片尾字幕，C 大调和弦 + 钟声
    place(kick(), 1105, 0.4, 0, 0.1)
    place(pad([nm("C3"), nm("G3"), nm("C4"), nm("E4"), nm("G4"), nm("B4")], 4.0, attack=0.05, release=3.2,
              cutoff=2400), 1105, 0.13, 0, 0.6)
    for k, n in enumerate(["C5", "E5", "G5", "C6", "E6"]):
        place(bell(nm(n), 3.5, 1.0), 1105 + k * 3, 0.07, -0.4 + k * 0.2, 0.6)
    # 片尾机器人一句"拜拜～"
    voice(1150, [(0, 1100, 1400, 0.10, 0.02), (4, 1400, 1000, 0.18, 0.03)], 0.13)


def robot_lines():
    voice(324, [(0, 520, 760, 0.16, 0.02)], 0.2)                                    # 嗯？
    voice(342, [(0, 700, 650, 0.07, 0), (3, 760, 700, 0.07, 0), (6, 650, 600, 0.07, 0),
                (9, 600, 640, 0.07, 0), (12, 650, 950, 0.14, 0.02)], 0.18)           # 这是哪儿？
    voice(396, [(0, 640, 560, 0.12, 0.03), (4, 560, 470, 0.12, 0.03), (9, 480, 360, 0.30, 0.05)], 0.17)  # 好黑啊……
    voice(452, [(0, 700, 720, 0.08, 0), (3, 720, 650, 0.10, 0), (12, 620, 640, 0.07, 0),
                (15, 660, 700, 0.07, 0), (18, 700, 1050, 0.16, 0.02)], 0.18)         # 那个……是灯吗？
    voice(726, [(0, 600, 1500, 0.45, 0.04)], 0.2)                                     # 哇——！
    voice(776, [(0, 900, 1000, 0.07, 0), (3, 1000, 1100, 0.07, 0), (6, 1100, 900, 0.07, 0),
                (9, 950, 1050, 0.07, 0), (12, 1100, 1300, 0.10, 0.02)], 0.17)        # 这样好多了！
    voice(852, [(0, 900, 1100, 0.08, 0), (4, 1100, 1250, 0.08, 0), (8, 1250, 1500, 0.16, 0.03)], 0.2)  # 你好呀！
    voice(912, [(0, 800, 850, 0.07, 0), (3, 850, 900, 0.07, 0), (6, 950, 1000, 0.07, 0),
                (9, 1000, 950, 0.07, 0), (12, 950, 1000, 0.07, 0), (15, 1000, 1200, 0.14, 0.02)], 0.17)  # 很高兴认识你


def reverb(x, secs=2.2, decay=0.55):
    n = int(secs * SR)
    t = np.arange(n) / SR
    irs = []
    for ch in range(2):
        ir = rng.standard_normal(n) * np.exp(-t / decay)
        ir = lp(ir, 6000)
        ir[: int(0.012 * SR)] = 0  # 预延迟
        irs.append(ir / np.sqrt((ir ** 2).sum()))
    return np.stack([fftconvolve(x[c], irs[c])[: x.shape[1]] for c in range(2)])


def main():
    room_and_clock()
    boot_sequence()
    birth()
    night_music()
    robot_lines()
    walking()
    jump_and_light()
    warm_theme()
    dance_groove()
    mix = dry + reverb(wet) * 0.9
    mix = hp(mix, 30)
    end = int(TOTAL_FRAMES / FPS * SR)
    mix = mix[:, :end]
    # 片尾淡出
    fo = int(2.0 * SR)
    mix[:, -fo:] *= np.linspace(1, 0, fo) ** 1.5
    peak = np.abs(mix).max()
    mix = np.tanh(mix / peak * 1.2) / np.tanh(1.2) * 0.89  # 柔和限幅，峰值约 -1 dBFS
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    wavfile.write(OUT, SR, (mix.T * 32767).astype(np.int16))
    rms = [20 * np.log10(np.sqrt((mix[:, int(t_of(a) * SR):int(t_of(b) * SR)] ** 2).mean()) + 1e-9)
           for a, b in [(1, 120), (121, 216), (217, 504), (505, 660), (661, 960), (961, 1104), (1105, 1200)]]
    print("audio ->", OUT, f"{mix.shape[1] / SR:.1f}s", "各段 RMS dBFS:", [round(r, 1) for r in rms])


if __name__ == "__main__":
    main()
