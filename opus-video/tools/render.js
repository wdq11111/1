#!/usr/bin/env node
/* 逐帧渲染：Playwright 打开 src/index.html，按帧调用 renderFrame(t) 截图，交给 ffmpeg 编码。
   用法：
     node tools/render.js stills 3.2 15 40.5     # 指定时间点出静帧到 build/stills/
     node tools/render.js contact                 # 每个镜头抽 3 帧，拼成总览图 build/contact.png
     node tools/render.js video [--workers 4]     # 全片渲染到 build/video.mp4（无声）
*/
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BUILD = path.join(ROOT, 'build');
const TL = JSON.parse(fs.readFileSync(path.join(BUILD, 'timeline.json'), 'utf8'));
const URL = 'file://' + path.join(ROOT, 'src/index.html');

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => { console.error('[page error]', e.message); process.exitCode = 1; });
  page.on('console', m => { if (m.type() === 'error') console.error('[console]', m.text()); });
  await page.goto(URL);
  const info = await page.evaluate(tl => window.setup(tl), TL);
  await page.evaluate(async () => {
    // 预热字体：把所有用到的字重都渲染一遍再等待
    await document.fonts.ready;
    for (let i = 0; i < 3; i++) { window.renderFrame(i * 20); await document.fonts.ready; }
  });
  return { page, info };
}

async function shot(page, t, type = 'png') {
  await page.evaluate(tt => window.renderFrame(tt), t);
  return page.screenshot({ type, ...(type === 'jpeg' ? { quality: 95 } : {}), animations: 'disabled', caret: 'initial' });
}

async function stills(times) {
  const browser = await chromium.launch();
  const { page } = await openPage(browser);
  fs.mkdirSync(path.join(BUILD, 'stills'), { recursive: true });
  for (const t of times) {
    const buf = await shot(page, t);
    const f = path.join(BUILD, 'stills', `t${t.toFixed(2).padStart(7, '0')}.png`);
    fs.writeFileSync(f, buf);
    console.log(f);
  }
  await browser.close();
}

async function contact() {
  const times = [];
  for (const s of TL.scenes) {
    const d = s.end - s.start;
    times.push(s.start + d * .3, s.start + d * .62, s.start + d * .92);
  }
  const browser = await chromium.launch();
  const { page } = await openPage(browser);
  const dir = path.join(BUILD, 'contact'); fs.mkdirSync(dir, { recursive: true });
  const files = [];
  for (let i = 0; i < times.length; i++) {
    const f = path.join(dir, `c${String(i).padStart(2, '0')}.png`);
    fs.writeFileSync(f, await shot(page, times[i]));
    files.push(f);
  }
  await browser.close();
  // 3 列一行一个镜头，缩到 640 宽
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(dir, 'c%02d.png'), '-vf', 'scale=640:-1,tile=3x12:padding=6:color=black', '-frames:v', '1', path.join(BUILD, 'contact.png')]);
  console.log(path.join(BUILD, 'contact.png'));
}

async function renderRange(k, a, b, fps, out) {
  const browser = await chromium.launch();
  const { page } = await openPage(browser);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-tune', 'grain', '-pix_fmt', 'yuv420p', '-r', String(fps), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = a; f < b; f++) {
    const buf = await shot(page, f / fps, 'jpeg');
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((f - a) % 150 === 0) console.log(`[w${k}] ${f - a}/${b - a} 帧  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise((res, rej) => ff.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg ' + c)))));
  await browser.close();
}

async function video(workers) {
  const fps = TL.fps, total = Math.round(TL.duration * fps);
  const segDir = path.join(BUILD, 'seg'); fs.mkdirSync(segDir, { recursive: true });
  const per = Math.ceil(total / workers);
  const jobs = [];
  for (let k = 0; k < workers; k++) {
    const a = k * per, b = Math.min(total, a + per);
    if (a >= b) break;
    jobs.push(renderRange(k, a, b, fps, path.join(segDir, `seg${k}.mp4`)));
  }
  await Promise.all(jobs);
  const list = jobs.map((_, k) => `file '${path.join(segDir, `seg${k}.mp4`)}'`).join('\n');
  fs.writeFileSync(path.join(segDir, 'list.txt'), list);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(segDir, 'list.txt'), '-c', 'copy', path.join(BUILD, 'video.mp4')]);
  console.log('完成：', path.join(BUILD, 'video.mp4'), total, '帧');
}

(async () => {
  const [mode, ...rest] = process.argv.slice(2);
  if (mode === 'stills') await stills(rest.map(Number));
  else if (mode === 'contact') await contact();
  else if (mode === 'video') {
    const i = rest.indexOf('--workers');
    await video(i >= 0 ? +rest[i + 1] : 4);
  } else {
    console.log('用法见文件开头注释'); process.exit(1);
  }
})().catch(e => { console.error(e); process.exit(1); });
