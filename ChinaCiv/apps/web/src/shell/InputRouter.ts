import type { Bounds, CameraView, Point } from '../../../../packages/core-types/src/map';
import { boundCamera, zoomAt } from '../../../../packages/renderer/src/camera';

interface Contact { start: Point; position: Point; type: string }
interface InputOptions {
  bounds: Bounds;
  canvas: HTMLCanvasElement;
  getView(): CameraView;
  setView(view: CameraView): void;
  tap(p: Point, touch: boolean): void;
  hover(p: Point | null): void;
  inspect(p: Point): void;
}

const midpoint = (a: Point, b: Point): Point => [(a[0]+b[0])/2, (a[1]+b[1])/2];
const delta = (a: Point, b: Point) => Math.hypot(a[0]-b[0], a[1]-b[1]);

export function connectInput(element: HTMLElement, opts: InputOptions) {
  const contacts = new Map<number, Contact>();
  const abort = new AbortController();
  const listener = { signal: abort.signal };
  let timer: ReturnType<typeof setTimeout> | undefined;
  let longPressed = false, moved = false, multiple = false, pinchMoved = false;
  let pinchCenter: Point | null = null;
  let gestureStart = 0, lastMotion = 0, inertia = 0;
  let velocity: Point = [0, 0];
  let lastTap: { at: number; point: Point } | null = null;
  const stopInertia = () => { cancelAnimationFrame(inertia); velocity = [0, 0]; };
  const point = (event: MouseEvent): Point => {
    const rect = element.getBoundingClientRect();
    return [event.clientX - rect.left, event.clientY - rect.top];
  };
  const accepts = (target: EventTarget | null) => target === opts.canvas ||
    (target instanceof Element && target.closest('[data-map-marker]') !== null);
  const dimensions = () => [element.clientWidth, element.clientHeight] as const;
  function zoom(start: Point, end: Point, factor: number) {
    opts.setView(zoomAt(opts.getView(), ...dimensions(), start, end, factor, opts.bounds));
  }
  function pan(dx: number, dy: number) {
    const view = opts.getView(), metersPerPixel = view.width / element.clientWidth;
    opts.setView(boundCamera({ ...view, x: view.x - dx * metersPerPixel, y: view.y + dy * metersPerPixel }, opts.bounds));
  }
  function startInertia(at: number) {
    function step(now: number) {
      const dt = Math.min(now - at, 32);
      at = now;
      const decay = Math.exp(-dt / 103);
      velocity = [velocity[0] * decay, velocity[1] * decay];
      if (Math.hypot(...velocity) < .04) return;
      pan(velocity[0] * dt, velocity[1] * dt);
      inertia = requestAnimationFrame(step);
    }
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) inertia = requestAnimationFrame(step);
  }
  element.addEventListener('wheel', event => {
    if (!accepts(event.target)) return;
    event.preventDefault();
    stopInertia();
    const p = point(event);
    zoom(p, p, Math.exp(Math.max(-140, Math.min(140, event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientHeight : 1))) * .0027));
  }, { ...listener, passive: false });
  element.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !accepts(event.target)) return;
    opts.canvas.focus({ preventScroll: true });
    element.setPointerCapture(event.pointerId);
    stopInertia();
    clearTimeout(timer);
    const p = point(event), now = performance.now();
    contacts.set(event.pointerId, { start: p, position: p, type: event.pointerType });
    if (contacts.size === 1) {
      longPressed = moved = multiple = pinchMoved = false;
      pinchCenter = null;
      gestureStart = lastMotion = now;
      if (event.pointerType !== 'mouse') timer = setTimeout(() => {
        longPressed = true;
        lastTap = null;
        opts.inspect(p);
      }, 400);
    } else {
      multiple = true;
      lastTap = null;
      opts.hover(null);
      const [a, b] = contacts.values();
      pinchCenter = midpoint(a.position, b.position);
      if (contacts.size > 2) pinchMoved = true;
    }
  }, listener);
  element.addEventListener('pointermove', event => {
    const p = point(event), contact = contacts.get(event.pointerId);
    if (!contact) {
      if (event.pointerType === 'mouse') opts.hover(accepts(event.target) ? p : null);
      return;
    }
    const old = contact.position;
    const [a, b] = contacts.values();
    const before = b ? midpoint(a.position, b.position) : p;
    const oldSpan = b ? delta(a.position, b.position) : 0;
    contact.position = p;
    if (b && (contact === a || contact === b)) {
      const after = midpoint(a.position, b.position), span = delta(a.position, b.position);
      if (delta(contact.start, p) > 9) pinchMoved = true;
      if (pinchMoved && oldSpan > 2 && span > 2) zoom(before, after, oldSpan / span);
      return;
    }
    if (contacts.size !== 1 || longPressed) return;
    if (!moved && delta(contact.start, p) < 5) return;
    const prior = moved ? old : contact.start;
    moved = true;
    if (multiple) pinchMoved = true;
    lastTap = null;
    clearTimeout(timer);
    opts.hover(null);
    pan(p[0] - prior[0], p[1] - prior[1]);
    const at = performance.now(), dt = Math.max(10, at - lastMotion);
    velocity = [(p[0]-prior[0])/dt, (p[1]-prior[1])/dt];
    lastMotion = at;
  }, listener);
  function finish(event: PointerEvent, cancelled: boolean) {
    const contact = contacts.get(event.pointerId);
    if (!contact) return;
    contacts.delete(event.pointerId);
    clearTimeout(timer);
    if (cancelled) pinchMoved = moved = true;
    if (contacts.size) return;
    const p = point(event), now = performance.now();
    const touch = contact.type !== 'mouse';
    if (cancelled || longPressed) return;
    if (multiple) {
      if (!pinchMoved && pinchCenter && now - gestureStart < 320) zoom(pinchCenter, pinchCenter, 1.35);
    } else if (!moved) {
      if (touch && lastTap && now - lastTap.at < 300 && delta(lastTap.point,p) < 35) {
        lastTap = null;
        zoom(p, p, .67);
      } else {
        opts.tap(p, touch);
        lastTap = touch ? { at: now, point: p } : null;
      }
    } else if (touch && now - lastMotion < 65) startInertia(now);
  }
  element.addEventListener('pointerup', event => finish(event, false), listener);
  element.addEventListener('pointercancel', event => finish(event, true), listener);
  element.addEventListener('lostpointercapture', event => finish(event, true), listener);
  element.addEventListener('pointerleave', () => opts.hover(null), listener);
  element.addEventListener('contextmenu', event => {
    if (!accepts(event.target)) return;
    event.preventDefault();
    opts.inspect(point(event));
  }, listener);
  element.addEventListener('dblclick', event => {
    if (!accepts(event.target) || (event as MouseEvent & { sourceCapabilities?: { firesTouchEvents: boolean } }).sourceCapabilities?.firesTouchEvents) return;
    const p = point(event);
    zoom(p, p, .66);
  }, listener);
  element.addEventListener('keydown', event => {
    if (event.target !== opts.canvas) return;
    const key = event.key.toLowerCase();
    if (['arrowleft','a','arrowright','d','arrowup','w','arrowdown','s'].includes(key)) {
      event.preventDefault();
      const distance = event.shiftKey ? 160 : 62;
      pan(['a','arrowleft'].includes(key) ? distance : ['d','arrowright'].includes(key) ? -distance : 0,
        ['w','arrowup'].includes(key) ? distance : ['s','arrowdown'].includes(key) ? -distance : 0);
    } else if (key === '+' || key === '=' || key === '-') {
      event.preventDefault();
      const [w, h] = dimensions(), p: Point = [w / 2, h / 2];
      zoom(p, p, key === '-' ? 1.32 : .76);
    }
  }, listener);
  return () => { abort.abort(); clearTimeout(timer); stopInertia(); };
}
