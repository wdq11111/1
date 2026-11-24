"""配乐与音效合成（纯本地，无版权素材），并与配音混音。

按 build/timeline.json 的镜头边界和同步点生成：
  - 铺底和弦（Am–F–C–G，96 BPM）、贝斯、琶音、鼓
  - 片名重击 + 前置上升音、镜头切换呼啸声、关键数字出现时的提示音、开场计数器的滴答声
输出：
  build/music.wav  纯音乐（已按配音做避让）
  build/mix.wav    配音 + 音乐
用法：python tools/music.py
"""
import json
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import butter, fftconvolve, resample_poly, sosfilt

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
rng = np.random.default_rng(42)

tl = json.loads((ROOT / "build/timeline.json").read_text("utf-8"))
SC = {s["id"]: s for s in tl["scenes"]}
DUR = tl["duration"]
N = int((DUR + 0.5) * SR)


def cue(sid, name):
    return SC[sid]["cues"][name]


class Bus:
    def __init__(self):
        self.x = np.zeros((N, 2))

    def add(self, sig, t0, gain=1.0, pan=0.0):
        i0 = int(round(t0 * SR))
        if i0 >= N:
            return
        if sig.ndim == 1:
            l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
            sig = np.stack([sig * l * 1.414, sig * r * 1.414], 1)
        if i0 < 0:
            sig = sig[-i0:]
            i0 = 0
        n = min(len(sig), N - i0)
        self.x[i0:i0 + n] += sig[:n] * gain


def t_(dur):
    return np.arange(int(dur * SR)) / SR


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, "low", fs=SR, output="sos"), x, axis=0)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x, axis=0)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x, axis=0)


def reverb(x, secs=2.2, mix=0.25, pre=0.02):
    n = int(secs * SR)
    tt = np.arange(n) / SR
    ir = rng.standard_normal((n, 2)) * np.exp(-tt * 6.9 / secs)[:, None]
    ir = lp(ir, 6000)
    ir[: int(pre * SR)] = 0
    ir /= np.sqrt((ir ** 2).sum(0))
    wet = np.stack([fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], 1)
    return x * (1 - mix) + wet * mix * 2.2


# ---------------- 乐器 ----------------
def pad_voice(f, dur, harmonics=9, bright=0.32):
    tt = t_(dur)
    s = np.zeros_like(tt)
    for k in range(1, harmonics + 1):
        s += np.sin(2 * np.pi * k * f * tt + rng.uniform(0, 6.28)) / k * np.exp(-(k - 1) * bright)
    return s


def env_adsr(n, a, r):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na) ** 1.5
    e[-nr:] *= np.linspace(1, 0, nr) ** 1.5
    return e


def pluck(f, dur=0.6, tau=0.17):
    tt = t_(dur)
    s = np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 2 * f * tt) + 0.12 * np.sin(2 * np.pi * 3 * f * tt)
    e = np.exp(-tt / tau) * np.minimum(1, tt / 0.004)
    return s * e


def kick():
    tt = t_(0.45)
    f = 46 + 95 * np.exp(-tt / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-tt / 0.26)
    s += 0.25 * hp(rng.standard_normal(len(tt)), 2500) * np.exp(-tt / 0.006)
    return s


def hat(open_=False):
    tt = t_(0.35 if open_ else 0.09)
    s = hp(rng.standard_normal(len(tt)), 7500, 4) * np.exp(-tt / (0.09 if open_ else 0.022))
    return s


def clap():
    tt = t_(0.35)
    n = bp(rng.standard_normal(len(tt)), 900, 3200)
    e = np.zeros_like(tt)
    for d in (0, 0.011, 0.022):
        e += (tt >= d) * np.exp(-np.maximum(tt - d, 0) / (0.012 if d < 0.02 else 0.13))
    return n * e


def ping(f=1318.5, dur=1.4):
    tt = t_(dur)
    s = np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 2.0 * tt) + 0.15 * np.sin(2 * np.pi * f * 3.01 * tt)
    return s * np.exp(-tt / 0.35) * np.minimum(1, tt / 0.003)


def whoosh(dur=1.1):
    tt = t_(dur)
    n = rng.standard_normal(len(tt))
    # 中心频率随时间扫上去再回来
    lo = bp(n, 300, 1400)
    hi = bp(n, 1400, 6000)
    k = np.sin(np.pi * tt / dur) ** 2
    s = lo * (1 - k) + hi * k
    env = np.sin(np.pi * tt / dur) ** 3
    st = np.stack([s * env * np.linspace(1.2, 0.3, len(tt)), s * env * np.linspace(0.3, 1.2, len(tt))], 1)
    return st


