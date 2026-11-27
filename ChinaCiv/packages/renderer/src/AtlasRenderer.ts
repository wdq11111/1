import * as T from 'three';
import type { CameraView, Lens, Point, RenderStats, RenderView, TileId } from '../../core-types/src/map';
import { makeTerrain } from './terrain';
import { makeSprites } from './sprites';
import { makeLineBatch } from './lines';

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

export class AtlasRenderer {
  private readonly renderer: T.WebGLRenderer;
  private readonly scene = new T.Scene();
  private readonly camera = new T.OrthographicCamera(-1, 1, 1, -1, .1, 100);
  private readonly terrain;
  private readonly sprites;
  private readonly lines;
  private readonly routes;
  private cssWidth = 0;
  private cssHeight = 0;
  private pixelRatio = 0;
  readonly capabilities;
  lost = false;
  stats: RenderStats | null = null;

  constructor(readonly canvas: HTMLCanvasElement, view: RenderView, onContext: (lost: boolean) => void) {
    const context = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false,
      stencil: false, powerPreference: 'high-performance' });
    if (!context) throw new Error('此浏览器无法创建 WebGL2 上下文。');
    this.capabilities = getCapabilities(context);
    if (this.capabilities.maxTextureSize < 4096 || !this.capabilities.highp || !this.capabilities.highpIntRange) {
      throw new Error('此设备的 WebGL2 纹理尺寸或片元精度低于原型要求。');
    }
    this.renderer = new T.WebGLRenderer({ canvas, context });
    this.renderer.info.autoReset = false;
    this.renderer.setClearColor(new T.Color('#305962'));
    this.camera.position.z = 10;
    this.terrain = makeTerrain(view);
    this.sprites = makeSprites(view);
    const paths = (mode: 'rail' | 'road'): readonly (readonly Point[])[] =>
      view.network.filter(line => line.mode0 === mode).map(line => line.points);
    this.routes = [
      makeLineBatch(paths('road'), '8a7454', 3, 0, 5),
      makeLineBatch(paths('road'), 'e9d398', 1.9, 0, 6),
      makeLineBatch(paths('rail'), '77564a', 3.5, 0, 7),
      makeLineBatch(paths('rail'), 'efcf87', 2.1, 8, 8),
    ];
    this.lines = [makeLineBatch([view.rivers[0]], 'aad1b9', 6.7, 0, 3),
      makeLineBatch(view.rivers, '4f9da3', 4.2, 0, 4), ...this.routes];
    this.scene.add(this.terrain.mesh, this.sprites.mesh, ...this.lines.map(line => line.mesh));
    this.onLost = (event: Event) => { event.preventDefault(); this.lost = true; this.stats = null; onContext(true); };
    this.onRestored = () => { this.lost = false; onContext(false); };
    canvas.addEventListener('webglcontextlost', this.onLost);
    canvas.addEventListener('webglcontextrestored', this.onRestored);
  }
  private readonly onLost: (event: Event) => void;
  private readonly onRestored: () => void;
  setOptions(lens: Lens, grid: boolean, routes: boolean, selected: TileId | null, hover: TileId | null) {
    this.terrain.setLens(lens);
    this.terrain.setGrid(grid);
    this.terrain.setSelection(selected);
    this.terrain.setHover(hover);
    this.sprites.setLensOpacity(lens === 'terrain');
    this.routes.forEach(line => { line.mesh.visible = routes; });
  }
  render(view: CameraView, width: number, height: number) {
    if (this.lost || width <= 0 || height <= 0) return;
    const start = performance.now();
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    if (dpr !== this.pixelRatio || width !== this.cssWidth || height !== this.cssHeight) {
      this.renderer.setPixelRatio(dpr);
      this.renderer.setSize(width, height, false);
      this.pixelRatio = dpr;
      this.cssWidth = width;
      this.cssHeight = height;
    }
    const halfW = view.width / 2000, halfH = halfW * height / width;
    this.camera.left = -halfW; this.camera.right = halfW;
    this.camera.top = halfH; this.camera.bottom = -halfH;
    this.camera.position.set(view.x / 1000, view.y / 1000, 10);
    this.camera.updateProjectionMatrix();
    this.sprites.update(view, width / height);
    this.lines.forEach(line => line.update(view.width / width / 1000));
    this.renderer.info.reset();
    this.renderer.render(this.scene, this.camera);
    this.stats = { frameMs: performance.now() - start, drawCalls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles, instances: this.sprites.count,
      textureBytes: this.terrain.bytes + this.sprites.bytes, bufferWidth: this.canvas.width, bufferHeight: this.canvas.height };
  }
  dispose() {
    this.canvas.removeEventListener('webglcontextlost', this.onLost);
    this.canvas.removeEventListener('webglcontextrestored', this.onRestored);
    this.lines.forEach(line => line.dispose());
    this.terrain.dispose(); this.sprites.dispose(); this.renderer.dispose();
  }
}
