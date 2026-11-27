import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyEvent } from 'react';
import { Terrain, terrainColors, terrainNames, type CameraView, type Lens, type Point, type RenderView,
  type Selection, type TileId } from '../../../packages/core-types/src/map';
import { pickTile, tileCenter } from '../../../packages/hexgrid/src/grid';
import { AtlasRenderer } from '../../../packages/renderer/src/AtlasRenderer';
import { boundCamera, screenAt, worldAt, zoomAt } from '../../../packages/renderer/src/camera';
import { createFixture, DEFAULT_VIEW } from '../../../packages/test-utils/src/fixture';
import { lenses } from '../../../packages/almanac/src/lenses';
import { connectInput } from './shell/InputRouter';
import { Icon } from './Icons';
import styles from './App.module.css';

const map = createFixture();
const defaultSelection: Selection = { kind: 'city', id: 0 };
const tileCount = map.window.cols * map.window.rows;
const notice = '合成技术样例，非真实地图';
const lensIcons = { terrain: 'mountain', population: 'people', economy: 'economy' };
const smallBounds = [-1760000, -1060000, 1560000, 1120000] as const;
const format = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 1 });
const km = (n: number) => format.format(Math.round(n / 1000));

function pointSegmentDistance(p: Point, a: Point, b: Point) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((p[0]-a[0])*dx + (p[1]-a[1])*dy) / (dx*dx+dy*dy)));
  return Math.hypot(p[0]-a[0]-t*dx, p[1]-a[1]-t*dy);
}

function drawOverview(canvas: HTMLCanvasElement, view: RenderView) {
  const ctx = canvas.getContext('2d')!;
  const { width, height } = canvas;
  const image = ctx.createImageData(width, height);
  const palette = terrainColors.map(c => c.match(/.{2}/g)!.map(x => Number.parseInt(x,16)));
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const id = pickTile(view.grid, smallBounds[0] + (x / width) * (smallBounds[2] - smallBounds[0]),
      smallBounds[3] - (y / height) * (smallBounds[3] - smallBounds[1]));
    const t = id === null ? 0 : view.terrain[view.tileIndex(id)];
    const c = palette[t] ?? palette[0];
    image.data.set([...c, 255], (y * width + x) * 4);
  }
  ctx.putImageData(image, 0, 0);
}

function Overview({ camera, ratio, move }: { camera: CameraView; ratio: number; move: (x: number,y: number) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => { if (canvas.current) drawOverview(canvas.current, map); }, []);
  const [x0, y0, x1, y1] = smallBounds, width = x1-x0, height = y1-y0;
  const halfH = camera.width / ratio / 2;
  const pct = (n: number) => `${n*100}%`;
  return <section className={styles.overview} aria-label="小地图">
    <div><Icon name="compass" size={14}/> 区域总览 <span>北 ↑</span></div>
    <button aria-label="在小地图上定位" onClick={event => {
      const r = event.currentTarget.getBoundingClientRect();
      if (event.detail === 0) move(DEFAULT_VIEW.x, DEFAULT_VIEW.y);
      else move(x0 + (event.clientX-r.left)/r.width*width, y1 - (event.clientY-r.top)/r.height*height);
    }}>
      <canvas ref={canvas} width={300} height={148}/>
      <span className={styles.viewport} style={{ left: pct((camera.x-camera.width/2-x0)/width),
        top: pct((y1-camera.y-halfH)/height), width: pct(camera.width/width), height: pct(halfH*2/height) }}/>
    </button>
  </section>;
}