def riser(dur):
    tt = t_(dur)
    n = rng.standard_normal(len(tt))
    s = np.zeros_like(tt)
    # 分段带通，频率逐步上升
    seg = 8
    for i in range(seg):
        a, b = int(i * len(tt) / seg), int((i + 1) * len(tt) / seg)
        f0 = 300 * (2 ** (i * 0.55))
        s[a:b] = bp(n[a:b + 2000][: b - a] if b + 2000 <= len(n) else n[a:b], f0, min(f0 * 3, 16000))
    f = 110 * 2 ** (3 * tt / dur)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25
    e = (tt / dur) ** 2.2
    return (s * 0.8 + tone) * e


def impact():
    tt = t_(3.2)
    f = 38 + 70 * np.exp(-tt / 0.08)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.9)
    crash = hp(rng.standard_normal(len(tt)), 3000) * np.exp(-tt / 0.7) * 0.35
    thud = lp(rng.standard_normal(len(tt)), 300) * np.exp(-tt / 0.08) * 0.8
    return boom + crash + thud


def thud():
    tt = t_(0.6)
    f = 70 + 60 * np.exp(-tt / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.16) + lp(rng.standard_normal(len(tt)), 900) * np.exp(-tt / 0.03) * 0.6


def tick():
    tt = t_(0.03)
    return np.sin(2 * np.pi * 3200 * tt) * np.exp(-tt / 0.004)


# ---------------- 编曲 ----------------
BPM = 96
BEAT = 60 / BPM
BAR = 4 * BEAT
T0 = SC["s02"]["start"]           # 片名落版 = 第一小节强拍
END = DUR
# A 小调：i – VI – III – VII，每个和弦 2 小节
CHORDS = [
    ("Am", [57, 60, 64, 69], 45),
    ("F", [57, 60, 65, 69], 41),
    ("C", [55, 60, 64, 67], 48),
    ("G", [55, 59, 62, 67], 43),
]

pad, bass, arp, drums, fx = Bus(), Bus(), Bus(), Bus(), Bus()

# 开场：低音持续音 + 渐强
intro_d = T0 + 0.5
tt = t_(intro_d)
drone = (pad_voice(midi(33), intro_d, 6, 0.5) * 0.6 + pad_voice(midi(40), intro_d, 6, 0.5) * 0.35)
drone *= np.minimum(1, tt / 3.0) * (0.55 + 0.45 * tt / intro_d)
drone[-int(0.5 * SR):] *= np.linspace(1, 0, int(0.5 * SR))
pad.add(lp(drone, 900), 0, 0.22)

# 计数器滴答：与画面 0→62 的缓动同步
tc = cue("s01", "count") - SC["s01"]["start"]
t_start, t_len = tc - 1.6, 1.9
prev = 0
for i in range(1, 400):
    tt_ = t_start + t_len * i / 400
    p = 1 - (1 - i / 400) ** 4
    v = round(62 * p)
    if v != prev:
        fx.add(tick(), tt_, 0.10 + 0.05 * (v % 10 == 0), pan=-0.2 + 0.4 * (v % 2))
        prev = v

# 上升音 → 片名重击
fx.add(riser(2.6), T0 - 2.6, 0.22)
fx.add(impact(), T0 - 0.01, 0.75)

