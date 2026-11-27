import * as T from 'three';
import type { Point } from '../../core-types/src/map';

export function makeLineBatch(paths: readonly (readonly Point[])[], color: string, width: number, dash: number, order: number) {
  const positions: number[] = [], normalLength: number[] = [];
  for (const path of paths) {
    let distance = 0;
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1], b = path[i];
      const dx = b[0] - a[0], dy = b[1] - a[1], length = Math.hypot(dx, dy);
      if (!length) continue;
      const nx = -dy / length, ny = dx / length;
      for (const [end, side] of [[0, -1], [0, 1], [1, -1], [0, 1], [1, 1], [1, -1]]) {
        const p = end ? b : a;
        positions.push(p[0] / 1000, p[1] / 1000, 0);
        normalLength.push(nx * side, ny * side, (distance + end * length) / 1000, side);
      }
      distance += length;
    }
  }
  const geometry = new T.BufferGeometry();
  geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('lineData', new T.Float32BufferAttribute(normalLength, 4));
  const c = color.match(/.{2}/g)!.map(h => Number.parseInt(h, 16) / 255);
  const material = new T.ShaderMaterial({
    glslVersion: T.GLSL3, side: T.DoubleSide, depthTest: false, depthWrite: false, transparent: true,
    uniforms: { size: { value: width }, kmPerPixel: { value: 1 }, color: { value: new T.Vector3(...c) }, dash: { value: dash } },
    vertexShader: /* glsl */ `
      in vec4 lineData; uniform float size; uniform float kmPerPixel;
      out vec2 stroke;
      void main() {
        stroke = vec2(lineData.z/kmPerPixel,lineData.w);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xy+lineData.xy*size*kmPerPixel*.5,0.,1.);
      }`,
    fragmentShader: /* glsl */ `
      precision highp float;
      in vec2 stroke; uniform vec3 color; uniform float dash; out vec4 outputColor;
      void main() {
        float alpha = 1. - smoothstep(.73,1.,abs(stroke.y));
        if(dash>0.) alpha *= 1.-smoothstep(.61,.84,fract(stroke.x/dash));
        outputColor = vec4(color,alpha);
      }`,
  });
  const mesh = new T.Mesh(geometry, material);
  mesh.renderOrder = order;
  return { mesh, update: (kmPerPixel: number) => { material.uniforms.kmPerPixel.value = kmPerPixel; },
    dispose: () => { geometry.dispose(); material.dispose(); } };
}
