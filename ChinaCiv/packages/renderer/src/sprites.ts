import * as T from 'three';
import { Terrain, type RenderView, type CameraView } from '../../core-types/src/map';
import { center, SQRT3 } from '../../hexgrid/src/grid';

function random(x: number, y: number) {
  let n = Math.imul(x + 29, 374761393) ^ Math.imul(y + 47, 668265263) ^ 281137;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

function illustrate() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  function paint(points: number[][], fill: string, outline?: string, width = 1) {
    ctx.beginPath();
    points.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
    if (fill) { ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); }
    if (outline) { ctx.strokeStyle = outline; ctx.lineWidth = width; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
  }
  function shadow(x: number, y: number, w: number, h: number) {
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 30);
    g.addColorStop(0, '#162e2978'); g.addColorStop(1, '#273a2c00');
    ctx.save(); ctx.translate(x, y); ctx.scale(w / 30, h / 30);
    ctx.fillStyle = g; ctx.fillRect(-30, -30, 60, 60); ctx.restore();
  }
  function peak(x: number, base: number, width: number, height: number, snow: boolean, variant: number) {
    const top = base - height, left = x - width * .54, right = x + width * .63;
    const bend = random(variant, 2) * width * .14;
    const ridge = [[left, base], [x - width*.29, base - height*.42], [x - width*.17, top + height*.22],
      [x + bend, top], [x + width*.24, top + height*.29], [x + width*.27, top + height*.45], [right, base - height*.04]];
    paint(ridge, snow ? '#788276' : '#617460', '#354d43', 1.3);
    paint([ridge[0], ridge[1], ridge[2], ridge[3], [x + width*.05, top+height*.31],
      [x - width*.03, top+height*.57], [x+width*.13, base-3]], snow ? '#bdc0a4' : '#a0a684');
    paint([ridge[3], [x + width*.05, top+height*.31], [x+width*.16, top+height*.57],
      [x+width*.11, base-3], [x+width*.41, base-4], ridge[6], ridge[5], ridge[4]], '#485e54');
    if (snow) paint([ridge[2], ridge[3], ridge[4], [x + width*.13, top+height*.22],
      [x+width*.09, top+height*.38], [x+width*.006, top+height*.29], [x-width*.06, top+height*.4]], '#e8e5ce');
    for (let j = 0; j < 6; j++) {
      const t = .43 + j*.069;
      paint([[x-width*t*.39, top+height*t], [x-width*t*.21, top+height*(t-.11)]], '', '#d8d3a75e', 1.15);
      paint([[x+width*t*.27, top+height*(t-.1)], [x+width*t*.44, top+height*t]], '', '#283f3a8a', 1.25);
    }
  }
  function pine(x: number, base: number, h: number, color: string) {
    paint([[x, base+2], [x, base-h*.92]], '', '#3d4838', 1.8);
    for (let j = 0; j < 4; j++) {
      const y = base-h+j*h*.19, w = h*(.11+j*.034);
      paint([[x,y],[x+w,y+h*.37],[x+2,y+h*.31],[x-w,y+h*.40]], color, '#314a3c', .8);
      paint([[x,y+1],[x-w*.67,y+h*.34],[x,y+h*.27]], '#a0a67d8c');
    }
  }
  for (let tile = 0; tile < 16; tile++) {
    ctx.save(); ctx.translate((tile % 4) * 128, Math.floor(tile / 4) * 128);
    if (tile < 8) {
      const snow = tile < 4;
      shadow(66, 98, 57, 18);
      peak(42, 98, 49, (snow ? 49 : 33) + 13 * random(tile, 6), snow, tile);
      peak(83, 96, 54, (snow ? 44 : 29) + 18 * random(tile, 7), snow, tile + 29);
      peak(61, 103, 68, (snow ? 72 : 50) + 15 * random(tile, 8), snow, tile + 61);
    } else if (tile < 12) {
      shadow(63, 94, 45, 13);
      for (let j = 0; j < 7; j++) {
        const dx = (j % 4) * 19 + (j >= 4 ? 8 : 0) + 23 + random(tile, j) * 7;
        pine(dx, j >= 4 ? 100 : 85, 32 + random(j, tile) * 23, ['#53795a','#3e624f','#63855e'][j % 3]);
      }
    } else {
      shadow(64, 87, 54, 14);
      for (let j = 0; j < 5; j++) {
        const y = 66 + j*5;
        paint([[22+j*2,y+3],[44+j,y-6],[72+j*3,y-5],[100-j,y-1]], '',
          ['#7e8a58','#e2ce88','#a3a565','#6e8658','#d1bc79'][j], 2.2);
      }
    }
    ctx.restore();
  }
  return canvas;
}

