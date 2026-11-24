#!/usr/bin/env bash
# 收尾：响度标准化（-16 LUFS / -1.5 dBTP）→ 合成成片 → 导出字幕和封面
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out

# 两遍 loudnorm
stats=$(ffmpeg -hide_banner -nostats -i build/mix.wav -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$stats" | python3 -c "import json,sys; print(json.load(sys.stdin)['$1'])"; }
ffmpeg -y -loglevel error -i build/mix.wav -af "loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true" -ar 48000 build/mix_norm.wav

ffmpeg -y -loglevel error -i build/video.mp4 -i build/mix_norm.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart out/next-opus.mp4

# 字幕
python3 - <<'EOF'
import json
tl = json.load(open("build/timeline.json"))
def ts(t):
    ms = int(round(t * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"
subs = [s for sc in tl["scenes"] for s in sc["subs"]]
with open("out/next-opus.srt", "w", encoding="utf-8") as f:
    for i, s in enumerate(subs, 1):
        f.write(f"{i}\n{ts(s['start'])} --> {ts(s['end'] + 0.15)}\n{s['text']}\n\n")
print(len(subs), "条字幕")
EOF

# 封面：片名定格帧
ffmpeg -y -loglevel error -ss 15.2 -i build/video.mp4 -frames:v 1 out/cover.png
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of compact out/next-opus.mp4
