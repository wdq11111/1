import type { ReactNode } from 'react';

const paths: Record<string, ReactNode> = {
  map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/></>,
  layers: <><path d="m12 3 9 5-9 5L3 8z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></>,
  mountain: <><path d="m2 19 7-12 4 7 3-5 6 10z"/><path d="m6.6 11 2.4 2 2.3-2M16 5h.01"/></>,
  people: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v2m1-15a3 3 0 0 1 0 6m1 3a4 4 0 0 1 4 4v2"/></>,
  economy: <><path d="M3 20h18M6 16v-4m6 4V7m6 9V4"/><path d="M3 5v15"/></>,
  route: <><circle cx="5" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M7 6h9a3 3 0 0 1 0 6H8a3 3 0 0 0 0 6h9"/></>,
  hex: <path d="m12 2 8.66 5v10L12 22l-8.66-5V7z"/>,
  eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.5"/></>,
  book: <><path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1zM12 6v14"/></>,
  search: <><circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 5 5"/></>,
  crosshair: <><circle cx="12" cy="12" r="6"/><path d="M12 2v5m0 10v5M2 12h5m10 0h5"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  minus: <path d="M5 12h14"/>,
  close: <path d="m6 6 12 12M18 6 6 18"/>,
  arrow: <path d="M4 12h15m-6-6 6 6-6 6"/>,
  pin: <><path d="M19 10c0 5-7 10-7 10s-7-5-7-10a7 7 0 1 1 14 0z"/><circle cx="12" cy="10" r="2"/></>,
  city: <><path d="M2 20h20M5 20V9l4 2 3-5 3 5 4-2v11M9 20v-5h6v5M4 9h16M12 6V3"/></>,
  camera: <><path d="M3 7h4l2-3h6l2 3h4v13H3z"/><circle cx="12" cy="13" r="4"/></>,
  info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/></>,
  pointer: <path d="m4 3 14 8-7 2-3 7z"/>,
  compass: <><circle cx="12" cy="12" r="9"/><path d="m15.5 7-2 6-5 4 2-6z"/></>,
};
export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none"
    stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
