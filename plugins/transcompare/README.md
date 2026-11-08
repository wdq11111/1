# 译比 TransCompare

Claude Code 插件：把同一段文字同时交给多个翻译引擎，结果并排对比。Claude 也会给出自己的译文，并推荐最终译法。

## 安装

在 Claude Code 里运行：

```
/plugin marketplace add wdq11111/1
/plugin install transcompare@wdq11111-plugins
```

装好后直接这样用：

```
/transcompare:compare en 机器翻译的质量这几年提升了很多。
```

也可以直接跟 Claude 说"用多个引擎翻译一下这段话"，它会调用插件里的 `translate_compare` 工具。

## 配置引擎

运行 `/plugin configure transcompare@wdq11111-plugins` 填写密钥，每一项都是可选的。密钥会存到系统的安全凭据存储里。

| 引擎 | 需要填写 |
|---|---|
| DeepL | API Key（免费版以 `:fx` 结尾） |
| Google 翻译 | Cloud Translation Basic v2 的 API Key |
| 微软翻译 | Azure Translator Key，非 global 资源还要填区域 |
| 百度翻译 | APP ID + 密钥 |
| 有道智云 | 应用 ID + 应用密钥 |
| Claude API | Anthropic API Key |
| 自定义大模型 | OpenAI 兼容接口的名称、Base URL、Key、模型名（DeepSeek、通义千问等） |
| MyMemory | 免费，默认开启，不用配置 |

注意：要翻译的文字会发送给你启用的这些第三方服务。

## 需要

- Claude Code
- Node.js 18 或更高版本（用来运行插件自带的 MCP 服务）

## 开发

MCP 服务的源码在 `server/src/`。改完后重新打包：

```bash
cd server && npm install && npm run build
```

打包产物 `server/dist/index.mjs` 已经提交进仓库，所以用户安装时不需要再运行 npm install。
