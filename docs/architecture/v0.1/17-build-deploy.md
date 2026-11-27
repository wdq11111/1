# 17 构建、CI/CD 与部署

## 1. 统一命令（Makefile / package.json scripts）

| 命令 | 作用 |
|---|---|
| `make setup` | 安装 Node/pnpm 依赖、Python 环境（uv）、检查 GDAL |
| `make data SCENARIO=modern-2020 [REGION=test-sichuan]` | 运行数据管线，输出 `data/out/world/...` |
| `make content` | 编译规则数据 → `content.json` |
| `make assets` | 美术资源导出与 KTX2/meshopt 处理 |
| `make dev` | 启动 Vite 开发服务器（读取本地世界包） |
| `make test` / `make test-all` | 快速测试 / 含 E2E、视觉、长回放 |
| `make bench` | 性能基准 |
| `make build DIST=internal|public` | 生产构建；`public` 触发许可门禁与合规门禁 |

## 2. CI 工作流（GitHub Actions）

| 工作流 | 触发 | 内容 |
|---|---|---|
| `ci.yml` | PR、push | lint → typecheck → 单元/属性/契约 → 短集成 → Node 回放 → 构建（internal）|
| `e2e.yml` | PR 合并前（required） | Playwright E2E + 视觉回归（使用缓存的 test-sichuan 世界包）|
| `pipeline.yml` | `pipeline/**` 变化、手动 | 管线 Docker 镜像构建；test-sichuan 区域全流程 + pytest |
| `nightly.yml` | 每晚 | 全国世界包构建（缓存原始数据）、三浏览器回放、完整一局 AI、bench 趋势 |
| `release.yml` | 打 tag `v*` | public 构建（门禁）、上传 CDN、生成发布说明 |

- 原始数据缓存：放在对象存储（按 sha256 寻址），CI 通过只读凭证拉取，不放 GitHub Actions cache（体积大）。
- 世界包产物：上传对象存储 `world/<scenario>/<packageHash>/`，CI 输出 hash 供客户端构建引用。

## 3. 客户端构建产物

```
dist/
├── index.html                      # 不缓存（no-cache）
├── assets/*.[hash].js|css|woff2    # 永久缓存（immutable，1 年）
├── sw.js                           # Service Worker：缓存应用壳与已访问的世界包文件
└── build-info.json                 # { appVersion, gitSha, worldPackageHash, contentHash, distribution }
```

- 世界包与应用分开部署；`build-info.json` 指定所用世界包 hash，CDN 路径不可变，回滚 = 切换 `index.html` 指向的旧构建。

## 4. 部署与托管（需用户决策 D-07）

| 方案 | 适用 | 要点 |
|---|---|---|
| A. 境内托管（境内云对象存储 + CDN） | 面向中国大陆用户正式发布 | 需 ICP 备案；公开地图需审图号（05 §6）；访问速度好 |
| B. 境外托管（如 Cloudflare Pages / R2） | 开发期内测、海外展示 | 无需备案；大陆访问速度与可用性不稳定；**仍不改变地图内容合规要求的适用判断，需法律意见** |
| C. 双轨 | 开发期 B，正式发布 A | 推荐；构建产物与托管解耦，同一产物可部署到两处 |

- 开发期内测环境：`internal` 构建 + 访问控制（Cloudflare Access 或基础认证），防止未审图版本公开传播。
- HTTP 头：`Cross-Origin-Opener-Policy: same-origin` 与 `Cross-Origin-Embedder-Policy: require-corp` **V1 不强制**（V1 不使用 SharedArrayBuffer）；保留在配置中以便将来启用多线程。
- 压缩：CDN 开启 Brotli，`.ccb`、`.json`、`.js` 均压缩；`.ktx2` 已压缩不再处理。

## 5. 版本与发布

- 应用版本：SemVer `MAJOR.MINOR.PATCH`；`MAJOR` 变化表示存档不兼容（提供迁移则不升 MAJOR）。
- 发布检查表（`release.yml` 前人工确认）：
  1. 所有阶段验收项通过的报告链接
  2. 许可门禁通过（全部 `verified`）
  3. 合规签核完成，审图号已写入世界包
  4. 视觉评审通过
  5. 参考设备性能报告
- 发布后：错误上报（V1 仅本地日志 + 用户主动导出回放；**不引入第三方遥测**，避免隐私与跨境数据问题，如需遥测另行决策）。

## 6. 环境变量与密钥

- 客户端不含任何密钥。
- CI 密钥：对象存储写凭证（仅 `pipeline.yml`、`release.yml` 可用，受环境保护规则限制）。