const maxSprites = 20000;
export function makeSprites(view: RenderView) {
  const atlas = new T.CanvasTexture(illustrate());
  atlas.generateMipmaps = true;
  const quad = new T.PlaneGeometry(1, 1);
  const geometry = new T.InstancedBufferGeometry();
  geometry.setIndex(quad.getIndex());
  geometry.setAttribute('position', quad.getAttribute('position'));
  geometry.setAttribute('uv', quad.getAttribute('uv'));
  quad.dispose();
  geometry.instanceCount = 0;
  const entries = new Float32Array(maxSprites * 4);
  const attributes = new T.InstancedBufferAttribute(entries, 4).setUsage(T.DynamicDrawUsage);
  geometry.setAttribute('entry', attributes);
  const material = new T.ShaderMaterial({
    glslVersion: T.GLSL3, transparent: true, depthWrite: false, depthTest: false,
    uniforms: { atlas: { value: atlas }, opacity: { value: 1 } },
    vertexShader: /* glsl */ `
      in vec4 entry; out vec2 spriteUV;
      void main() {
        spriteUV = (uv + vec2(mod(entry.w,4.),3.-floor(entry.w/4.)))*.25;
        gl_Position = projectionMatrix*modelViewMatrix*vec4(entry.xy+(position.xy+vec2(0.,.2))*entry.z,0.,1.);
      }`,
    fragmentShader: /* glsl */ `
      precision highp float;
      uniform sampler2D atlas; uniform float opacity;
      in vec2 spriteUV; out vec4 outputColor;
      void main() {
        vec4 c = texture(atlas,spriteUV);
        if(c.a < .035) discard;
        outputColor = vec4(c.rgb,c.a*opacity);
      }`,
  });
  const mesh = new T.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = 2;
  let previous = '';
  function update(camera: CameraView, aspect: number) {
    const { grid, window, terrain } = view;
    const halfH = camera.width / aspect / 2;
    const c0 = Math.max(window.col0, Math.floor((camera.x - camera.width / 2 - grid.originX) / (grid.radiusM * SQRT3)) - 2);
    const c1 = Math.min(window.col0 + window.cols - 1, Math.ceil((camera.x + camera.width / 2 - grid.originX) / (grid.radiusM * SQRT3)) + 2);
    const r0 = Math.max(window.row0, Math.floor((camera.y - halfH - grid.originY) / (1.5 * grid.radiusM)) - 2);
    const r1 = Math.min(window.row0 + window.rows - 1, Math.ceil((camera.y + halfH - grid.originY) / (1.5 * grid.radiusM)) + 2);
    const level = camera.width > 3400000 ? 0 : camera.width > 2050000 ? 1 : 2;
    const key = [c0, c1, r0, r1, level].join('/');
    if (key === previous) return;
    previous = key;
    let n = 0;
    if (level) for (let row = r1; row >= r0 && n < maxSprites; row--) for (let col = c0; col <= c1 && n < maxSprites; col++) {
      const type = terrain[(row - window.row0) * window.cols + col - window.col0];
      const chance = random(col, row);
      const mountain = type >= Terrain.Glacier && type <= Terrain.Mountain;
      const woodland = type === Terrain.Hills || type === Terrain.Grassland || type === Terrain.Plateau;
      const fields = type === Terrain.Plain || type === Terrain.Wetland;
      if (!(mountain || woodland && chance < .37 || fields && chance < .16) || (level === 1 && chance < .56)) continue;
      const [x, y] = center(grid, col, row);
      const variant = mountain ? type <= Terrain.HighMountain ? 0 : 4 : woodland ? 8 : 12;
      entries[n*4] = (x + (random(col, row + 117) - .5) * grid.radiusM*.78) / 1e3;
      entries[n*4+1] = (y + (random(col + 53, row) - .5) * grid.radiusM*.70) / 1e3;
      entries[n*4+2] = grid.radiusM / 1e3 * (mountain ? 2.9 : woodland ? 2.05 : 1.7) * (.75 + .55 * chance);
      entries[n*4+3] = variant + Math.floor(random(col - 9, row + 11) * 4);
      n++;
    }
    geometry.instanceCount = n;
    if (n > 0) {
      attributes.clearUpdateRanges();
      attributes.addUpdateRange(0, n * 4);
      attributes.needsUpdate = true;
    }
  }
  return { mesh, update, get count() { return geometry.instanceCount; },
    setLensOpacity: (opaque: boolean) => { material.uniforms.opacity.value = opaque ? 1 : .45; },
    bytes: Math.ceil(512 * 512 * 4 * 4 / 3),
    dispose: () => { geometry.dispose(); material.dispose(); atlas.dispose(); },
  };
}
