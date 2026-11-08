"""为宣传片合成配乐和音效（纯代码生成，无版权素材）。
120 BPM，30 秒；音效时间点与 src/scene.js 的动画对齐。
用法：python3 music.py out.wav
"""
import sys, math, wave
import numpy as np

SR = 48000
DUR = 30.0
BPM = 120
BEAT = 60 / BPM
N = int(SR * DUR)
t_all = np.arange(N) / SR
rng = np.random.default_rng(7)

L = np.zeros(N); R = np.zeros(N)

def add(sig, start, gain=1.0, pan=0.0):
    i = int(start * SR)
    if i >= N: return
    sig = sig[: N - i]
    l = gain * math.cos((pan + 1) * math.pi / 4) * math.sqrt(2)
    r = gain * math.sin((pan + 1) * math.pi / 4) * math.sqrt(2)
    L[i:i + len(sig)] += sig * l
    R[i:i + len(sig)] += sig * r

def env(n, a, d, sustain=0.0, curve=4.0):
    x = np.arange(n) / SR
    e = np.where(x < a, x / max(a, 1e-6), sustain + (1 - sustain) * np.exp(-(x - a) * curve / max(d, 1e-6)))
    return e

def note_hz(m):  # MIDI -> Hz
    return 440 * 2 ** ((m - 69) / 12)

# 和 JS 一致的伪随机，用来对齐引擎卡片完成时刻
def jsrand(i):
    x = math.sin(i * 127.1 + 311.7) * 43758.5453
    return x - math.floor(x)

# ---------- 乐器 ----------
def kick():
    n = int(0.45 * SR); x = np.arange(n) / SR
    f = 45 + 110 * np.exp(-x * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-x * 7.5) * 0.9

def hat(open_=False):
    n = int((0.22 if open_ else 0.06) * SR)
    s = rng.standard_normal(n)
    s = np.diff(s, prepend=0)  # 粗略高通
    return s * env(n, 0.001, 0.18 if open_ else 0.03, curve=5) * 0.12

def clap():
    n = int(0.25 * SR)
    s = rng.standard_normal(n)
    e = np.zeros(n)
    for k in range(3):
        i = int(k * 0.012 * SR); e[i:] += np.exp(-np.arange(n - i) / SR * 30) * (0.6 if k < 2 else 1)
    return np.diff(s, prepend=0) * e * 0.18

def saw(freq, n, detune=0.0):
    x = np.arange(n) / SR
    out = np.zeros(n)
    for d in (-detune, 0, detune):
        ph = (x * freq * (1 + d)) % 1
        out += 2 * ph - 1
    return out / 3

def lowpass(sig, cutoff):
    a = math.exp(-2 * math.pi * cutoff / SR)
    out = np.empty_like(sig); y = 0.0
    for i, v in enumerate(sig):
        y = (1 - a) * v + a * y; out[i] = y
    return out

def pad(midis, dur):
    n = int(dur * SR)
    s = sum(saw(note_hz(m), n, 0.004) for m in midis) / len(midis)
    s = lowpass(s, 1400)
    e = env(n, 0.35, dur, sustain=1.0)
    rel = np.clip((dur - np.arange(n) / SR) / 0.4, 0, 1)
    return s * e * rel * 0.16

def bass(m, dur):
    n = int(dur * SR); x = np.arange(n) / SR
    s = np.sin(2 * np.pi * note_hz(m) * x) + 0.3 * np.sin(4 * np.pi * note_hz(m) * x)
    return s * env(n, 0.005, dur, sustain=0.6, curve=3) * np.clip((dur - x) / 0.05, 0, 1) * 0.28

def pluck(m, dur=0.5, g=0.18):
    n = int(dur * SR); x = np.arange(n) / SR
    s = np.sin(2 * np.pi * note_hz(m) * x) + 0.4 * np.sin(2 * np.pi * note_hz(m) * 2 * x) + 0.15 * np.sin(2 * np.pi * note_hz(m) * 3 * x)
    return s * np.exp(-x * 9) * g

def whoosh(dur=0.9, rise=True):
    n = int(dur * SR); x = np.arange(n) / SR
    s = rng.standard_normal(n)
    k = x / dur
    cut = 300 + 5000 * (k if rise else 1 - k)
    out = np.empty(n); y = 0.0
    for i in range(n):
        a = math.exp(-2 * math.pi * cut[i] / SR); y = (1 - a) * s[i] + a * y; out[i] = y
    shape = np.sin(np.pi * k) ** 1.5
    return out * shape * 0.5

def impact():
    n = int(1.6 * SR); x = np.arange(n) / SR
    boom = np.sin(2 * np.pi * (38 + 60 * np.exp(-x * 12)) * x) * np.exp(-x * 2.6)
    noise = lowpass(rng.standard_normal(n), 2500) * np.exp(-x * 9) * 0.6
    return (boom + noise) * 0.55

