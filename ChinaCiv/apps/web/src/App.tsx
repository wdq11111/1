import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyEvent } from 'react';
import { Terrain, terrainNames, type CameraView, type Lens, type Point, type Selection, type TileId } from '../../../packages/core-types/src/map';
import { pickTile, tileCenter } from '../../../packages/hexgrid/src/grid';
import { AtlasRenderer, usaCamera, type AtlasStats } from '../../../packages/renderer/src/AtlasRenderer';
import { boundCamera, screenAt, worldAt, zoomAt } from '../../../packages/renderer/src/camera';
import { buildUsaScene, COVER_NAMES, popLabel, RELIEF_NAMES, REGION_BOX, type UsaScene } from '../../../packages/renderer/src/usacivWorld';
import { ROAD_MIN_RPX, svgIcon, type BannerHit } from '../../../packages/renderer/src/usaciv/index';
import { createFixture, DEFAULT_VIEW } from '../../../packages/test-utils/src/fixture';
import { lenses } from '../../../packages/almanac/src/lenses';
import { connectInput } from './shell/InputRouter';
import { Icon } from './Icons';
import styles from './App.module.css';

const map = createFixture();
const scene: UsaScene = buildUsaScene(map);
const defaultSelection: Selection | null = null;
const tileCount = map.window.cols * map.window.rows;
const notice = '合成技术样例，非真实地图';
const lensIcons: Record<Lens, string> = { terrain: 'terrain', population: 'l-people', economy: 'y-gold' };
const dockNames: Record<Lens, string> = { terrain: '地形地貌', population: '人口密度', economy: '经济活动' };
const format = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 1 });
const km = (n: number) => format.format(Math.round(n / 1000));
const PANEL_W = 394;

function UIcon({ id, size = 16 }: { id: string; size?: number }) {
  // svgIcon renders the vendored USACiv icon set (static path data, no user input).
  return <span className={styles.uicon} aria-hidden="true" dangerouslySetInnerHTML={{ __html: svgIcon(id, { size }) }}/>;
}

function pointSegmentDistance(p: Point, a: Point, b: Point) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((p[0]-a[0])*dx + (p[1]-a[1])*dy) / (dx*dx+dy*dy || 1)));
  return Math.hypot(p[0]-a[0]-t*dx, p[1]-a[1]-t*dy);
}

// Minimap (USACiv ui/minimap.js): the current cell colours as a thumbnail, plus the camera's view box.
const overviewM = [REGION_BOX[0] * 1000 - 160000, REGION_BOX[1] * 1000 - 120000, REGION_BOX[2] * 1000 + 160000, REGION_BOX[3] * 1000 + 120000] as const;
function drawOverview(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  const { width, height } = canvas;
  const [x0, y0] = scene.toKm([overviewM[0], overviewM[3]]), [x1, y1] = scene.toKm([overviewM[2], overviewM[1]]);
  const kx = width / (x1 - x0), ky = height / (y1 - y0);
  const g = scene.w.grid;
  ctx.fillStyle = '#0d2a47';
  ctx.fillRect(0, 0, width, height);
  const cw = g.W * kx + 1, ch = g.H * ky + 1;
  const r = g.range(x0, y0, x1, y1);
  for (let row = r.r0; row <= r.r1; row++) for (let col = r.c0; col <= r.c1; col++) {
    const i = row * g.cols + col;
    ctx.fillStyle = scene.w.colors[i];
    ctx.fillRect((g.cx(i) - g.W / 2 - x0) * kx, (g.cy(i) - g.H / 2 - y0) * ky, cw, ch);
  }
}

function Overview({ camera, ratio, move, version }: { camera: CameraView; ratio: number; move: (x: number, y: number) => void; version: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => { if (canvas.current) drawOverview(canvas.current); }, [version]);
  const [x0, y0, x1, y1] = overviewM, width = x1-x0, height = y1-y0;
  const halfH = camera.width / ratio / 2;
  const pct = (n: number) => `${n*100}%`;
  return <section className={`${styles.panel} ${styles.minimap}`} aria-label="小地图">
    <button aria-label="在小地图上定位" onClick={event => {
      const r = event.currentTarget.getBoundingClientRect();
      if (event.detail === 0) move(DEFAULT_VIEW.x, DEFAULT_VIEW.y);
      else move(x0 + (event.clientX-r.left)/r.width*width, y1 - (event.clientY-r.top)/r.height*height);
    }}>
      <canvas ref={canvas} width={460} height={Math.round(460 * height / width)}/>
      <span className={styles.viewport} style={{ left: pct((camera.x-camera.width/2-x0)/width),
        top: pct((y1-camera.y-halfH)/height), width: pct(camera.width/width), height: pct(halfH*2/height) }}/>
    </button>
  </section>;
}

