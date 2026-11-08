# 多引擎翻译

一段文字同时发给多个翻译引擎，结果并排显示，方便对比哪家译得好。

支持的引擎：

| 引擎 | 需要的配置 |
|---|---|
| DeepL | `DEEPL_API_KEY` |
| Google 翻译（Cloud Translation Basic v2） | `GOOGLE_API_KEY` |
| 微软翻译（Azure Translator） | `AZURE_TRANSLATOR_KEY`，非 global 资源加 `AZURE_TRANSLATOR_REGION` |
| Claude | `ANTHROPIC_API_KEY`（默认模型 `claude-opus-5-5`） |
| 百度翻译开放平台 | `BAIDU_APP_ID`、`BAIDU_SECRET` |
| 有道智云 | `YOUDAO_APP_KEY`、`YOUDAO_APP_SECRET` |
| 任意 OpenAI 兼容大模型（DeepSeek、通义千问、OpenAI 等，最多 5 个） | `LLM_n_NAME/BASE_URL/API_KEY/MODEL` |
| MyMemory | 免费，无需密钥（单次最多 500 字节，有每日额度） |

## 使用

```bash
cd translator
npm install
cp .env.example .env   # 填上你有的密钥，没填的引擎会显示为灰色
npm start              # 打开 http://127.0.0.1:8787
```

需要 Node 18 及以上。

## 说明

- 密钥只放在本地服务端的 `.env` 里，浏览器拿不到；服务默认只监听 `127.0.0.1`。
- 浏览器不能直接调用这些接口（跨域限制，而且会暴露密钥），所以需要这个小服务做转发。
- Claude 调用开启了服务端 fallback：如果请求被安全分类器拒绝，会自动换模型重试。
- 支持语言：中、英、日、韩、法、德、西、俄，源语言可自动检测。