def ping(m):
    n = int(0.6 * SR); x = np.arange(n) / SR
    s = np.sin(2 * np.pi * note_hz(m) * x) * np.exp(-x * 7) + 0.3 * np.sin(2 * np.pi * note_hz(m + 12) * x) * np.exp(-x * 12)
    return s * 0.12

def click():
    n = int(0.018 * SR)
    return np.diff(rng.standard_normal(n), prepend=0) * np.exp(-np.arange(n) / SR * 400) * 0.10

# ---------- 编曲 ----------
# 和弦：Am - F - C - G，每个 2 拍一小节 x2 = 4 秒
prog = [([57, 60, 64], 45), ([53, 57, 60], 41), ([48, 52, 55], 36), ([55, 59, 62], 43)]
CH = 4 * BEAT * 2  # 每个和弦 4 秒

# 底层铺垫：全程
t = 0.0; ci = 0
while t < 28.0:
    notes, root = prog[ci % 4]
    d = min(CH, 28.0 - t)
    add(pad(notes, d + 0.4), t, gain=0.9 if t >= 1.8 else 0.5, pan=0)
    t += CH; ci += 1
# 结尾长和弦
add(pad([57, 60, 64, 69], 2.6), 27.6, gain=1.0)

# 鼓：1.8s 图标落定后进入；17~22 推荐段减弱；27 后停
for b in range(60):
    tb = b * BEAT
    if tb < 1.8 or tb >= 27.0: continue
    soft = 17.0 <= tb < 22.0
    if not soft or b % 2 == 0:
        add(kick(), tb, gain=0.8 if soft else 1.0)
    add(hat(), tb + BEAT / 2, gain=0.8, pan=0.3)
    if b % 4 == 3 and not soft:
        add(hat(True), tb + BEAT * 0.75, gain=0.6, pan=-0.3)
    if b % 2 == 1 and tb >= 9.0 and not soft:
        add(clap(), tb, gain=1.0)

# 贝斯：跟和弦根音，八分音符
t = 4.5
while t < 27.0:
    ci = int(t // CH) % 4
    root = prog[ci][1]
    eighth = int(round((t % 1) / (BEAT / 2)))
    add(bass(root if eighth % 2 == 0 else root + 12, BEAT / 2 * 0.9), t, gain=0.9)
    t += BEAT / 2

# ---------- 音效（与画面对齐）----------
add(whoosh(1.5), 0.25, gain=0.6)              # 两块板飞入
add(impact(), 1.75, gain=0.9)                 # 合体落定
add(pluck(76, 1.2, 0.12), 1.8); add(pluck(81, 1.2, 0.10), 1.8)
add(whoosh(0.9), 4.4, gain=0.45, pan=-0.4)    # 图标退场、原文卡进场
add(whoosh(1.0), 8.9, gain=0.5, pan=0.4)      # 卡片展开
for i in range(8):                            # 8 张引擎卡片依次入场
    add(pluck(64 + [0, 3, 7, 10, 12, 15, 19, 22][i], 0.4, 0.08), 9.45 + i * 0.12, pan=0.5)
for i in range(8):                            # 各引擎完成的“叮”
    start = 11.0 + jsrand(i + 50) * 1.0
    dur = 0.9 + jsrand(i + 80) * 1.4
    add(ping(84 + [0, 2, 4, 7, 9, 12, 14, 16][i]), start + dur + 0.36, pan=0.35)
add(whoosh(1.2), 16.6, gain=0.5)              # 转场到推荐卡
add(impact(), 18.1, gain=0.55)
add(pluck(81, 1.0, 0.12), 18.2); add(pluck(88, 1.0, 0.08), 18.45)
add(whoosh(1.0), 22.0, gain=0.5, pan=-0.3)    # 终端进场
for i in range(34):                           # 打字声
    add(click(), 23.2 + i / 30 + rng.uniform(-0.004, 0.004), pan=0.1)
for i in range(45):
    add(click(), 24.5 + i / 34 + rng.uniform(-0.004, 0.004), pan=0.1)
add(ping(88), 26.0); add(ping(93), 26.12)     # 安装成功
add(whoosh(1.2), 26.6, gain=0.55)
add(impact(), 27.85, gain=0.8)                # 结尾图标回归

# ---------- 简易混响 + 母带 ----------
def reverb(x):
    out = x.copy()
    for d, g in ((0.031, 0.35), (0.047, 0.3), (0.071, 0.25), (0.113, 0.2), (0.167, 0.15)):
        k = int(d * SR); out[k:] += x[:-k] * g
    return out
L = reverb(L); R = reverb(R[::-1])[::-1] * 0 + reverb(R)
fade = np.clip((DUR - t_all) / 1.2, 0, 1)
L *= fade; R *= fade
mix = np.stack([L, R], 1)
mix = np.tanh(mix * 1.1)
mix /= max(1e-9, np.abs(mix).max()) / 0.89
pcm = (mix * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', sys.argv[1])
