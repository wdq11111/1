import * as T from 'three';
import { terrainColors, type RenderView, type Lens, type TileId } from '../../core-types/src/map';
import { SQRT3 } from '../../hexgrid/src/grid';

const vertexShader = /* glsl */ `
out vec2 pointKm;
void main() {
  vec4 model = modelMatrix * vec4(position, 1.0);
  pointKm = model.xy;
  gl_Position = projectionMatrix * viewMatrix * model;
}`;

const fragmentShader = /* glsl */ `
precision highp float;
precision highp int;
in vec2 pointKm;
out vec4 outputColor;
uniform sampler2D tileMap, reliefMap, coastMap;
uniform vec3 palette[11];
uniform vec2 origin, selectedCell, hoverCell;
uniform vec4 textureBounds;
uniform ivec2 localOrigin, windowSize;
uniform int lens;
uniform bool gridOn;
uniform float radius, root3;

float hash(vec2 p) {
  return fract(52.9829189 * fract(dot(p, vec2(.06711056,.00583715))));
}
ivec2 offsetCell(vec2 p) {
  vec2 g = (p - origin) / radius;
  float q = root3/3. * g.x - g.y/3.;
  float r = (2. * g.y)/3.;
  vec3 f = vec3(q,r,-q-r);
  vec3 magnitude = abs(f);
  vec3 integral = floor(magnitude);
  vec3 h = sign(f) * (integral + step(vec3(.5), magnitude-integral));
  vec3 d = abs(h-f);
  if (d.x>d.y && d.x>d.z) h.x = -h.y-h.z;
  else if (d.y>d.z) h.y = -h.x-h.z;
  int row = int(h.y);
  return ivec2(int(h.x) + (row-(row&1))/2, row);
}
vec2 cellCenter(ivec2 tile) {
  return origin + radius * vec2(root3 * (float(tile.x) + .5 * float(tile.y&1)), 1.5 * float(tile.y));
}
vec4 sampleCell(ivec2 tile) {
  ivec2 texel = tile - localOrigin;
  if (any(lessThan(texel,ivec2(0))) || any(greaterThanEqual(texel,windowSize))) return vec4(0.);
  return texelFetch(tileMap,texel,0);
}
vec3 lensPaint(float v) {
  vec3 low = lens==1 ? vec3(.84,.79,.52) : vec3(.80,.83,.61);
  vec3 mid = lens==1 ? vec3(.75,.43,.21) : vec3(.29,.57,.50);
  vec3 high = lens==1 ? vec3(.52,.17,.12) : vec3(.11,.28,.37);
  return v < .5 ? mix(low,mid,2.*v) : mix(mid,high,2.*v-1.);
}
void main() {
  vec2 uv = clamp((pointKm-textureBounds.xy)/textureBounds.zw,0.,1.);
  float coast = texture(coastMap,uv).r;
  float shade = texture(reliefMap,uv).r;
  ivec2 cell = offsetCell(pointKm);
  vec2 delta = (pointKm-cellCenter(cell))/radius;
  vec2 a = abs(delta);
  float apothem = root3*.5;
  float edge = max(a.x, dot(a,vec2(.5,apothem)));
  float pixel = max(fwidth(pointKm.x)/radius,.006);
  vec4 data = sampleCell(cell);
  int terrain = int(data.r*255.+.5);
  float grain = hash(gl_FragCoord.xy) - .5;
  float fibers = sin(pointKm.x*2.2+pointKm.y*1.3) * sin(pointKm.y*2.3-pointKm.x*.74);
  float cellGrain = hash(vec2(cell))-.5;
  vec3 color;
  if (terrain==0) {
    vec3 depth = vec3(.18,.34,.37);
    vec3 shelf = vec3(.43,.64,.60);
    color = mix(depth,shelf,smoothstep(.08,.50,coast));
    color = mix(color,vec3(.66,.76,.66),smoothstep(.465,.496,coast)*.36);
    float waves = sin(pointKm.y*.186 + sin(pointKm.x*.041)*1.3 + grain*.28);
    color += smoothstep(.80,.99,waves)*.022 + grain*.040 + fibers*.009;
  } else {
    color = palette[terrain];
    vec2 normalDirection = a.x > dot(a,vec2(.5,apothem)) ? vec2(sign(delta.x),0.)
      : vec2(.5*sign(delta.x),apothem*sign(delta.y));
    int neighbor = int(sampleCell(offsetCell(cellCenter(cell)+normalDirection*radius*root3)).r*255.+.5);
    if (neighbor>=2 && terrain>=2) color = mix(color,palette[neighbor],.25*smoothstep(.58,apothem,edge));
    if (terrain>=2) {
      float shadeWeight = terrain<=4 ? .47 : .24;
      color += (shade-.55)*shadeWeight + grain*.07 + cellGrain*.066 + fibers*.022;
      float hatch = sin(pointKm.x*.83+pointKm.y*.69+sin(pointKm.y*.34)*1.6);
      color -= smoothstep(.56,.94,hatch)*clamp((shade-.54)*.30,0.,.08);
      if (coast<.53) color = mix(vec3(.75,.74,.54),color,smoothstep(.42,.53,coast));
      if (lens!=0) {
        float v = lens==1 ? data.g : data.b;
        if (data.a<.5) {
          float stripes = smoothstep(.38,.65,fract((pointKm.x+pointKm.y)/6.));
          color = mix(color, mix(vec3(.46,.48,.39),vec3(.78,.76,.66),stripes),.68);
        } else color = mix(color,lensPaint(v),.76);
      }
    } else color += grain*.045 + cellGrain*.025;
    if (gridOn) {
      float gridLine = smoothstep(apothem-pixel*.9,apothem,edge);
      color = mix(color,vec3(.17,.29,.27),gridLine*.38);
      color += (1.-smoothstep(apothem-pixel*1.8,apothem-pixel*.8,edge)) * .014;
    }
  }
  if (all(equal(vec2(cell),hoverCell))) color = mix(color,vec3(.99,.89,.62),.16 + .3*smoothstep(apothem-2.*pixel,apothem,edge));
  if (all(equal(vec2(cell),selectedCell))) color = mix(color,vec3(1.,.76,.36),.24 + smoothstep(apothem-2.6*pixel,apothem-.65*pixel,edge)*.72);
  outputColor = vec4(color,1.);
}`;

