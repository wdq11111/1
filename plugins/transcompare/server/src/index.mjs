// 译比 TransCompare 的 MCP 服务：把一段文字同时交给多个翻译引擎，返回并排结果。
// 密钥通过环境变量传入（插件的 userConfig 会映射到这些变量）。
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { ENGINES, LANGS } from './engines.mjs';

// 未填写的 userConfig 可能以 "${user_config.xxx}" 原样传进来，或者是空串，统一当作未配置
for (const [k, v] of Object.entries(process.env)) {
  if (typeof v === 'string' && (/^\$\{[^}]*\}$/.test(v.trim()) || v.trim() === '')) delete process.env[k];
}

const MAX_CHARS = 5000;
const langCodes = Object.keys(LANGS);
const configured = () => ENGINES.filter(e => e.configured());

const server = new McpServer({ name: 'transcompare', version: '0.1.0' });

server.registerTool(
  'list_engines',
  {
    title: '列出翻译引擎',
    description: '列出 TransCompare 支持的翻译引擎，以及哪些已经配置好可以使用。',
    inputSchema: {},
  },
  async () => {
    const lines = ENGINES
      .filter(e => !e.id.startsWith('llm') || e.configured())
      .map(e => `- ${e.id}（${e.name}）：${e.configured() ? '已启用' : '未配置密钥'}`);
    return { content: [{ type: 'text', text: lines.join('\n') + `\n\n支持语言：${langCodes.join(', ')}` }] };
  },
);

server.registerTool(
  'translate_compare',
  {
    title: '多引擎翻译对比',
    description:
      '把同一段文字同时发给多个机器翻译引擎（DeepL、Google、微软、百度、有道、大模型等），返回每个引擎的译文，便于对比。'
      + '只会使用已配置密钥的引擎；MyMemory 免费引擎无需密钥。注意：文字会发送给这些第三方服务。',
    inputSchema: {
      text: z.string().min(1).max(MAX_CHARS).describe('要翻译的文字'),
      to: z.enum(langCodes).describe('目标语言代码'),
      from: z.enum(['auto', ...langCodes]).default('auto').describe('源语言代码，默认自动检测'),
      engines: z.array(z.string()).optional().describe('只用这些引擎（id 见 list_engines），不填则用全部已配置的引擎'),
    },
  },
  async ({ text, to, from, engines }) => {
    let list = configured();
    if (engines?.length) {
      const unknown = engines.filter(id => !ENGINES.some(e => e.id === id));
      if (unknown.length) {
        return { isError: true, content: [{ type: 'text', text: `未知引擎：${unknown.join(', ')}` }] };
      }
      list = list.filter(e => engines.includes(e.id));
    }
    if (!list.length) {
      return { isError: true, content: [{ type: 'text', text: '没有可用的引擎：所选引擎都没有配置密钥。' }] };
    }

    const results = await Promise.all(list.map(async e => {
      const t0 = Date.now();
      try {
        const r = await e.translate({ text, from, to });
        return { engine: e.id, name: e.name, ok: true, text: r.text, detected: r.detected, ms: Date.now() - t0 };
      } catch (err) {
        return { engine: e.id, name: e.name, ok: false, error: err.message || String(err), ms: Date.now() - t0 };
      }
    }));

    const body = results.map(r => {
      const meta = [r.detected && from === 'auto' ? `识别为 ${r.detected}` : null, `${(r.ms / 1000).toFixed(1)}s`]
        .filter(Boolean).join('，');
      return r.ok
        ? `### ${r.name}（${meta}）\n${r.text}`
        : `### ${r.name}（失败，${meta}）\n错误：${r.error}`;
    }).join('\n\n');
    const okCount = results.filter(r => r.ok).length;
    return {
      content: [{ type: 'text', text: `目标语言：${LANGS[to]}，成功 ${okCount}/${results.length}\n\n${body}` }],
      isError: okCount === 0,
    };
  },
);

await server.connect(new StdioServerTransport());
