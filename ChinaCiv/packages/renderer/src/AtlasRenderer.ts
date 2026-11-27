import * as T from 'three';
import type { CameraView, Lens, RenderStats, RenderView } from '../../core-types/src/map';
import { applyLens, drawBanners, drawOverlay, drawRail, drawRoads, drawStatic, OCEAN_BG, prepareNetwork, spriteStats,
  warmSprites, type BannerHit, type StaticViewport } from './usaciv/index';
import { buildUsaScene, type UsaCity, type UsaScene } from './usacivWorld';

export function getCapabilities(gl: WebGL2RenderingContext) {
  const debug = gl.getExtension('WEBGL_debug_renderer_info');
  return {
    webgl2: true,
    gpu: debug ? String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER)),
    maxTextureSize: Number(gl.getParameter(gl.MAX_TEXTURE_SIZE)),
    maxArrayLayers: Number(gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS)),
    maxTextureUnits: Number(gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS)),
    maxCombinedUnits: Number(gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS)),
    maxRenderbufferSize: Number(gl.getParameter(gl.MAX_RENDERBUFFER_SIZE)),
    maxViewport: Array.from(gl.getParameter(gl.MAX_VIEWPORT_DIMS) as Int32Array),
    highp: gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT)?.precision ?? 0,
    highpIntRange: gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_INT)?.rangeMax ?? 0,
  };
}

/** A USACiv-style camera (km, y down, `scale` css px per km) for a ChinaCiv CameraView (metres, y up). */
export interface UsaCamera {
  x: number; y: number; scale: number; w: number; h: number;
  toScreen(x: number, y: number): [number, number];
  toWorld(sx: number, sy: number): [number, number];
  view(): { x0: number; y0: number; x1: number; y1: number };
}
export function usaCamera(scene: UsaScene, view: CameraView, w: number, h: number): UsaCamera {
  const [x, y] = scene.toKm([view.x, view.y]);
  const scale = w / (view.width / 1000);
  return {
    x, y, scale, w, h,
    toScreen: (px, py) => [(px - x) * scale + w / 2, (py - y) * scale + h / 2],
    toWorld: (sx, sy) => [(sx - w / 2) / scale + x, (sy - h / 2) / scale + y],
    view: () => ({ x0: x - w / 2 / scale, y0: y - h / 2 / scale, x1: x + w / 2 / scale, y1: y + h / 2 / scale }),
  };
}

export interface AtlasOptions {
  lens: Lens; grid: boolean; routes: boolean; names: boolean;
  selectedCity: number | null; selectedCell: number; hoverCell: number;
  /** Banners stay left of this css x (an open details panel), like USACiv's bannerBounds. */
  bannerRight: number | null;
}

export interface AtlasStats extends RenderStats {
  staticMs: number; staticPaints: number; cells: number; banners: number; spriteCache: number; lod: string;
}

const CACHE_MARGIN = 160; // css px painted beyond each edge, so short pans are a camera move, not a repaint
const PAN_LEAD = 0.6;
const SETTLE_MS = 140; // a zoom repaints once the camera has been still this long

export class AtlasRenderer {
  private readonly renderer: T.WebGLRenderer;
  private readonly scene3 = new T.Scene();
  private readonly camera = new T.OrthographicCamera(-1, 1, 1, -1, .1, 100);
  private readonly material: T.MeshBasicMaterial;
  private readonly plane: T.Mesh;
  private texture: T.CanvasTexture | null = null;
  private readonly cache = { cv: document.createElement('canvas'), vp: null as (StaticViewport & { cssW: number; cssH: number }) | null, key: '' };
  private readonly cctx: CanvasRenderingContext2D;
  private readonly octx: CanvasRenderingContext2D;
  private readonly net;
  private readonly layers;
  private opts: AtlasOptions = { lens: 'terrain', grid: true, routes: true, names: true, selectedCity: null, selectedCell: -1, hoverCell: -1, bannerRight: null };
  private appliedLens: Lens | null = null;
  private cssWidth = 0;
  private cssHeight = 0;
  private dpr = 1;
  private settleTimer = 0;
  private last: { view: CameraView; w: number; h: number } | null = null;
  private staticPaints = 0;
  private staticMs = 0;
  private cells = 0;
  readonly scene: UsaScene;
  readonly capabilities;
  /** Bumped whenever the cell colours change (lens), so the minimap can rebuild. */
  colorsVersion = 0;
  hits: BannerHit[] = [];
  lost = false;
  stats: AtlasStats | null = null;