# 和弦铺底 / 贝斯 / 琶音
nbars = int(np.ceil((END - T0) / BAR)) + 1
s12 = SC["s12"]["start"]
for b in range(0, nbars, 2):
    t_bar = T0 + b * BAR
    if t_bar >= END:
        break
    name, notes, root = CHORDS[(b // 2) % 4]
    if t_bar >= s12 - 0.01:
        name, notes, root = ("Fmaj7", [57, 60, 64, 65], 41) if t_bar < s12 + 2 * BAR else ("Am9", [57, 60, 64, 71], 45)
    dur = 2 * BAR + 1.2
    for j, m in enumerate(notes):
        for det in (-0.06, 0.06):
            v = pad_voice(midi(m) * 2 ** (det / 12), dur)
            pad.add(v * env_adsr(len(v), 0.9, 1.4), t_bar, 0.05, pan=(j - 1.5) / 2.5 + det * 3)
    # 贝斯：每拍带一点“抽吸”
    vb = np.sin(2 * np.pi * midi(root - 12 + 12) / 2 * t_(dur)) * 0.8 + 0.3 * np.sin(2 * np.pi * midi(root) * t_(dur))
    tt = t_(dur)
    pump = 1 - 0.6 * np.exp(-((tt % BEAT) / 0.11))
    bass.add(vb * env_adsr(len(vb), 0.05, 0.6) * pump, t_bar, 0.16)
    # 琶音：16 分音符
    seq = [0, 1, 2, 3, 2, 1, 2, 3]
    for k in range(32):
        tn = t_bar + k * BEAT / 4
        if tn > END - 2.5:
            break
        m = notes[seq[k % 8]] + 12 + (12 if (k // 8) % 2 and seq[k % 8] == 3 else 0)
        acc = 1.0 if k % 4 == 0 else 0.62
        arp.add(pluck(midi(m)), tn, 0.055 * acc, pan=0.35 * np.sin(k * 1.3))

# 鼓：s03 起进，s06–s10 加拍手和 16 分镲，s11 收成只有底鼓，s12 停
s03, s06, s11 = SC["s03"]["start"], SC["s06"]["start"], SC["s11"]["start"]
nb = int((s12 - T0) / BEAT)
for i in range(nb):
    tb = T0 + i * BEAT
    if tb < s03 - 0.01 or tb >= s12 - 0.05:
        continue
    pos = i % 4
    if tb >= s11:
        if pos == 0:
            drums.add(kick(), tb, 0.36)
        continue
    if pos in (0, 2):
        drums.add(kick(), tb, 0.42)
    if s06 <= tb < s11 and pos in (1, 3):
        drums.add(clap(), tb, 0.10, pan=0.05)
    drums.add(hat(), tb + BEAT / 2, 0.05, pan=0.3)
    if s06 <= tb < s11:
        drums.add(hat(), tb + BEAT / 4, 0.022, pan=-0.3)
        drums.add(hat(), tb + 3 * BEAT / 4, 0.022, pan=-0.3)
    if pos == 3 and (i // 4) % 4 == 3:
        drums.add(hat(True), tb + BEAT / 2, 0.04, pan=0.3)

# 镜头切换呼啸声
for s in tl["scenes"][2:]:
    fx.add(whoosh(1.1), s["start"] - 0.62, 0.20)

# 关键时刻的提示音
pings = [
    ("s03", "core", 1318.5), ("s03", "wide", 987.8), ("s05", "gap", 1046.5), ("s06", "med", 1318.5),
    ("s06", "win", 1568.0), ("s07", "next", 1318.5), ("s08", "win", 1568.0), ("s09", "merge", 1318.5),
    ("s10", "hit", 1568.0), ("s11", "conf", 987.8), ("s12", "week", 1318.5),
]
for sid, c, f in pings:
    t0 = cue(sid, c) + (0.55 if c == "merge" else 0.0)
    fx.add(ping(f), t0, 0.075, pan=0.15)
    fx.add(ping(f * 1.5), t0 + 0.09, 0.03, pan=-0.2)
fx.add(thud(), cue("s10", "stamp") - 0.05, 0.42)
fx.add(thud(), cue("s06", "miss") - 0.08, 0.3)
# 结尾重音
fx.add(impact() * 0.6, s12 + 0.02, 0.35)

# ---------------- 混合 ----------------
pad.x = lp(pad.x, 3200)
arp.x = lp(arp.x, 5200)
# 琶音乒乓延迟
d = int(3 * BEAT / 4 * SR)
for k, g in enumerate([0.32, 0.18, 0.1]):
    sh = d * (k + 1)
    src = arp.x[:-sh].copy()
    if k % 2 == 0:
        src = src[:, ::-1]
    arp.x[sh:] += src * g
music = pad.x + bass.x + arp.x * 1.0 + drums.x
music = reverb(music, 2.4, 0.22)
fxw = reverb(fx.x, 1.8, 0.28)
music = music + fxw
# 片尾 3 秒淡出
fo = int(3.0 * SR)
music[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5

# 配音 + 避让
vo, vsr = sf.read(ROOT / "build/vo.wav")
vo = resample_poly(vo, SR, vsr)
vo = np.pad(vo, (0, max(0, N - len(vo))))[:N]
vo = hp(vo, 80)
vo = vo / (np.abs(vo).max() + 1e-9) * 0.89
env = np.abs(vo)
win = int(0.12 * SR)
env = np.convolve(env, np.ones(win) / win, mode="same")
gate = (env > 0.02).astype(float)
# 起 60ms，落 350ms 的平滑
a_up, a_dn = np.exp(-1 / (0.06 * SR)), np.exp(-1 / (0.35 * SR))
g = np.zeros_like(gate)
acc = 0.0
for i in range(0, len(gate), 32):
    target = gate[i]
    coef = a_up ** 32 if target > acc else a_dn ** 32
    acc = target + (acc - target) * coef
    g[i:i + 32] = acc
duck = 1 - 0.5 * g
music_d = music * duck[:, None]

peak = np.abs(music_d).max()
music_d = music_d / peak * 0.5
sf.write(ROOT / "build/music.wav", music_d.astype(np.float32), SR)
mix = music_d * 0.62 + np.stack([vo, vo], 1)
mix = mix / max(1.0, np.abs(mix).max() / 0.97)
sf.write(ROOT / "build/mix.wav", mix.astype(np.float32), SR)
print("music.wav / mix.wav", f"{len(mix) / SR:.2f}s")