function Inspector({ selected, close, locate }: { selected: Selection; close: () => void; locate: (p: Point, width?: number) => void }) {
  const city = selected.kind === 'city' ? map.cities[selected.id] : null;
  const line = selected.kind === 'edge' ? map.network[selected.id] : null;
  const tile = city?.anchorTile ?? (selected.kind === 'tile' ? selected.id : null);
  const index = tile === null ? -1 : map.tileIndex(tile);
  const t = index >= 0 ? map.terrain[index] : Terrain.Ocean;
  const valid = index >= 0 && map.valid[index] !== 0;
  const target = city ? [city.anchorX, city.anchorY] as const : line ? line.points[Math.floor(line.points.length / 2)] : tile !== null ? tileCenter(map.grid, tile) : null;
  return <section className={styles.inspector} aria-label="地图详情">
    <header><span><Icon name={city ? 'city' : line ? 'route' : 'hex'} size={15}/>{city ? '城镇详情' : line ? '线路详情' : '地块详情'}</span>
      <button className={styles.iconButton} onClick={close} aria-label="关闭详情"><Icon name="close" size={17}/></button></header>
    <div className={styles.inspectorContent}>
      <div className={styles.placeHeader}>
        <span className={styles.placeStamp}><Icon name={city ? 'city' : line ? 'route' : 'mountain'} size={27}/></span>
        <div><h2>{city?.label ?? line?.name ?? terrainNames[t]}</h2><span>{city ? city.pinyin.toUpperCase() : line ? '青澜流域' : `地块 #${tile}`}</span></div>
      </div>
      {city && <p>{city.description}</p>}
      {line && <p>青澜流域的合成{line.mode0 === 'rail' ? '铁路' : '公路'}。端点与线形均为程序生成。</p>}
      {city ? <dl className={styles.metrics}>
        <div><dt>城镇人口</dt><dd>{format.format(city.population / 10000)}<small> 万人</small></dd></div>
        <div><dt>经济总量</dt><dd>{format.format(city.economy)}<small> 亿元</small></dd></div>
        <div><dt>锚点地形</dt><dd>{terrainNames[t]}</dd></div>
        <div><dt>锚点海拔</dt><dd>{format.format(map.elevation[index])}<small> m</small></dd></div>
      </dl> : line ? <dl className={styles.metrics}>
        <div><dt>交通方式</dt><dd>{line.mode0 === 'rail' ? '铁路' : '公路'}</dd></div>
        <div><dt>状态</dt><dd>通行</dd></div>
      </dl> : <dl className={styles.metrics}>
        <div><dt>人口密度</dt><dd>{valid ? format.format(map.population[index]) : '无数据'}{valid && <small> 人/km²</small>}</dd></div>
        <div><dt>经济活动</dt><dd>{valid ? format.format(map.economy[index]) : '无数据'}</dd></div>
        <div><dt>海拔</dt><dd>{t > Terrain.Lake ? format.format(map.elevation[index]) : '无数据'}</dd></div>
        <div><dt>网格编号</dt><dd>{tile}</dd></div>
      </dl>}
      <div className={styles.inspectorFooter}><span><i/>合成数据</span>{target && <button onClick={() => locate(target, 690000)}>定位 <Icon name="arrow" size={14}/></button>}</div>
    </div>
  </section>;
}

type Bench = { getView(): CameraView; setView(v: CameraView): void; stats(): AtlasRenderer['stats'];
  capabilities: AtlasRenderer['capabilities']; size(): Point; getSelection(): Selection | null };

declare global { interface Window { atlasBench?: Bench } }

