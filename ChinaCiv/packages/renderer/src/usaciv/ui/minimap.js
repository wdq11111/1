// Minimap: a pre-rendered thumbnail of the current colours + the camera's view box.
export class Minimap {
  constructor(canvas, world, camera, onJump) {
    this.canvas = canvas;
    this.w = world;
    this.cam = camera;
    const W = 230;
    this.k = W / world.raw.width;
    this.cssW = W;
    this.cssH = Math.round(world.raw.height * this.k);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = this.cssW * dpr;
    canvas.height = this.cssH * dpr;
    canvas.style.width = this.cssW + "px";
    canvas.style.height = this.cssH + "px";
    this.dpr = dpr;
    this.base = document.createElement("canvas");
    this.base.width = canvas.width;
    this.base.height = canvas.height;

    let dragging = false;
    const jump = (e) => {
      const r = canvas.getBoundingClientRect();
      onJump((e.clientX - r.left) / this.k, (e.clientY - r.top) / this.k);
    };
    canvas.addEventListener("pointerdown", (e) => { dragging = true; canvas.setPointerCapture(e.pointerId); jump(e); });
    canvas.addEventListener("pointermove", (e) => dragging && jump(e));
    canvas.addEventListener("pointerup", () => (dragging = false));
  }

  rebuild() {
    const g = this.w.grid;
    const ctx = this.base.getContext("2d");
    const k = this.k * this.dpr;
    ctx.fillStyle = "#0d2a47";
    ctx.fillRect(0, 0, this.base.width, this.base.height);
    const cw = g.W * k + 1, ch = g.H * k + 1;
    for (let i = 0; i < g.size; i++) {
      ctx.fillStyle = this.w.colors[i];
      ctx.fillRect((g.cx(i) - g.W / 2) * k, (g.cy(i) - g.H / 2) * k, cw, ch);
    }
    this.sig = "";
    this.draw();
  }

  // Called every map frame: repaints only when the view box moved (or rebuild() changed the thumbnail).
  draw() {
    const v = this.cam.view();
    const sig = `${v.x0},${v.y0},${v.x1},${v.y1}`;
    if (sig === this.sig) return;
    this.sig = sig;
    const ctx = this.canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(this.base, 0, 0);
    const k = this.k * this.dpr;
    ctx.strokeStyle = "#ffe9a8";
    ctx.lineWidth = 1.5 * this.dpr;
    ctx.strokeRect(v.x0 * k, v.y0 * k, (v.x1 - v.x0) * k, (v.y1 - v.y0) * k);
  }
}