function StatRow({ icon, label, value, unit }: { icon: string; label: string; value: string; unit?: string }) {
  return <div className={styles.statRow}><span className={styles.sl}><UIcon id={icon} size={14}/>{label}</span>
    <span><b>{value}</b>{unit && <span className={styles.cmp}>{unit}</span>}</span></div>;
}

function Inspector({ selected, close, locate }: { selected: Selection; close: () => void; locate: (p: Point, width?: number) => void }) {
  const city = selected.kind === 'city' ? map.cities[selected.id] : null;
  const line = selected.kind === 'edge' ? map.network[selected.id] : null;
  const tile = city?.anchorTile ?? (selected.kind === 'tile' ? selected.id : null);
  const index = tile === null ? -1 : map.tileIndex(tile);
  const t = index >= 0 ? map.terrain[index] : Terrain.Ocean;
  const valid = index >= 0 && map.valid[index] !== 0;
  const prov = tile !== null ? scene.province(tile) : null;
  const cover = tile !== null && t > Terrain.Lake ? COVER_NAMES[scene.coverOf(tile)] : terrainNames[t];
  const owner = tile !== null ? scene.w.raw.owner[scene.cellOfTile(tile)] : -1;
  const stripe = owner >= 0 ? `rgb(${scene.w.stateColor[owner].join(',')})` : '#7d8794';
  const target = city ? [city.anchorX, city.anchorY] as const : line ? line.points[Math.floor(line.points.length / 2)] : tile !== null ? tileCenter(map.grid, tile) : null;
  const kind = city ? (city.primary ? '城镇' : '合成聚落') : line ? '线路详情' : '地块详情';
  const name = city?.label ?? line?.name ?? cover;
  return <section className={`${styles.panel} ${styles.cityPanel}`} aria-label="地图详情">
    <div className={styles.cpHead}>
      <span className={styles.stripe} style={{ background: stripe }}/>
      <div className={styles.cpKind}>{kind}</div>
      <h2 className={styles.cpName}>{name}</h2>
      <div className={styles.cpFull}>{city ? `${city.pinyin.toUpperCase()} · 青澜流域` : line ? `青澜流域 · 合成${line.mode0 === 'rail' ? '铁路' : '公路'}` : `地块 #${tile}`}</div>
      <div className={styles.chips}>
        {prov && <span className={styles.chip}>{prov.name}{prov.foreign ? '' : '（合成分区）'}</span>}
        <span className={styles.chip}>合成数据</span>
      </div>
      {city && <div className={styles.cpPop}><UIcon id="pop" size={15}/><b>{format.format(city.population)}</b> 人 ·
        经济总量 <b>{format.format(city.economy)}</b> 亿元</div>}
      <button className={styles.iconBtn + ' ' + styles.cpClose} onClick={close} aria-label="关闭详情"><Icon name="close" size={14}/></button>
      {target && <button className={styles.goldBtn} onClick={() => locate(target, city ? 700000 : 900000)}>
        <span className={styles.goldIco}><UIcon id="map" size={14}/></span>定位到地图<span className={styles.chev}>›</span></button>}
    </div>
    {city && <div className={styles.cpSection}>
      <h3>产出</h3>
      <div className={styles.yieldGrid}>
        <div className={styles.yieldTile}><UIcon id="pop" size={20}/><div className={styles.val}>{popLabel(city.population)}</div><div className={styles.lbl}>人口</div></div>
        <div className={styles.yieldTile}><UIcon id="y-gold" size={20}/><div className={styles.val} style={{ color: '#f2c94c' }}>{format.format(city.economy)}亿</div><div className={styles.lbl}>经济总量</div></div>
        <div className={styles.yieldTile}><UIcon id="l-income" size={20}/><div className={styles.val}>{format.format(city.economy * 1e4 / city.population)}万</div><div className={styles.lbl}>人均产出</div></div>
      </div>
    </div>}
    <div className={styles.cpSection}>
      <h3>{city ? '锚点地块' : line ? '线路' : '地块'}</h3>
      {line ? <>
        <StatRow icon={line.mode0 === 'rail' ? 't-rail' : 't-road'} label="交通方式" value={line.mode0 === 'rail' ? '铁路' : '公路'}/>
        <StatRow icon="map" label="状态" value="通行"/>
        <StatRow icon="terrain" label="途经地块" value={format.format(scene.routePaths[line.lineId].length)} unit="格"/>
      </> : <>
        <StatRow icon="terrain" label="地形" value={terrainNames[t]}/>
        {t > Terrain.Lake && tile !== null && <StatRow icon="l-forest" label="地表覆盖" value={cover}/>}
        {t > Terrain.Lake && tile !== null && <StatRow icon="l-farmland" label="地势" value={RELIEF_NAMES[scene.reliefOf(tile)]}/>}
        <StatRow icon="l-home" label="海拔" value={t > Terrain.Lake ? format.format(map.elevation[index]) : '无数据'} unit={t > Terrain.Lake ? 'm' : undefined}/>
        <StatRow icon="l-people" label="人口密度" value={valid ? format.format(map.population[index]) : '无数据'} unit={valid ? '人/km²' : undefined}/>
        <StatRow icon="y-gold" label="经济活动" value={valid ? format.format(map.economy[index]) : '无数据'} unit={valid ? '合成指数' : undefined}/>
        {!city && <StatRow icon="g-land" label="网格编号" value={String(tile)}/>}
      </>}
    </div>
    {(city || line) && <div className={styles.cpSection}><h3>概况</h3>
      <p className={styles.muted}>{city ? city.description : `青澜流域的合成${line!.mode0 === 'rail' ? '铁路' : '公路'}。端点与线形均为程序生成，沿六边形格心绘制。`}</p></div>}
    <div className={styles.cpFoot}>合成数据 · 非真实地理与统计</div>
  </section>;
}