function texture(data: Uint8Array, width: number, height: number, rgba = false) {
  const tex = new T.DataTexture(data, width, height, rgba ? T.RGBAFormat : T.RedFormat);
  tex.magFilter = tex.minFilter = rgba ? T.NearestFilter : T.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

export function makeTerrain(view: RenderView) {
  const { grid, window, bounds } = view;
  const bytes = new Uint8Array(window.cols * window.rows * 4);
  for (let i = 0; i < view.terrain.length; i++) {
    bytes[i * 4] = view.terrain[i];
    bytes[i * 4 + 1] = Math.min(255, Math.round(255 * Math.sqrt(view.population[i] / 650)));
    bytes[i * 4 + 2] = Math.min(255, Math.round(255 * Math.sqrt(view.economy[i] / 200)));
    bytes[i * 4 + 3] = view.valid[i] ? 255 : 0;
  }
  const tileMap = texture(bytes, window.cols, window.rows, true);
  const reliefMap = texture(view.relief.values, view.relief.width, view.relief.height);
  const coastMap = texture(view.coast.values, view.coast.width, view.coast.height);
  const uniforms = {
    tileMap: { value: tileMap }, reliefMap: { value: reliefMap }, coastMap: { value: coastMap },
    palette: { value: terrainColors.map(hex => new T.Vector3(
      Number.parseInt(hex.slice(0, 2), 16) / 255, Number.parseInt(hex.slice(2, 4), 16) / 255,
      Number.parseInt(hex.slice(4), 16) / 255)) },
    origin: { value: new T.Vector2(grid.originX / 1e3, grid.originY / 1e3) },
    radius: { value: grid.radiusM / 1e3 }, root3: { value: SQRT3 },
    textureBounds: { value: new T.Vector4(bounds[0] / 1e3, bounds[1] / 1e3, (bounds[2] - bounds[0]) / 1e3, (bounds[3] - bounds[1]) / 1e3) },
    localOrigin: { value: new T.Vector2(window.col0, window.row0) },
    windowSize: { value: new T.Vector2(window.cols, window.rows) },
    selectedCell: { value: new T.Vector2(-1, -1) }, hoverCell: { value: new T.Vector2(-1, -1) },
    lens: { value: 0 }, gridOn: { value: true },
  };
  const material = new T.ShaderMaterial({ glslVersion: T.GLSL3, vertexShader, fragmentShader, uniforms,
    depthWrite: false, depthTest: false });
  const mesh = new T.Mesh(new T.PlaneGeometry(uniforms.textureBounds.value.z, uniforms.textureBounds.value.w), material);
  mesh.position.set((bounds[0] + bounds[2]) / 2e3, (bounds[1] + bounds[3]) / 2e3, 0);
  function setCell(target: T.Vector2, id: TileId | null) {
    if (id === null) target.set(-1, -1);
    else target.set(id % grid.cols, Math.floor(id / grid.cols));
  }
  return {
    mesh, bytes: bytes.byteLength + view.relief.values.byteLength + view.coast.values.byteLength,
    setLens: (lens: Lens) => { uniforms.lens.value = lens === 'terrain' ? 0 : lens === 'population' ? 1 : 2; },
    setGrid: (visible: boolean) => { uniforms.gridOn.value = visible; },
    setSelection: (id: TileId | null) => setCell(uniforms.selectedCell.value, id),
    setHover: (id: TileId | null) => setCell(uniforms.hoverCell.value, id),
    dispose() { mesh.geometry.dispose(); material.dispose(); tileMap.dispose(); reliefMap.dispose(); coastMap.dispose(); },
  };
}
