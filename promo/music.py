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

# ---------- 更多乐器 ----------
def snare():
    n = int(0.2 * SR); x = np.arange(n) / SR
    body = np.sin(2 * np.pi * 190 * x) * np.exp(-x * 30) * 0.5
    noise = np.diff(rng.standard_normal(n), prepend=0) * np.exp(-x * 22) * 0.35
    return (body + noise) * 0.5

def lead(m, dur, g=0.13):
    n = int(dur * SR); x = np.arange(n) / SR
    f = note_hz(m) * (1 + 0.006 * np.sin(2 * np.pi * 5.5 * x) * np.clip(x / 0.25, 0, 1))
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sign(np.sin(ph)) * 0.35 + np.sin(ph) * 0.65
    s = lowpass(s, 3200)
    e = env(n, 0.01, dur, sustain=0.75, curve=2) * np.clip((dur - x) / 0.06, 0, 1)
    return s * e * g

def bell(m, dur=1.6, g=0.13):
    n = int(dur * SR); x = np.arange(n) / SR
    f = note_hz(m)
    s = np.sin(2 * np.pi * f * x + 1.8 * np.sin(2 * np.pi * f * 3.5 * x) * np.exp(-x * 3))
    return s * np.exp(-x * 2.2) * g

def reverse_cymbal(dur=1.0):
    n = int(dur * SR)
    s = np.diff(rng.standard_normal(n), prepend=0)
    return s * (np.arange(n) / n) ** 3 * 0.35

# ---------- 编曲：跟着画面分段 ----------
# 和弦表：(开始, 结束, 和弦三音, 贝斯根音)
CH = {
    'Am': ([57, 60, 64], 45), 'F': ([53, 57, 60], 41), 'G': ([55, 59, 62], 43), 'C': ([55, 60, 64], 48),
    'Bm': ([59, 62, 66], 47), 'A': ([57, 61, 64], 45), 'D': ([57, 62, 66], 38),
}
chart = [
    (0.0, 4.5, 'Am'),                                   # 开场
    (4.5, 6.5, 'F'), (6.5, 9.0, 'G'),                   # 原文卡
    (9.0, 11.0, 'Am'), (11.0, 13.0, 'F'), (13.0, 15.0, 'C'), (15.0, 17.0, 'G'),  # 多引擎
    (17.0, 19.5, 'F'), (19.5, 22.0, 'G'),               # 推荐（breakdown）
    (22.0, 24.0, 'Bm'), (24.0, 26.0, 'G'), (26.0, 27.0, 'A'),  # 终端（升一个全音）
    (27.0, 30.0, 'D'),                                  # 结尾落在大三和弦
]
def chord_at(t):
    for a, b, c in chart:
        if a <= t < b: return CH[c]
    return CH['D']

for a, b, c in chart:
    notes, _ = CH[c]
    g = 0.5 if a < 1.8 else (1.1 if 17.0 <= a < 22.0 else 0.85)
    if c == 'D': notes = notes + [notes[0] + 12]
    add(pad(notes, b - a + 0.45), a, gain=g)

beats = lambda a, b, step=BEAT: [a + i * step for i in range(int(round((b - a) / step)))]

# --- 鼓 ---
for tb in beats(1.8, 4.5):                       # 开场：四拍底鼓
    add(kick(), tb, 0.9); add(hat(), tb + BEAT / 2, 0.7, 0.3)
for i, tb in enumerate(beats(4.5, 8.5)):         # 原文卡：半拍感
    if i % 4 == 0: add(kick(), tb, 0.9)
    if i % 4 == 2: add(clap(), tb, 0.8)
    add(hat(), tb + BEAT / 2, 0.5, 0.3)
for k in range(8):                               # 过门：军鼓加速
    add(snare(), 8.5 + k * BEAT / 8, 0.35 + k * 0.07)
for i, tb in enumerate(beats(9.0, 16.5)):        # 多引擎：完整律动
    add(kick(), tb, 1.0)
    if i % 2 == 1: add(clap(), tb, 1.0)
    if tb < 13.0: add(hat(), tb + BEAT / 2, 0.8, 0.3)
    else:
        for q in range(4): add(hat(), tb + q * BEAT / 4, 0.5 if q % 2 == 0 else 0.8, 0.3)
    if i % 4 == 3: add(hat(True), tb + BEAT * 0.5, 0.6, -0.3)
for k in range(4): add(snare(), 16.5 + k * BEAT / 4, 0.5 + k * 0.1)
# 推荐段：只有铺底和钟声，最后一秒加速军鼓推上去
for k in range(16): add(snare(), 21.0 + k * BEAT / 8, 0.15 + k * 0.035)
for i, tb in enumerate(beats(22.0, 26.9)):       # 终端：切分底鼓 + 16 分音符踩镲
    add(kick(), tb, 1.0)
    if i % 4 == 3: add(kick(), tb + BEAT * 0.75, 0.7)
    if i % 2 == 1: add(clap(), tb, 1.0)
    for q in range(4): add(hat(), tb + q * BEAT / 4, 0.45 if q % 2 == 0 else 0.75, 0.3)
