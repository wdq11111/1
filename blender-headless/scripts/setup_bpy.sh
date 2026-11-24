#!/usr/bin/env bash
# 装 pip 版 Blender（bpy）到独立虚拟环境，并做一次真实渲染自检。可重复运行，装过就跳过。
#
# 用法：bash setup_bpy.sh [--with-gl]
#   --with-gl  另外用 apt 装 Mesa 软件渲染驱动（EGL + Vulkan/llvmpipe），
#              这样 Workbench（秒级预览）和 EEVEE 也能用；不加只有 Cycles。
# 环境变量：BPY_VENV  虚拟环境位置，默认 ~/.venvs/bpy
#
# 结束时打印一行 "BPY_PYTHON=<路径>"，之后都用这个解释器跑场景脚本。
set -euo pipefail

VENV="${BPY_VENV:-$HOME/.venvs/bpy}"
WITH_GL=0
for a in "$@"; do [[ "$a" == "--with-gl" ]] && WITH_GL=1; done
say() { echo "[setup_bpy] $*"; }

# ---------- 1. 装 bpy ----------
if [[ -x "$VENV/bin/python" ]] && "$VENV/bin/python" -c "import bpy" >/dev/null 2>&1; then
  say "bpy 已装在 $VENV，跳过安装"
else
  # bpy 的 wheel 只对应一个 Python 小版本（5.x 是 cp313，4.x 是 cp311），先问 PyPI 要哪个
  case "$(uname -s)-$(uname -m)" in
    Linux-x86_64)  PLAT=manylinux ARCH=x86_64 ;;
    Darwin-arm64)  PLAT=macosx    ARCH=arm64 ;;
    *) say "PyPI 上的 bpy 只有 Linux x86_64 / macOS arm64 / Windows 的包，当前平台 $(uname -s)-$(uname -m) 装不了"; exit 1 ;;
  esac
  PYVER=$(curl -fsSL https://pypi.org/pypi/bpy/json 2>/dev/null | python3 -c "
import json, re, sys
d = json.load(sys.stdin)
for f in d['urls']:
    n = f['filename']
    if '$PLAT' in n and n.endswith('$ARCH.whl'):
        m = re.search(r'-cp(\d)(\d+)-', n); print(f'{m.group(1)}.{m.group(2)}'); break
" 2>/dev/null || true)
  PYVER="${PYVER:-3.13}"
  say "最新 bpy 需要 Python $PYVER"

  PY=""
  for c in "python$PYVER" "/usr/bin/python$PYVER" "/usr/local/bin/python$PYVER"; do
    if command -v "$c" >/dev/null 2>&1; then PY="$(command -v "$c")"; break; fi
  done
  if [[ -z "$PY" ]] && command -v uv >/dev/null 2>&1; then
    say "系统里没有 Python $PYVER，用 uv 下载一个"
    uv python install "$PYVER" >/dev/null && PY="$(uv python find "$PYVER")"
  fi
  [[ -n "$PY" ]] || { say "找不到 Python $PYVER，先装它（apt install python$PYVER 或 uv python install $PYVER）"; exit 1; }

  mkdir -p "$(dirname "$VENV")"
  if command -v uv >/dev/null 2>&1; then
    uv venv -q --allow-existing "$VENV" --python "$PY"
    VIRTUAL_ENV="$VENV" uv pip install -q bpy
  else
    "$PY" -m venv "$VENV"
    "$VENV/bin/pip" install -q bpy
  fi
fi

# ---------- 2. 可选：软件 GL/Vulkan 驱动 ----------
if [[ $WITH_GL -eq 1 ]]; then
  if command -v apt-get >/dev/null 2>&1; then
    SUDO=""; [[ $(id -u) -ne 0 ]] && SUDO="sudo"
    say "安装 Mesa 软件渲染驱动（EGL + Vulkan llvmpipe）"
    $SUDO apt-get update -qq >/dev/null 2>&1 || true
    DEBIAN_FRONTEND=noninteractive $SUDO apt-get install -y -qq \
      libegl1 libegl-mesa0 libgl1-mesa-dri libgl1 libvulkan1 mesa-vulkan-drivers >/dev/null
  else
    say "没有 apt-get，跳过 GL 驱动；只能用 Cycles"
  fi
fi

# ---------- 3. 自检：真渲一张小图 ----------
CHECK_DIR="$(mktemp -d)"
cat > "$CHECK_DIR/check.py" <<'EOF'
import bpy, sys, os
out, engine = sys.argv[-2], sys.argv[-1]
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
bpy.ops.mesh.primitive_cube_add()
bpy.ops.object.light_add(type="SUN", rotation=(0.6, 0.2, 0.5))
bpy.ops.object.camera_add(location=(5, -5, 4), rotation=(1.1, 0, 0.785))
sc.camera = bpy.context.object
sc.render.engine = engine
if engine == "CYCLES":
    sc.cycles.device = "CPU"; sc.cycles.samples = 4
sc.render.resolution_x = sc.render.resolution_y = 64
sc.render.filepath = out
bpy.ops.render.render(write_still=True)
print("CHECK_OK", bpy.app.version_string, engine, os.path.getsize(out))
EOF
"$VENV/bin/python" "$CHECK_DIR/check.py" "$CHECK_DIR/c.png" CYCLES 2>&1 | grep -q CHECK_OK \
  && say "Cycles 自检通过" || { say "Cycles 自检失败，手动跑 $CHECK_DIR/check.py 看报错"; exit 1; }

rm -f "$VENV/.gl_ok"
if [[ $WITH_GL -eq 1 ]]; then
  # GPU 初始化失败时 Blender 会直接退出进程，所以放在子进程里试
  if timeout 120 "$VENV/bin/python" "$CHECK_DIR/check.py" "$CHECK_DIR/w.png" BLENDER_WORKBENCH 2>&1 | grep -q CHECK_OK; then
    touch "$VENV/.gl_ok"; say "Workbench/EEVEE 可用（软件渲染）"
  else
    say "Workbench 自检失败，EEVEE/Workbench 不可用，继续用 Cycles"
  fi
fi
rm -rf "$CHECK_DIR"

say "$("$VENV/bin/python" -c 'import bpy; print("bpy", bpy.app.version_string)' 2>/dev/null)"
echo "BPY_PYTHON=$VENV/bin/python"