type Bench = { getView(): CameraView; setView(v: CameraView): void; stats(): AtlasStats | null;
  capabilities: AtlasRenderer['capabilities']; size(): Point; getSelection(): Selection | null; hits(): BannerHit[];
  /** A vertex of a drawn route away from every city (for picking tests). */
  routeProbe(lineId: number): Point };

declare global { interface Window { atlasBench?: Bench } }

export function App() {
  const area = useRef<HTMLDivElement>(null), canvas = useRef<HTMLCanvasElement>(null), overlay = useRef<HTMLCanvasElement>(null);
  const searchInput = useRef<HTMLInputElement>(null), dialog = useRef<HTMLDialogElement>(null);
  const renderer = useRef<AtlasRenderer | null>(null), cameraLive = useRef<CameraView>(DEFAULT_VIEW);
  const [camera, setCamera] = useState(DEFAULT_VIEW), [size, setSize] = useState<Point>([1,1]);
  const [lens, setLens] = useState<Lens>('terrain'), [grid, setGrid] = useState(true);
  const [routes, setRoutes] = useState(true), [names, setNames] = useState(true);
  const [selected, setSelected] = useState<Selection | null>(defaultSelection);
  const [hover, setHover] = useState<{ p: Point; tile: TileId | null; city: number | null } | null>(null);
  const [tooltip, setTooltip] = useState<{ p: Point; label: string; selection: Selection } | null>(null);
  const [error, setError] = useState(''), [lost, setLost] = useState(false), [ready, setReady] = useState(false);
  const [query, setQuery] = useState(''), [searchOpen, setSearchOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'guide' | 'data'>('guide');
  const [layersOpen, setLayersOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [hits, setHits] = useState<BannerHit[]>([]);
  const [colors, setColors] = useState(0);
  const [width, height] = size;
  const drawState = useRef({ lens, grid, routes, selected, size, hits, names });
  drawState.current = { lens, grid, routes, selected, size, hits, names };

  function updateView(view: CameraView) {
    cameraLive.current = boundCamera(view, map.bounds);
    setCamera(cameraLive.current);
    setTooltip(null);
  }
  function locate([x,y]: Point, viewWidth = cameraLive.current.width) { updateView({ x, y, width: viewWidth }); }
  function choose(value: Selection | null) { setSelected(value); setTooltip(null); }
  function reset() { updateView(DEFAULT_VIEW); }
  function zoom(factor: number) {
    const p: Point = [width / 2, height / 2];
    updateView(zoomAt(cameraLive.current, width, height, p, p, factor, map.bounds));
  }
  function bannerAt(p: Point, pad: number) {
    for (let k = drawState.current.hits.length - 1; k >= 0; k--) {
      const h = drawState.current.hits[k];
      if (p[0] >= h.x - pad && p[0] <= h.x + h.w + pad && p[1] >= h.y - pad && p[1] <= h.y + h.h + 4 + pad) return Number(h.city.id);
    }
    return null;
  }
  function detailsAt(p: Point, touch: boolean): Selection | null {
    const [w, h] = drawState.current.size;
    const v = cameraLive.current;
    const banner = bannerAt(p, touch ? 8 : 0);
    if (banner !== null) return { kind: 'city', id: banner };
    const world = worldAt(v, w, h, ...p);
    const id = pickTile(map.grid, ...world);
    const cityHere = id === null ? undefined : scene.w.cityByCell.get(scene.cellOfTile(id));
    if (cityHere) return { kind: 'city', id: Number(cityHere.id) };
    const Rpx = scene.w.grid.R * usaCamera(scene, v, w, h).scale;
    if (drawState.current.routes && Rpx >= ROAD_MIN_RPX) {
      const hitDistance = (touch ? 22 : 7) * v.width / w;
      let nearest: { id: number; d: number } | null = null;
      scene.routePaths.forEach((path, lineId) => {
        for (let i = 1; i < path.length; i++) {
          const d = pointSegmentDistance(world, path[i-1], path[i]);
          if (d <= hitDistance && (!nearest || d < nearest.d)) nearest = { id: lineId, d };
        }
      });
      if (nearest) return { kind: 'edge', id: (nearest as { id: number }).id };
    }
    return id === null || map.tileIndex(id) < 0 ? null : { kind: 'tile', id };
  }

  useLayoutEffect(() => {
    const el = area.current, target = canvas.current, top = overlay.current;
    if (!el || !target || !top) return;
    const resize = () => setSize([el.clientWidth, el.clientHeight]);
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    let atlas: AtlasRenderer;
    try { atlas = new AtlasRenderer(target, top, scene, setLost, () => setHits(atlas.hits.slice())); }
    catch (e) { setError((e as Error).message); return () => observer.disconnect(); }
    renderer.current = atlas;
    setReady(true);
    const disconnect = connectInput(el, {
      canvas: target, bounds: map.bounds, getView: () => cameraLive.current, setView: updateView,
      tap: (p, touch) => choose(detailsAt(p, touch)),
      hover: p => {
        if (!p) { setHover(null); return; }
        const [w,h] = drawState.current.size;
        setHover({ p, tile: pickTile(map.grid, ...worldAt(cameraLive.current, w, h, ...p)), city: bannerAt(p, 0) });
      },
      inspect: p => {
        const hit = detailsAt(p, true);
        if (!hit) return;
        const label = hit.kind === 'city' ? map.cities[hit.id].label : hit.kind === 'edge' ? map.network[hit.id].name
          : COVER_NAMES[scene.coverOf(hit.id)] ?? terrainNames[map.terrain[map.tileIndex(hit.id)]];
        setTooltip({ p, label, selection: hit });
      },
    });
    const debug = new URLSearchParams(location.search).has('bench');
    if (debug) window.atlasBench = {
      getView: () => cameraLive.current, setView: updateView, stats: () => atlas.stats,
      capabilities: atlas.capabilities, size: () => drawState.current.size,
      getSelection: () => drawState.current.selected, hits: () => atlas.hits,
      routeProbe: lineId => {
        const path = scene.routePaths[lineId];
        let best = path[0], bestD = -1;
        for (const p of path) {
          const d = Math.min(...map.cities.map(c => Math.hypot(c.anchorX - p[0], c.anchorY - p[1])));
          if (d > bestD) { bestD = d; best = p; }
        }
        return best;
      },
    };
    let idle = 0;
    const warm = () => { idle = 0; if (!atlas.lost) atlas.warm(cameraLive.current, ...drawState.current.size); };
    const scheduleWarm = () => { if (!idle) idle = window.setTimeout(warm, 900); };
    el.addEventListener('pointerup', scheduleWarm);
    el.addEventListener('wheel', () => { clearTimeout(idle); idle = 0; scheduleWarm(); }, { passive: true });
    return () => {
      if (debug) delete window.atlasBench;
      clearTimeout(idle);
      disconnect(); observer.disconnect(); atlas.dispose(); renderer.current = null;
    };
  }, []);

  const city = selected?.kind === 'city' ? map.cities[selected.id] : null;
  const selectedTile = selected?.kind === 'tile' ? selected.id : null;
  const hoverCity = hover?.city ?? null;
  const hoverCell = hoverCity !== null ? scene.cityById[hoverCity].cell : hover?.tile != null ? scene.cellOfTile(hover.tile) : -1;
  useLayoutEffect(() => {
    if (!renderer.current || lost) return;
    const handle = requestAnimationFrame(() => {
      const atlas = renderer.current;
      if (!atlas) return;
      atlas.setOptions({ lens, grid, routes, names, selectedCity: city?.id ?? null,
        selectedCell: selectedTile !== null ? scene.cellOfTile(selectedTile) : -1, hoverCell,
        bannerRight: selected && width > 760 ? width - PANEL_W : null });
      atlas.render(camera, width, height);
      setHits(prev => prev.length === atlas.hits.length && prev.every((h, k) => h.x === atlas.hits[k].x && h.y === atlas.hits[k].y && h.city === atlas.hits[k].city) ? prev : atlas.hits.slice());
      setColors(atlas.colorsVersion);
    });
    return () => cancelAnimationFrame(handle);
  }, [camera, width, height, lens, grid, routes, names, city?.id, selectedTile, hoverCell, lost, selected]);

  useEffect(() => {
    function key(e: KeyboardEvent) {
      if (e.key === '/' && !dialog.current?.open && !['INPUT','TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault(); searchInput.current?.focus();
      }
      if (e.key === 'Escape') { setTooltip(null); setLayersOpen(false); }
    }
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);
  useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => setFeedback(''), 2400);
    return () => clearTimeout(timeout);
  }, [feedback]);

  function showDialog(mode: 'guide' | 'data') {
    setDialogMode(mode);
    dialog.current?.showModal();
  }
  function exportMap() {
    const atlas = renderer.current;
    if (!atlas || atlas.lost) return;
    const shot = atlas.snapshot(camera, width, height);
    if (!shot) return;
    const { canvas: out, ctx, scale } = shot;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    const text = `华夏文明 · ${notice}`;
    ctx.font = '600 13px "Songti SC","Noto Serif CJK SC",serif';
    const tw = ctx.measureText(text).width + 24;
    ctx.fillStyle = 'rgba(16,25,35,.92)'; ctx.strokeStyle = '#c9a45c'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(12, height - 40, tw, 28, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ecd08e'; ctx.fillText(text, 24, height - 21);
    out.toBlob(blob => {
      if (!blob) { setFeedback('截图生成失败'); return; }
      const url = URL.createObjectURL(blob), link = document.createElement('a');
      link.href = url; link.download = 'chinaciv-qinglan.png'; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      setFeedback('已导出当前地图');
    });
  }

  const search = query.trim().toLowerCase();
  const results = useMemo(() => search ? map.cities.filter(c => c.label.includes(search) || c.pinyin.includes(search))
    .sort((a, b) => b.population - a.population).slice(0, 8) : [], [search]);
  function searchTo(id: number) {
    const place = map.cities[id]; choose({ kind: 'city', id });
    locate([place.anchorX,place.anchorY], 1160000); setSearchOpen(false); setQuery('');
  }
  function searchKeys(e: ReactKeyEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && results.length) searchTo(results[0].id);
    if (e.key === 'Escape') setSearchOpen(false);
  }

  const scaleM = camera.width / Math.max(width, 1) * 90;
  const scaleStep = 10 ** Math.floor(Math.log10(scaleM));
  const scaleDistance = Math.floor(scaleM/scaleStep) * scaleStep;
  const scalePixels = scaleDistance / camera.width * width;
  const lensDef = lens === 'terrain' ? null : scene.lenses[lens];
  const hoverTile = hover?.tile ?? null, hoverIndex = hoverTile === null ? -1 : map.tileIndex(hoverTile);
  const panelOpen = !!selected && ready && !lost;
  const layerCount = [routes, grid, names].filter(Boolean).length;

  return <div className={styles.app} data-panel={panelOpen ? 'open' : 'closed'}>
    <header className={styles.topbar}>
      <div className={styles.brand} title="华夏文明 · ChinaCiv"><span className={styles.emblem} aria-hidden="true">华</span>
        <span className={styles.brandText}>华夏文明</span><span className={styles.brandLatin}>ChinaCiv</span></div>
      <div className={styles.yields} aria-label="区域合计（合成）">
        <span className={styles.yield} title="城镇人口合计（合成）"><UIcon id="pop" size={16}/>{popLabel(scene.totals.population)}</span>
        <span className={styles.yield} style={{ color: '#f2c94c' }} title="城镇经济总量合计（合成，亿元）"><UIcon id="y-gold" size={16}/>{format.format(scene.totals.economy)}亿</span>
        <span className={styles.yield} style={{ color: '#7fbf3f' }} title="城镇数量（合成）"><UIcon id="y-food" size={16}/>{scene.totals.towns} 城镇</span>
        <span className={styles.yield} style={{ color: '#4fa3e0' }} title="网格格数"><UIcon id="g-land" size={16}/>{format.format(tileCount)} 格</span>
      </div>
      <div className={styles.spacer}/>
      <div className={styles.search} role="search">
        <span className={styles.searchIc}><UIcon id="search" size={14}/></span>
        <input ref={searchInput} type="text" enterKeyHint="search" placeholder="搜索城镇" aria-label="搜索城镇" value={query} onKeyDown={searchKeys}
          autoComplete="off" spellCheck={false}
          onFocus={() => setSearchOpen(true)} onBlur={e => { if (!e.currentTarget.parentElement?.contains(e.relatedTarget)) setSearchOpen(false); }}
          onChange={e => { setQuery(e.target.value); setSearchOpen(true); }}/>
        <kbd className={styles.searchKbd}>/</kbd>
        {searchOpen && search && <div className={`${styles.panel} ${styles.searchResults}`}>
          {results.length ? results.map(c => <button key={c.id} onClick={() => searchTo(c.id)}>
            <span className={styles.srIc}><UIcon id="pop" size={15}/></span>
            <span className={styles.srMain}><b>{c.label}</b><span>{c.pinyin} · {scene.province(c.anchorTile)?.name ?? ''}</span></span>
            <span className={styles.srPop}>{popLabel(c.population)}</span></button>) : <p>未找到城镇</p>}
        </div>}
      </div>
      <div className={styles.turn}>青澜流域 · <b>合成世界</b></div>
      <div className={styles.tbButtons}>
        <button className={styles.btn} aria-label="导出地图截图" title="导出当前视图 PNG" onClick={exportMap} disabled={!ready || lost}>
          <UIcon id="share" size={14}/><span className={styles.lbl}>导出</span></button>
        <button className={`${styles.btn} ${styles.btnIcon}`} aria-label="数据说明" title="数据说明" onClick={() => showDialog('data')}>
          <UIcon id="help" size={14}/></button>
        <button className={styles.btn} onClick={() => showDialog('guide')} title="操作与图鉴说明"><UIcon id="pedia" size={14}/><span className={styles.lbl}>图鉴指南</span></button>
      </div>
    </header>
    <div className={styles.mapArea} ref={area} data-lens={lens} data-ready={ready}>
      <canvas className={styles.mapCanvas} ref={canvas} tabIndex={0} aria-label="交互六边形地图"/>
      <canvas className={styles.overlay} ref={overlay} aria-hidden="true"/>
      <div className={styles.markers}>
        {names && ready && !lost && hits.map(h => {
          const c = map.cities[Number(h.city.id)];
          return <button key={c.id} data-map-marker aria-label={`查看${c.label}详情`} className={styles.marker}
            style={{ left: h.x, top: h.y, width: h.w, height: h.h + 4 }}
            onClick={event => { if (event.detail === 0) choose({ kind: 'city', id: c.id }); }}/>;
        })}
      </div>
      {hover && !tooltip && hoverTile !== null && hoverIndex >= 0 && ready && <div className={styles.tooltip}
        style={{ left: Math.min(hover.p[0] + 16, width - 240), top: Math.min(hover.p[1] + 18, height - 70) }}>
        {hoverCity !== null ? <><b>{map.cities[hoverCity].label}</b> · {popLabel(map.cities[hoverCity].population)} 人<br/>
          <span className={styles.muted}>点击查看城镇详情</span></>
          : <><b>{map.land[hoverIndex] ? (map.terrain[hoverIndex] === Terrain.Lake ? '湖泊' : COVER_NAMES[scene.coverOf(hoverTile)]) : '海洋'}</b>
            {map.land[hoverIndex] && map.terrain[hoverIndex] > Terrain.Lake ? ` · ${format.format(map.elevation[hoverIndex])} m` : ''}<br/>
            <span className={styles.muted}>{scene.province(hoverTile) ? `${scene.province(hoverTile)!.name}${scene.province(hoverTile)!.foreign ? '' : '（合成分区）'}` : (map.land[hoverIndex] ? '青澜流域内湖' : '青澜流域外海')}
              {lensDef && map.land[hoverIndex] ? ` · ${lensDef.name} ${map.valid[hoverIndex] ? format.format((lens === 'population' ? map.population : map.economy)[hoverIndex]) : '无数据'}` : ''}</span></>}
      </div>}
      {selected && ready && !lost && <Inspector selected={selected} close={() => choose(null)} locate={locate}/>}
      {tooltip && <div className={`${styles.panel} ${styles.touchTip}`} role="status" style={{ left: Math.min(Math.max(12, tooltip.p[0]-60), width-170), top:Math.max(10,tooltip.p[1]-92) }}>
        <strong>{tooltip.label}</strong><button onClick={() => choose(tooltip.selection)}>查看详情 <Icon name="arrow" size={14}/></button>
      </div>}
      {ready && !lost && <>
        <div className={`${styles.panel} ${styles.tools}`}>
          <button aria-label="重置视野" title="重置视野" onClick={reset}><Icon name="crosshair" size={17}/></button>
          <button aria-label="放大" title="放大" onClick={() => zoom(.72)}><Icon name="plus" size={17}/></button>
          <button aria-label="缩小" title="缩小" onClick={() => zoom(1.39)}><Icon name="minus" size={17}/></button>
        </div>
        <div className={styles.leftStack}>
          <div className={styles.noticeRow}>
            <span className={styles.notice}>{notice}</span>
            <span className={styles.mapScale}><i style={{ width: scalePixels }}/>{km(scaleDistance)} km</span>
          </div>
          <Overview camera={camera} ratio={width/height} move={(x,y) => locate([x,y])} version={colors}/>
        </div>
        <div className={styles.lensArea}>
          {layersOpen && <div className={`${styles.panel} ${styles.layersPop}`} role="group" aria-label="地图图层">
            <div className={styles.spTitle}>地图图层</div>
            {([{ name: '交通网络', sub: '公路与铁路（放大后显示）', icon: 't-rail', on: routes, set: setRoutes },
              { name: '六边形网格', sub: '格线（放大后显示）', icon: 'g-land', on: grid, set: setGrid },
              { name: '地名旗标', sub: '城镇旗标与分区名称', icon: 'pop', on: names, set: setNames }]).map(item =>
              <button key={item.name} role="switch" aria-checked={item.on} className={styles.mlRow} onClick={() => item.set(!item.on)}>
                <UIcon id={item.icon} size={16}/><span><b>{item.name}</b><small>{item.sub}</small></span><i className={item.on ? styles.on : ''}/>
              </button>)}
          </div>}
          {lensDef && <section className={`${styles.panel} ${styles.legend}`} aria-label="图例">
            <div className={styles.lgHead}><span className={styles.lgIc}><UIcon id={lensIcons[lens]} size={14}/></span>
              <span className={styles.lgTitle}>{lenses[lens].name}</span>
              <button className={styles.iconBtn} aria-label="关闭透镜" onClick={() => setLens('terrain')}><Icon name="close" size={12}/></button></div>
            <div className={styles.lgDesc}>{lens === 'population' ? '每格合成人口密度，对数色阶。' : '每格合成经济活动指数，对数色阶。'}数值由固定种子程序生成。</div>
            <div className={styles.ramp} style={{ background: `linear-gradient(90deg, ${lensDef.ramp.join(',')})` }}/>
            <div className={styles.ticks}>
              <span style={{ left: 0 }}>{format.format(lensDef.domain[0])}</span>
              <span style={{ left: '50%', transform: 'translateX(-50%)' }}>{format.format(Math.sqrt(lensDef.domain[0] * lensDef.domain[1]))}</span>
              <span style={{ right: 0 }}>{format.format(lensDef.domain[1])}+</span>
            </div>
            <div className={styles.lgMeta}><span>{lenses[lens].unit}</span><span><i className={styles.noData}/>无数据</span><span>合成数据</span></div>
          </section>}
          <div className={`${styles.panel} ${styles.lensDock}`} role="toolbar" aria-label="地图透镜">
            {(Object.keys(lenses) as Lens[]).map(id => <button key={id} className={`${styles.lensBtn} ${id === lens ? styles.active : ''}`}
              aria-pressed={id === lens} onClick={() => setLens(id === lens && id !== 'terrain' ? 'terrain' : id)}>
              <UIcon id={lensIcons[id]} size={15}/><span>{dockNames[id]}</span></button>)}
            <button className={`${styles.lensBtn} ${styles.lensMore}`} aria-expanded={layersOpen} aria-label="地图图层"
              onClick={() => setLayersOpen(!layersOpen)}><UIcon id="layers" size={15}/><span>地图</span><b className={styles.count}>{layerCount}</b></button>
          </div>
        </div>
      </>}
      {(error || lost) && <div className={`${styles.panel} ${styles.failure}`} role="alert"><Icon name="map" size={30}/><h2>{lost ? '正在恢复地图' : '无法打开地图'}</h2>
        <p>{lost ? 'WebGL2 上下文已中断，恢复后会重新绘制。' : error}</p></div>}
      {feedback && <div className={styles.toast} role="status">{feedback}</div>}
    </div>
    <dialog ref={dialog} className={`${styles.panel} ${styles.dialog}`}>
      <header><h2>{dialogMode === 'guide' ? '图鉴指南' : '数据说明'}</h2>
        <button className={styles.iconBtn} onClick={() => dialog.current?.close()} aria-label="关闭"><Icon name="close" size={13}/></button></header>
      {dialogMode === 'guide' ? <><p>从地形、人口密度和经济活动三个透镜观察青澜流域。点击城镇旗标、线路或地块查看详情；悬停地块可看到地表、海拔与所属分区。</p>
        <p>拖动、滚轮、方向键或 WASD 移动与缩放视野，按 / 搜索城镇。触控支持拖动、双指捏合、双击放大、双指轻点缩小及长按查看提示。</p>
        <p className={styles.muted}>视觉语言与地图绘制代码移植自 Andrej Karpathy 的 USACiv（karpathy.ai/usaciv，MIT 许可，版权声明见 LICENSE-USACIV.txt）。</p></>
        : <><p>{notice}。地貌、聚落、分区、交通与指标均由固定种子程序生成，不代表真实地理、行政区划或统计数据。</p>
          <p>地表覆盖、地势等级、近海水深与“合成分区”是由合成地形推导的可视化分类。人口密度与经济活动透镜使用对数色阶，灰色表示无数据。</p>
          <p>城镇美术分级按数据集规模放大 4 倍取档，旗标与面板中显示的人口仍为原合成数值。</p>
          <p>半径 12 km 尖顶六边形合成网格，共 {format.format(tileCount)} 格；当前视野宽 {km(camera.width)} km。</p></>}
    </dialog>
  </div>;
}
