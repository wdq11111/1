import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

const viewport = { width: 1440, height: 900 };
const executablePath = process.env.CHINACIV_CHROMIUM || undefined;
const baseUrl = process.env.CHINACIV_URL || 'http://localhost:5173';
const browser = await chromium.launch({ executablePath, args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
try {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  const t0 = performance.now();
  await page.goto(new URL('/?bench=1', baseUrl).href);
  await page.waitForFunction(() => (window.atlasBench?.stats()?.drawCalls ?? 0) > 0);
  const readyMs = performance.now() - t0;
  const measurement = await page.evaluate(async () => {
    const bench = window.atlasBench;
    const start = bench.getView();
    const cold = bench.stats();
    const cameraPath = [
      start, {x:-140000,y:80000,width:1820000}, {x:35000,y:360000,width:1120000},
      {x:245000,y:40000,width:850000}, {x:610000,y:-110000,width:725000},
      {x:770000,y:155000,width:1490000}, {x:360000,y:-220000,width:2280000},
      {x:140000,y:240000,width:2800000}, start,
    ];
    const frameStats = [], frameIntervals = [];
    let prior = null;
    const frame = () => new Promise(resolve => requestAnimationFrame(resolve));
    const first = await frame(), end = first+17000;
    for (let now = first; now < end; now = await frame()) {
      const elapsed = now-first;
      const position = (elapsed / 1500) % 8, index = Math.floor(position), t = position-index;
      const a = cameraPath[index], b = cameraPath[index+1];
      bench.setView({ x:a.x+(b.x-a.x)*t, y:a.y+(b.y-a.y)*t, width:a.width+(b.width-a.width)*t });
      if (elapsed >= 5000 && prior !== null) {
        frameIntervals.push(now-prior);
        frameStats.push(bench.stats());
      }
      prior = now;
    }
    const summarize = samples => {
      const sorted = [...samples].sort((a,b) => a-b);
      const percentile = fraction => sorted[Math.max(0, Math.ceil(sorted.length * fraction)-1)];
      return { n:sorted.length, average:samples.reduce((a,b)=>a+b,0)/samples.length,
        p50:percentile(.5), p95:percentile(.95), max:sorted.at(-1) };
    };
    return { ua:navigator.userAgent, dpr:devicePixelRatio, capabilities:bench.capabilities,
      firstRender:cold, rafIntervalMs:summarize(frameIntervals),
      renderCpuMs:summarize(frameStats.map(s=>s.frameMs)), missed50ms:frameIntervals.filter(x=>x>50).length,
      drawCallsMax:Math.max(...frameStats.map(s=>s.drawCalls)), trianglesMax:Math.max(...frameStats.map(s=>s.triangles)),
      spriteInstancesMax:Math.max(...frameStats.map(s=>s.instances)), textureBytesEstimate:frameStats[0].textureBytes,
      // P1a-02: the USACiv painters repaint the cached static layer when the view leaves the cache or a zoom settles.
      staticRepaints:frameStats.at(-1).staticPaints-frameStats[0].staticPaints,
      staticPaintMs:summarize(frameStats.filter((s,i)=>i>0 && s.staticPaints!==frameStats[i-1].staticPaints).map(s=>s.staticMs)),
      bannersMax:Math.max(...frameStats.map(s=>s.banners)), lodSeen:[...new Set(frameStats.map(s=>s.lod))] };
  });
  const result = { viewport, browser:browser.version(), host:process.platform+' '+process.arch,
    warmupMs:5000, sampleWindowMs:12000, readyMs, ...measurement, errors };
  const json = JSON.stringify(result,null,2)+'\n';
  await writeFile('reports/cloud-benchmark.json',json);
  process.stdout.write(json);
  if (errors.length) process.exitCode = 1;
} finally { await browser.close(); }
