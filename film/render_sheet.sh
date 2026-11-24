#!/usr/bin/env bash
# 渲染四个角色的设定图素材（正面 / 3/4 / 脸部特写），再拼版。
set -e
cd "$(dirname "$0")"
OUT=${1:-../renders/sheet_src}
H=${2:-1600}
SPP=${3:-24}
PY=${BPY_PYTHON:-$HOME/.venvs/bpy/bin/python}
mkdir -p "$OUT"
for k in gpt gem cla ds; do
  $PY sheet.py $k "$OUT" $H $SPP front,q34,face 2>&1 | grep -e "\[sheet\]" -e Error -e Traceback || true
done
$PY compose_sheet.py "$OUT" ../renders
