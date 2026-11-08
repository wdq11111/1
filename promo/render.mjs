// 用法：
//   node render.mjs stills out.png 2 7 12 15 19.5 25 29      渲染若干时刻并拼成总览图
//   node render.mjs video out.mp4 [fps] [from] [to]           逐帧渲染无声视频
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff' };

const server = http.createServer((req, res) => {
  const p = path.join(here, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(here) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}/index.html`;

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('pageerror', e.message));
page.on('console', m => { if (m.type() === 'error') console.error('console', m.text()); });
await page.goto(url);
await page.waitForFunction(() => window.ready === true, null, { timeout: 120000 });

async function frame(t) {
  await page.evaluate(t => window.renderAt(t), t);
  return page.screenshot({ type: 'png' });
}

const [mode, out, ...rest] = process.argv.slice(2);
if (mode === 'stills') {
  const times = rest.map(Number);
  const dir = path.join(path.dirname(out), 'stills');
  fs.mkdirSync(dir, { recursive: true });
  const files = [];
  for (const t of times) {
    const f = path.join(dir, `t${String(t).replace('.', '_')}.png`);
    fs.writeFileSync(f, await frame(t)); files.push(f);
    console.log('still', t);
  }
  // 拼成总览图（每行 2 张，带时间标注）
  const cols = 2, tw = 960, th = 540;
  const inputs = files.flatMap(f => ['-i', f]);
  const scaled = files.map((_, i) => `[${i}:v]scale=${tw}:${th},drawtext=text='${times[i]}s':x=20:y=20:fontsize=36:fontcolor=white:box=1:boxcolor=black@0.6[s${i}]`).join(';');
  const layout = files.map((_, i) => `${(i % cols) * tw}_${Math.floor(i / cols) * th}`).join('|');
  const filter = `${scaled};${files.map((_, i) => `[s${i}]`).join('')}xstack=inputs=${files.length}:layout=${layout}:fill=black`;
  await new Promise((res, rej) => {
    const p = spawn('ffmpeg', ['-y', ...inputs, '-filter_complex', filter, out], { stdio: 'inherit' });
    p.on('exit', c => (c === 0 ? res() : rej(new Error('ffmpeg ' + c))));
  });
} else if (mode === 'video') {
  const fps = Number(rest[0] || 30), from = Number(rest[1] || 0), to = Number(rest[2] || 30);
  const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round((to - from) * fps);
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    const buf = await frame(from + i / fps);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 30 === 0) console.log(`frame ${i}/${n}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('exit', r));
}
await browser.close();
server.close();