  constructor(readonly canvas: HTMLCanvasElement, readonly overlay: HTMLCanvasElement, view: RenderView | UsaScene,
    private readonly onContext: (lost: boolean) => void, private readonly onFrame?: () => void) {
    const context = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false,
      stencil: false, powerPreference: 'high-performance', preserveDrawingBuffer: false });
    if (!context) throw new Error('此浏览器无法创建 WebGL2 上下文。');
    this.capabilities = getCapabilities(context);
    if (this.capabilities.maxTextureSize < 4096 || !this.capabilities.highp || !this.capabilities.highpIntRange) {
      throw new Error('此设备的 WebGL2 纹理尺寸或片元精度低于原型要求。');
    }
    this.scene = 'w' in view ? view : buildUsaScene(view);
    this.renderer = new T.WebGLRenderer({ canvas, context });
    this.renderer.info.autoReset = false;
    this.renderer.setClearColor(new T.Color(OCEAN_BG));
    this.camera.position.z = 10;
    this.material = new T.MeshBasicMaterial({ toneMapped: false });
    this.plane = new T.Mesh(new T.PlaneGeometry(1, 1), this.material);
    this.plane.visible = false;
    this.scene3.add(this.plane);
    this.cctx = this.cache.cv.getContext('2d')!;
    this.octx = overlay.getContext('2d')!;
    this.net = prepareNetwork(this.scene.w, this.scene.infra);
    this.layers = [{
      id: 'routes', z: 55, visible: () => this.opts.routes,
      draw: (ctx: CanvasRenderingContext2D, vp: StaticViewport, _w: unknown, o: unknown) => { drawRoads(ctx, this.net, vp, o); drawRail(ctx, this.net, vp, o); },
    }];
    applyLens(this.scene.w, null);
    this.onLost = (event: Event) => { event.preventDefault(); this.lost = true; this.stats = null; onContext(true); };
    this.onRestored = () => {
      this.lost = false;
      if (this.texture) this.texture.needsUpdate = true;
      onContext(false);
    };
    canvas.addEventListener('webglcontextlost', this.onLost);
    canvas.addEventListener('webglcontextrestored', this.onRestored);
  }
  private readonly onLost: (event: Event) => void;
  private readonly onRestored: () => void;

  setOptions(next: Partial<AtlasOptions>) {
    this.opts = { ...this.opts, ...next };
    if (this.appliedLens !== this.opts.lens) {
      applyLens(this.scene.w, this.opts.lens === 'terrain' ? null : this.scene.lenses[this.opts.lens]);
      this.appliedLens = this.opts.lens;
      this.colorsVersion++;
    }
  }

  get selectedUsaCity(): UsaCity | null {
    return this.opts.selectedCity === null ? null : this.scene.cityById[this.opts.selectedCity] ?? null;
  }

  private cacheKey() {
    const o = this.opts;
    return `${o.lens}|${o.grid ? 1 : 0}|${o.routes ? 1 : 0}|${o.names ? 1 : 0}|${o.selectedCity ?? ''}|${this.dpr}|${this.cssWidth}x${this.cssHeight}`;
  }

  private paintStatic(cam: UsaCamera, lead: [number, number] | null) {
    const t0 = performance.now();
    const s = cam.scale, v = cam.view(), m = CACHE_MARGIN / s;
    const ox = lead ? lead[0] * PAN_LEAD * m : 0, oy = lead ? lead[1] * PAN_LEAD * m : 0;
    const vp = { x0: v.x0 - m + ox, y0: v.y0 - m + oy, x1: v.x1 + m + ox, y1: v.y1 + m + oy, s, dpr: this.dpr,
      cssW: cam.w + 2 * CACHE_MARGIN, cssH: cam.h + 2 * CACHE_MARGIN };
    const W = Math.ceil(vp.cssW * this.dpr), H = Math.ceil(vp.cssH * this.dpr);
    if (this.cache.cv.width !== W || this.cache.cv.height !== H) {
      this.cache.cv.width = W; this.cache.cv.height = H;
      this.texture?.dispose();
      this.texture = null;
    }
    drawStatic(this.cctx, vp, this.scene.w, {
      lens: this.opts.lens === 'terrain' ? null : this.scene.lenses[this.opts.lens], showResources: false,
      selectedCity: this.selectedUsaCity, layers: this.layers, grid: this.opts.grid, labels: this.opts.names,
    });
    if (!this.texture) {
      this.texture = new T.CanvasTexture(this.cache.cv);
      this.texture.colorSpace = T.SRGBColorSpace;
      this.texture.generateMipmaps = false;
      this.texture.minFilter = T.LinearFilter;
      this.texture.magFilter = T.LinearFilter;
      this.material.map = this.texture;
      this.material.needsUpdate = true;
    } else this.texture.needsUpdate = true;
    this.cache.vp = vp;
    this.cache.key = this.cacheKey();
    const r = this.scene.w.grid.range(vp.x0, vp.y0, vp.x1, vp.y1);
    this.cells = (r.r1 - r.r0 + 1) * (r.c1 - r.c0 + 1);
    this.staticPaints++;
    this.staticMs = performance.now() - t0;
  }

  /** Draws the frame. `settled` forces the static layer to the exact zoom (used by the settle timer and exports). */
  render(view: CameraView, width: number, height: number, settled = false) {
    if (this.lost || width <= 0 || height <= 0) return;
    const start = performance.now();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    if (dpr !== this.dpr || width !== this.cssWidth || height !== this.cssHeight) {
      this.renderer.setPixelRatio(dpr);
      this.renderer.setSize(width, height, false);
      this.overlay.width = Math.round(width * dpr);
      this.overlay.height = Math.round(height * dpr);
      this.dpr = dpr; this.cssWidth = width; this.cssHeight = height;
    }
    this.last = { view, w: width, h: height };
    const cam = usaCamera(this.scene, view, width, height);
    const v = cam.view(), c = this.cache.vp;
    const sameKey = c !== null && this.cache.key === this.cacheKey();
    const covers = sameKey && v.x0 >= c.x0 && v.y0 >= c.y0 && v.x1 <= c.x1 && v.y1 <= c.y1;
    const ratio = c ? cam.scale / c.s : 1;
    if (!covers || ratio > 2 || ratio < 0.5 || (settled && Math.abs(ratio - 1) > 1e-3)) {
      const pan: [number, number] | null = sameKey && c && cam.scale === c.s
        ? [v.x0 < c.x0 ? -1 : v.x1 > c.x1 ? 1 : 0, v.y0 < c.y0 ? -1 : v.y1 > c.y1 ? 1 : 0] : null;
      this.paintStatic(cam, pan);
    }
    clearTimeout(this.settleTimer);
    if (this.cache.vp && Math.abs(cam.scale / this.cache.vp.s - 1) > 1e-3) {
      this.settleTimer = window.setTimeout(() => {
        if (this.last) { this.render(this.last.view, this.last.w, this.last.h, true); this.onFrame?.(); }
      }, SETTLE_MS);
    }

    // GPU: the cached static layer is a textured quad in km space; the orthographic camera does pan and zoom.
    const vp = this.cache.vp!;
    this.plane.visible = true;
    this.plane.position.set((vp.x0 + vp.x1) / 2, -(vp.y0 + vp.y1) / 2, 0);
    this.plane.scale.set(vp.x1 - vp.x0, vp.y1 - vp.y0, 1);
    const halfW = width / 2 / cam.scale, halfH = height / 2 / cam.scale;
    this.camera.left = -halfW; this.camera.right = halfW; this.camera.top = halfH; this.camera.bottom = -halfH;
    this.camera.position.set(cam.x, -cam.y, 10);
    this.camera.updateProjectionMatrix();
    this.renderer.info.reset();
    this.renderer.render(this.scene3, this.camera);

    // 2D overlay: hover / selection outlines (world units), then the city banners (screen px), as in USACiv.
    const ctx = this.octx, k = this.dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);
    ctx.setTransform(k * cam.scale, 0, 0, k * cam.scale, k * (width / 2 - cam.x * cam.scale), k * (height / 2 - cam.y * cam.scale));
    drawOverlay(ctx, cam, this.scene.w, { selectedState: null, selectedCity: this.selectedUsaCity, hoverCell: this.opts.hoverCell,
      selectedCell: this.opts.selectedCell }, 0);
    if (this.opts.selectedCell >= 0 && this.opts.selectedCity === null) this.outlineCell(ctx, this.opts.selectedCell, cam.scale);
    ctx.setTransform(k, 0, 0, k, 0, 0);
    this.hits = this.opts.names ? drawBanners(ctx, cam, this.scene.w, {
      cities: this.scene.cities, selectedCity: this.selectedUsaCity, hoverCell: this.opts.hoverCell,
      bannerBounds: this.opts.bannerRight !== null ? { x0: 0, x1: this.opts.bannerRight } : null,
    }, this.scene.yields, this.scene.nation) : [];
    const sprites = spriteStats();
    this.stats = { frameMs: performance.now() - start, drawCalls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles, instances: this.cells,
      textureBytes: this.cache.cv.width * this.cache.cv.height * 4, bufferWidth: this.canvas.width, bufferHeight: this.canvas.height,
      staticMs: this.staticMs, staticPaints: this.staticPaints, cells: this.cells, banners: this.hits.length,
      spriteCache: sprites.count, lod: this.scene.w.grid.R * cam.scale < 10 ? 'far' : this.scene.w.grid.R * cam.scale < 22 ? 'mid'
        : this.scene.w.grid.R * cam.scale < 44 ? 'near' : 'close' };
  }

  /** The selected plain tile: USACiv's gold selection ring. */
  private outlineCell(ctx: CanvasRenderingContext2D, cell: number, s: number) {
    const g = this.scene.w.grid, x = g.cx(cell), y = g.cy(cell);
    ctx.beginPath();
    g.corners.forEach(([cx, cy], k) => ctx[k ? 'lineTo' : 'moveTo'](x + cx, y + cy));
    ctx.closePath();
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(255,214,110,.5)';
    ctx.lineWidth = Math.max(5 / s, g.R * 0.16);
    ctx.stroke();
    ctx.strokeStyle = '#ffe9a8';
    ctx.lineWidth = Math.max(2 / s, g.R * 0.05);
    ctx.stroke();
  }

  /** Paint sprite caches for the next zoom steps in idle time (USACiv's warm-up), so wheel zooms land on warm caches. */
  warm(view: CameraView, width: number, height: number) {
    for (const f of [1.25, 0.8]) {
      const cam = usaCamera(this.scene, { ...view, width: view.width / f }, width, height);
      const v = cam.view();
      const scratch = document.createElement('canvas');
      scratch.width = scratch.height = 8;
      warmSprites(scratch.getContext('2d')!, { ...v, s: cam.scale, dpr: this.dpr }, this.scene.w, { lens: null, layers: this.layers });
    }
  }

  /** The current frame (map + banners) composited into one 2D canvas, for PNG export. */
  snapshot(view: CameraView, width: number, height: number) {
    this.render(view, width, height, true);
    const out = document.createElement('canvas');
    out.width = this.canvas.width; out.height = this.canvas.height;
    const ctx = out.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(this.canvas, 0, 0);
    ctx.drawImage(this.overlay, 0, 0, out.width, out.height);
    return { canvas: out, ctx, scale: out.width / width };
  }

  dispose() {
    clearTimeout(this.settleTimer);
    this.canvas.removeEventListener('webglcontextlost', this.onLost);
    this.canvas.removeEventListener('webglcontextrestored', this.onRestored);
    this.texture?.dispose(); this.material.dispose(); this.plane.geometry.dispose(); this.renderer.dispose();
  }
}