export function App() {
  const area = useRef<HTMLDivElement>(null), canvas = useRef<HTMLCanvasElement>(null);
  const searchInput = useRef<HTMLInputElement>(null), dialog = useRef<HTMLDialogElement>(null);
  const renderer = useRef<AtlasRenderer | null>(null), cameraLive = useRef<CameraView>(DEFAULT_VIEW);
  const [camera, setCamera] = useState(DEFAULT_VIEW), [size, setSize] = useState<Point>([1,1]);
  const [lens, setLens] = useState<Lens>('terrain'), [grid, setGrid] = useState(true);
  const [routes, setRoutes] = useState(true), [names, setNames] = useState(true);
  const [selected, setSelected] = useState<Selection | null>(defaultSelection);
  const [hover, setHover] = useState<TileId | null>(null);
  const [tooltip, setTooltip] = useState<{ p: Point; label: string; selection: Selection } | null>(null);
  const [error, setError] = useState(''), [lost, setLost] = useState(false), [ready, setReady] = useState(false);
  const [query, setQuery] = useState(''), [searchOpen, setSearchOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'guide' | 'data'>('guide');
  const [layersOpen, setLayersOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [width, height] = size;
  const drawnCities = useRef(new Set<number>());
  const drawState = useRef({ lens, grid, routes, selected, hover, size });
  drawState.current = { lens, grid, routes, selected, hover, size };

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
  function detailsAt(p: Point, touch: boolean): Selection | null {
    const [w, h] = drawState.current.size;
    const v = cameraLive.current;
    const radius = touch ? 22 : 9;
    let nearestCity: { id: number; d: number } | null = null;
    for (const city of map.cities) {
      if (!drawnCities.current.has(city.id)) continue;
      const s = screenAt(v, w, h, [city.anchorX, city.anchorY]);
      const d = Math.hypot(p[0]-s[0], p[1]-s[1]);
      const flag = Math.abs(p[0]-s[0]) < 30 && p[1] > s[1]-40 && p[1] <= s[1]+5;
      if ((flag || d < radius) && (!nearestCity || d < nearestCity.d)) nearestCity = { id: city.id, d };
    }
    if (nearestCity) return { kind: 'city', id: nearestCity.id };
    const world = worldAt(v, w, h, ...p);
    const hitDistance = (touch ? 22 : 6)*v.width/w;
    if (drawState.current.routes) {
      let nearestLine: { id: number; d: number } | null = null;
      for (const line of map.network) for (let i = 1; i < line.points.length; i++) {
        const d = pointSegmentDistance(world, line.points[i-1], line.points[i]);
        if (d <= hitDistance && (!nearestLine || d < nearestLine.d)) nearestLine = { id: line.lineId, d };
      }
      if (nearestLine) return { kind: 'edge', id: nearestLine.id };
    }
    const id = pickTile(map.grid, ...world);
    return id === null || map.tileIndex(id) < 0 ? null : { kind: 'tile', id };
  }

  useLayoutEffect(() => {
    const el = area.current, target = canvas.current;
    if (!el || !target) return;
    const resize = () => setSize([el.clientWidth, el.clientHeight]);
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    let atlas: AtlasRenderer;
    try { atlas = new AtlasRenderer(target, map, setLost); }
    catch (e) { setError((e as Error).message); return () => observer.disconnect(); }
    renderer.current = atlas;
    setReady(true);
    const disconnect = connectInput(el, {
      canvas: target, bounds: map.bounds, getView: () => cameraLive.current, setView: updateView,
      tap: (p, touch) => choose(detailsAt(p, touch)),
      hover: p => {
        if (!p) { setHover(null); return; }
        const [w,h] = drawState.current.size;
        setHover(pickTile(map.grid, ...worldAt(cameraLive.current, w, h, ...p)));
      },
      inspect: p => {
        const hit = detailsAt(p, true);
        if (!hit) return;
        const label = hit.kind === 'city' ? map.cities[hit.id].label : hit.kind === 'edge' ? map.network[hit.id].name : terrainNames[map.terrain[map.tileIndex(hit.id)]];
        setTooltip({ p, label, selection: hit });
      },
    });
    const debug = new URLSearchParams(location.search).has('bench');
    if (debug) window.atlasBench = {
      getView: () => cameraLive.current, setView: updateView, stats: () => atlas.stats,
      capabilities: atlas.capabilities, size: () => drawState.current.size,
      getSelection: () => drawState.current.selected,
    };
    return () => {
      if (debug) delete window.atlasBench;
      disconnect(); observer.disconnect(); atlas.dispose(); renderer.current = null;
    };
  }, []);

  const city = selected?.kind === 'city' ? map.cities[selected.id] : null;
  const activeTile = city?.anchorTile ?? (selected?.kind === 'tile' ? selected.id : null);
  useLayoutEffect(() => {
    if (!renderer.current || lost) return;
    const handle = requestAnimationFrame(() => {
      renderer.current?.setOptions(lens, grid, routes, activeTile, hover);
      renderer.current?.render(camera, width, height);
    });
    return () => cancelAnimationFrame(handle);
  }, [camera, width, height, lens, grid, routes, activeTile, hover, lost]);

  useEffect(() => {
    function key(e: KeyboardEvent) {
      if (e.key === '/' && !dialog.current?.open && !['INPUT','TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault(); searchInput.current?.focus();
      }
      if (e.key === 'Escape') setTooltip(null);
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
    const src = canvas.current;
    if (!atlas || !src || atlas.lost) return;
    const out = document.createElement('canvas');
    out.width = src.width; out.height = src.height;
    const ctx = out.getContext('2d');
    if (!ctx) return;
    atlas.render(camera, width, height);
    ctx.drawImage(src, 0, 0);
    const scale = out.width / width;
    ctx.scale(scale, scale);
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    for (const {place, point:[x,y]} of labels) {
      ctx.fillStyle = '#35473d'; ctx.fillRect(x-19,y-25,38,22);
      ctx.fillStyle = '#f9ecd0'; ctx.fillText(place.label, x, y-9);
      ctx.beginPath(); ctx.arc(x,y,2.8,0,Math.PI*2); ctx.fill();
    }
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f3ead7'; ctx.fillRect(12,height-40,270,29);
    ctx.fillStyle = '#5a382d'; ctx.fillText(`华夏图鉴 · ${notice}`, 22, height-20);
    out.toBlob(blob => {
      if (!blob) { setFeedback('截图生成失败'); return; }
      const url = URL.createObjectURL(blob), link = document.createElement('a');
      link.href = url; link.download = '华夏图鉴-青澜流域.png'; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      setFeedback('已导出当前地图');
    });
  }

  const search = query.trim().toLowerCase();
  const results = search ? map.cities.filter(c => c.label.includes(search) || c.pinyin.includes(search)) : [];
  function searchTo(id: number) {
    const place = map.cities[id]; choose({ kind: 'city', id });
    locate([place.anchorX,place.anchorY], 1160000); setSearchOpen(false); setQuery('');
  }
  function searchKeys(e: ReactKeyEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && results.length) searchTo(results[0].id);
    if (e.key === 'Escape') setSearchOpen(false);
  }

  const labels: { place: RenderView['cities'][number]; point: Point }[] = [];
  if (names && ready && !lost) for (const place of map.cities) {
    if (camera.width > 3500000 && ![0,1,3,8].includes(place.id)) continue;
    const point = screenAt(camera, width, height, [place.anchorX, place.anchorY]);
    if (point[0] < 34 || point[0] > width-34 || point[1] < 47 || point[1] > height-28) continue;
    if (labels.some(label => Math.abs(point[0]-label.point[0]) < 57 && Math.abs(point[1]-label.point[1]) < 30)) continue;
    labels.push({ place, point });
  }
  drawnCities.current = new Set(labels.map(({ place }) => place.id));
  const scaleM = camera.width / Math.max(width, 1) * 90;
  const scaleStep = 10 ** Math.floor(Math.log10(scaleM));
  const scaleDistance = Math.floor(scaleM/scaleStep) * scaleStep;
  const scalePixels = scaleDistance / camera.width * width;
  const legendTerrain = [3,4,6,10,1,0];

  return <div className={styles.app}>
    <header className={styles.top}>
      <div className={styles.brand}><img src="./seal.svg" alt=""/><div><strong>华夏文明</strong><span>CHINACIV</span></div></div>
      <nav aria-label="主导航">
        <button className={styles.current} aria-current="page" onClick={reset}><Icon name="map" size={17}/>华夏图鉴</button>
        <button onClick={() => showDialog('guide')}><Icon name="book" size={17}/>图鉴指南</button>
      </nav>
      <div className={styles.topActions}>
        <div className={styles.search}>
          <Icon name="search" size={16}/>
          <input ref={searchInput} placeholder="搜索城镇" aria-label="搜索城镇" value={query} onKeyDown={searchKeys}
            onFocus={() => setSearchOpen(true)} onBlur={e => { if (!e.currentTarget.parentElement?.contains(e.relatedTarget)) setSearchOpen(false); }}
            onChange={e => { setQuery(e.target.value); setSearchOpen(true); }}/>
          <kbd>/</kbd>
          {searchOpen && search && <div className={styles.searchResults}>
            {results.length ? results.map(c => <button key={c.id} onClick={() => searchTo(c.id)}><Icon name="pin" size={15}/>{c.label}<small>{c.pinyin}</small></button>) : <p>未找到城镇</p>}
          </div>}
        </div>
        <button className={styles.iconButton} aria-label="导出地图截图" title="导出地图截图" onClick={exportMap} disabled={!ready || lost}><Icon name="camera" size={19}/></button>
        <button className={styles.iconButton} aria-label="数据说明" title="数据说明" onClick={() => showDialog('data')}><Icon name="info" size={19}/></button>
      </div>
    </header>
    <main className={styles.main}>
      <aside className={`${styles.sidebar} ${layersOpen ? styles.sidebarOpen : ''}`} aria-label="地图图层">
        <div className={styles.sideTop}>
          <div className={styles.sideTitle}><Icon name="layers" size={18}/><h2>地图透镜</h2></div>
          {(Object.keys(lenses) as Lens[]).map(id => <button className={`${styles.lens} ${id === lens ? styles.active : ''}`}
            key={id} aria-pressed={id === lens} onClick={() => { setLens(id); setLayersOpen(false); }}>
            <span className={styles.lensIcon}><Icon name={lensIcons[id]} size={19}/></span>
            <span><strong>{lenses[id].name}</strong><small>{lenses[id].sub}</small></span>
          </button>)}
        </div>
        <div className={styles.toggles}>
          <h3>地图要素</h3>
          {([{ name: '交通网络', icon: 'route', on: routes, set: setRoutes }, { name: '六边形网格', icon: 'hex', on: grid, set: setGrid },
            { name: '地名旗标', icon: 'pin', on: names, set: setNames }]).map(item =>
            <button key={item.name} role="switch" aria-checked={item.on} onClick={() => item.set(!item.on)}>
              <Icon name={item.icon} size={16}/><span>{item.name}</span><i className={item.on ? styles.on : ''}/>
            </button>)}
        </div>
        <section className={styles.legend} aria-label="图例">
          <h3>图例 <span>{lenses[lens].name}</span></h3>
          {lens === 'terrain' ? <div className={styles.swatches}>{legendTerrain.map(t =>
            <div key={t}><i style={{ background: '#' + terrainColors[t] }}/>{terrainNames[t]}</div>)}</div>
            : <><div className={`${styles.gradient} ${lens === 'economy' ? styles.economy : ''}`}/><div className={styles.legendNumbers}>
              <span>0</span><span>{lens === 'population' ? '162.5' : '50'}</span><span>{lens === 'population' ? '650+' : '200+'}</span></div>
              <div className={styles.legendUnit}>{lenses[lens].unit}<span><i/>无数据</span></div></>}
        </section>
      </aside>
      <div className={styles.mapArea} ref={area} data-lens={lens} data-ready={ready}>
        <canvas className={styles.mapCanvas} ref={canvas} tabIndex={0} aria-label="交互六边形地图"/>
        <div className={styles.mapTitle}>
          <span><i/> 合成世界</span><h1>青澜流域</h1>
        </div>
        <button className={`${styles.iconButton} ${styles.mobileLayers}`} onClick={() => setLayersOpen(!layersOpen)}
          aria-label="切换图层面板" aria-expanded={layersOpen}><Icon name="layers" size={20}/></button>
        <div className={styles.markers}>
          {names && camera.width < 2700000 && map.regions.map(region => {
            const [x,y] = screenAt(camera,width,height,region.point);
            if (x < 66 || x > width-80 || y < 36 || y > height-28) return null;
            return <span key={region.name} className={styles.region} style={{ left:x, top:y }}>{region.name}</span>;
          })}
          {labels.map(({place,point:[x,y]}) => <button key={place.id} data-map-marker aria-label={`查看${place.label}详情`}
            className={`${styles.marker} ${city?.id === place.id ? styles.selectedMarker : ''}`}
            style={{left:x,top:y}} onClick={event => { if (event.detail === 0) choose({kind:'city',id:place.id}); }}>
            <span><Icon name="city" size={14}/>{place.label}</span>
          </button>)}
        </div>
        {selected && ready && !lost && <Inspector selected={selected} close={() => choose(null)} locate={locate}/>}
        {tooltip && <div className={styles.tooltip} role="status" style={{ left: Math.min(Math.max(12, tooltip.p[0]-45),width-134), top:Math.max(10,tooltip.p[1]-88) }}>
          <strong>{tooltip.label}</strong><button onClick={() => choose(tooltip.selection)}>查看详情 <Icon name="arrow" size={14}/></button>
        </div>}
        {ready && !lost && <>
          <div className={styles.tools}>
            <button aria-label="重置视野" title="重置视野" onClick={reset}><Icon name="crosshair" size={20}/></button>
            <button aria-label="放大" title="放大" onClick={() => zoom(.72)}><Icon name="plus"/></button>
            <button aria-label="缩小" title="缩小" onClick={() => zoom(1.39)}><Icon name="minus"/></button>
          </div>
          <Overview camera={camera} ratio={width/height} move={(x,y) => locate([x,y])}/>
          <div className={styles.mapBottom}>
            <div className={styles.mapScale}><i style={{ width: scalePixels }}/>{km(scaleDistance)} km</div>
            <span>{notice}</span>
          </div>
        </>}
        {(error || lost) && <div className={styles.failure} role="alert"><Icon name="map" size={30}/><h2>{lost ? '正在恢复地图' : '无法打开地图'}</h2>
          <p>{lost ? 'WebGL2 上下文已中断，恢复后会重新绘制。' : error}</p></div>}
        {feedback && <div className={styles.toast} role="status">{feedback}</div>}
      </div>
    </main>
    <footer className={styles.status}>
      <span><i/> P1a 技术原型</span><span className={styles.hints}><Icon name="pointer" size={13}/><span>拖动平移 · 滚轮或捏合缩放 · 点选查看详情</span></span>
      <span className={styles.dimensions}>{format.format(tileCount)} 格 <b>·</b> 视野 {km(camera.width)} km</span>
    </footer>
    <dialog ref={dialog} className={styles.dialog}>
      <header><h2>{dialogMode === 'guide' ? '图鉴指南' : '数据说明'}</h2>
        <button className={styles.iconButton} onClick={() => dialog.current?.close()} aria-label="关闭"><Icon name="close"/></button></header>
      {dialogMode === 'guide' ? <><p>从地形、人口和经济三个透镜观察青澜流域。点选旗标、线路或网格可查看详情。</p>
        <p>用鼠标拖动、滚轮或方向键移动视野。触控支持拖动、双指捏合、双击放大、双指轻点缩小及长按查看提示。</p></>
        : <><p>{notice}。地貌、聚落、交通与指标由固定种子程序生成。</p><p>人口密度采用平方根颜色映射，经济活动为合成指数。斜线表示无数据。</p><p>使用半径 12 km 的尖顶六边形合成网格。</p></>}
    </dialog>
  </div>;
}
