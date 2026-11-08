// 多引擎翻译工具的本地服务：提供页面，并把翻译请求转发给各家 API。
// 密钥只放在服务端（.env），不会发到浏览器。
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

// 读取 .env（不依赖 dotenv；已存在的环境变量优先）
const envFile = path.join(here, '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!m || line.trim().startsWith('#')) continue;
    const v = m[2].replace(/^(['"])(.*)\1$/, '$2');
    if (process.env[m[1]] === undefined) process.env[m[1]] = v;
  }
}

const { ENGINES, LANGS } = await import('./engines.mjs');

const PORT = Number(process.env.PORT) || 8787;
const HOST = process.env.HOST || '127.0.0.1';
const MAX_CHARS = 5000;
const page = fs.readFileSync(path.join(here, 'index.html'));

function send(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

async function readJson(req) {
  let size = 0;
  const chunks = [];
  for await (const c of req) {
    size += c.length;
    if (size > 100_000) throw new Error('请求体太大');
    chunks.push(c);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(page);
    }
    if (req.method === 'GET' && req.url === '/api/engines') {
      const list = ENGINES
        .filter(e => !e.id.startsWith('llm') || e.configured()) // 未配置的自定义大模型不显示
        .map(e => ({ id: e.id, name: e.name, configured: e.configured() }));
      return send(res, 200, { engines: list, langs: LANGS });
    }
    if (req.method === 'POST' && req.url === '/api/translate') {
      const { engine, text, from = 'auto', to } = await readJson(req);
      const e = ENGINES.find(x => x.id === engine);
      if (!e) return send(res, 400, { error: '未知引擎' });
      if (!e.configured()) return send(res, 400, { error: '该引擎未配置密钥' });
      if (typeof text !== 'string' || !text.trim()) return send(res, 400, { error: '文本为空' });
      if (text.length > MAX_CHARS) return send(res, 400, { error: `单次最多 ${MAX_CHARS} 字` });
      if (!LANGS[to] || (from !== 'auto' && !LANGS[from])) return send(res, 400, { error: '语言参数不对' });
      const t0 = Date.now();
      try {
        const out = await e.translate({ text, from, to });
        return send(res, 200, { ...out, ms: Date.now() - t0 });
      } catch (err) {
        return send(res, 502, { error: err.message || String(err), ms: Date.now() - t0 });
      }
    }
    send(res, 404, { error: 'not found' });
  } catch (err) {
    send(res, 400, { error: err.message || String(err) });
  }
});

server.listen(PORT, HOST, () => {
  const on = ENGINES.filter(e => e.configured()).map(e => e.name);
  console.log(`翻译工具已启动：http://${HOST}:${PORT}`);
  console.log(`已启用引擎：${on.join('、') || '无'}`);
});