add(reverse_cymbal(1.0), 8.0, 0.8)
add(reverse_cymbal(1.0), 21.0, 0.9)
add(reverse_cymbal(1.2), 26.65, 0.9)

# --- 贝斯 ---
for tb in beats(4.5, 9.0):                       # 四分音符长音
    add(bass(chord_at(tb)[1], BEAT * 0.95), tb, 0.85)
for i, tb in enumerate(beats(9.0, 17.0, BEAT / 2)):   # 八分音符八度跳
    r = chord_at(tb)[1]
    add(bass(r if i % 2 == 0 else r + 12, BEAT / 2 * 0.9), tb, 0.9)
for a, b, c in chart:                            # 推荐段：长低音
    if 17.0 <= a < 22.0: add(bass(CH[c][1] - 12, b - a), a, 0.7)
for tb in beats(22.0, 27.0, BEAT):               # 终端：切分
    r = chord_at(tb)[1]
    for off, d, o in ((0, 0.6, 0), (0.75, 0.25, 12), (1.5, 0.4, 0)):
        if tb + off * BEAT < 27.0: add(bass(r + o, d * BEAT), tb + off * BEAT, 0.9)

# --- 琶音 ---
def arp(a, b, step, octave, g):
    for i, tb in enumerate(beats(a, b, step)):
        notes = chord_at(tb)[0]
        seq = [notes[0], notes[1], notes[2], notes[1] + 12]
        add(pluck(seq[i % 4] + octave, 0.35, g), tb, pan=-0.4 if i % 2 else 0.4)
arp(1.8, 4.5, BEAT / 2, 12, 0.07)
arp(4.5, 9.0, BEAT / 4, 12, 0.05)
arp(22.0, 27.0, BEAT / 4, 24, 0.05)

# --- 主旋律（多引擎段）---
phrase = [  # (拍, 音高, 时值拍)
    (0, 76, 1), (1, 79, 0.5), (1.5, 81, 1.5), (3, 79, 0.5), (3.5, 76, 0.5),
    (4, 77, 1), (5, 72, 1), (6, 69, 2),
    (8, 79, 1), (9, 76, 0.5), (9.5, 72, 1), (10.5, 74, 1.5),
    (12, 79, 1), (13, 83, 1), (14, 86, 1), (15, 79, 1),
]
for b0, m, d in phrase:
    add(lead(m, d * BEAT * 0.95), 9.0 + b0 * BEAT, pan=0.1)

# --- 钟声旋律（推荐段）---
for tt, m in ((17.0, 69), (17.75, 72), (18.5, 77), (19.5, 74), (20.25, 79), (21.0, 83), (21.5, 86)):
    add(bell(m, 1.8, 0.12), tt, pan=0.2)

# --- 结尾：大三和弦琶音 + 钟声 ---
for k, m in enumerate([62, 66, 69, 74, 78]):
    add(bell(m, 2.2, 0.1), 27.9 + k * 0.12, pan=-0.3 + k * 0.15)

# ---------- 音效（与画面对齐）----------
add(whoosh(1.5), 0.25, gain=0.6)              # 两块板飞入
add(impact(), 1.75, gain=0.9)                 # 合体落定
add(whoosh(0.9), 4.4, gain=0.45, pan=-0.4)    # 图标退场、原文卡进场
add(whoosh(1.0), 8.9, gain=0.5, pan=0.4)      # 卡片展开
for i in range(8):                            # 8 张引擎卡片依次入场
    add(pluck(64 + [0, 3, 7, 10, 12, 15, 19, 22][i], 0.4, 0.06), 9.45 + i * 0.12, pan=0.5)
for i in range(8):                            # 各引擎完成的“叮”
    st = 11.0 + jsrand(i + 50) * 1.0
    du = 0.9 + jsrand(i + 80) * 1.4
    add(ping(84 + [0, 2, 4, 7, 9, 12, 14, 16][i]), st + du + 0.36, gain=0.8, pan=0.35)
add(whoosh(1.2), 16.6, gain=0.5)              # 转场到推荐卡
add(impact(), 18.1, gain=0.45)
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
L = reverb(L); R = reverb(R)
fade = np.clip((DUR - t_all) / 1.2, 0, 1)
L *= fade; R *= fade
mix = np.stack([L, R], 1)
mix = np.tanh(mix * 1.1)
mix /= max(1e-9, np.abs(mix).max()) / 0.89
pcm = (mix * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', sys.argv[1])
