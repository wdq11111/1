# 17 构建、CI/CD 与部署

## 1. 统一命令
| 命令 | 作用 |
|---|---|
| `make setup` | 安装依赖（锁文件）、拉取管线镜像（digest） |
| `make schema` | Zod → JSON Schema → TS / Pydantic 生成（03 §5 步骤 1） |
| `make content` | 规则编译 |
| `make data LAYER=… [REGION=…]` | 管线（05 §9） |
| `make calibrate` | 生成 scenario-cal（P6 起） |
| `make assets` | 精灵/材质/字形图集生成与 KTX2 转码 |
| `make dev` / `make test` / `make test-all` / `make bench` | — |
| `make build DIST=internal|public` | `public` 触发许可门禁、审批登记校验 |

## 2. CI 工作流与权限隔离（回应 R038）

| 工作流 | 触发 | 凭证 |
|---|---|---|
| `ci.yml` | PR（含 fork）、push | **无任何写凭证**；只读公开缓存 |
| `e2e.yml` | PR 合并前 | 只读 internal 测试区世界包（短期只读令牌，仅受信分支；fork PR 使用合成 fixture） |
| `pipeline.yml` | `main` 上 `pipeline/**` 变化、手动 | internal 存储写凭证（环境保护规则：仅 `main`） |
| `nightly.yml` | 每晚（`main`） | internal 写 |
| `release.yml` | 受保护 tag `v*`，需人工批准 | public 写；短期最小权限凭证 |

- 不受信代码（PR）永远拿不到写凭证或 internal 数据下载凭证。
- 原始数据缓存：internal 对象存储（按 sha256 寻址）。

## 3. 客户端产物与缓存（回应 R044）
```
dist/index.html                       no-cache
dist/assets/*.[hash].*                immutable, 1 年
release.json（发布描述符，见 §5.1）  Cache-Control: no-cache（每次加载重新验证）
```
- **V1 不引入 Service Worker**（推迟到存档格式稳定后另行 ADR）；依赖 HTTP immutable 缓存。
- 启动时**原子选择兼容组合**：`release.json` 指定唯一的 app + 包链 + content 组合，客户端只加载该组合；加载失败（404/hash 不符）→ 错误页，不混用版本。
- 存档兼容：06 §7。

## 4. 部署与访问控制
| 环境 | 存储与 URL 空间 | 访问 |
|---|---|---|
| internal | 独立存储桶/前缀 `internal/`，**全部文件**（HTML、JS、世界包、历史包）都在访问控制之后 | 身份认证网关（具体服务商待 D-07 定） |
| public | 独立存储桶 `public/` | 公开 |

- internal 与 public **不共享任何路径**；public 构建只能读取 `distribution = public` 的世界包（构建时校验）。
- 托管地区与方案（境内 / 境外 / 双轨）：D-07；涉及 ICP 备案、数据存储地等法规适用待 D-13 专业意见（未核实）。
- COOP/COEP：V1 不启用。

## 5. 发布描述符、发布与撤回（回应 R111、R125）

### 5.1 发布描述符 `release.json`
- 结构见 14 §2 `ReleaseDescriptor`：应用构建 hash、完整包链（每层 identity 与 URL）、contentHash、`styleHash`、可公开显示的审批信息（审批 ID、审图号文本、有效期、适用范围）、`revoked` 标志。**不含**私有批文扫描件。
- 由 `release.yml` 从审批登记（05 §6.2）与构建产物生成；`public` 描述符要求审批登记绑定项与描述符内容逐项一致。
- 客户端启动：先取 `release.json`（no-cache）→ 校验 `revoked == false`、有效期 → 加载包链并逐层校验（06 §1.4）→ 加载合规资源 → 才绘制地图。`MapApprovalBadge`、截图导出、小地图都只读这一份描述符的审批信息。

### 5.2 发布门禁
阶段验收报告；**包链全部源**的许可门禁（05 §3.2）；审批登记有效且绑定当前展示产物；视觉评审；桌面与 iPad 真机性能报告；内容审核。M1 可在 P2 后独立发布（01 §3.1）。

### 5.3 撤回
1. 审批登记标记 `revoked` → 重新生成并发布 `release.json`（`revoked: true`）；服务端（CDN 边缘规则）对已撤回 identity 下的资源返回 410。
2. CDN purge 该版本独有的资源；**资源按内容寻址并记录被哪些发布引用（引用计数）**，仍被其他有效发布引用的共享文件不删除。
3. 已打开的页面：客户端每 30 分钟及每次回到前台时重新验证 `release.json`；发现撤回 → 停止地图渲染并提示刷新。
4. 回退：`index.html` 指向的上一个发布在回退前必须重新校验其审批仍有效；否则显示维护页。
5. **能力边界（明确告知）**：无法召回用户已下载的截图、导出文件或浏览器磁盘缓存中的旧资源；撤回只能阻止继续使用在线服务。具体法律义务待专业意见（D-13）。
6. P9 演练：匿名直链、已登录账户、历史包、缓存命中、回退版本有效性、已打开会话的提示。

### 5.4 内部环境访问控制
身份网关同时覆盖 HTML、JS、`release.json`、世界包、历史包与对象存储直链（对象存储不开放公共读，只能经网关签名访问）；CDN 缓存键包含认证维度，禁止缓存认证后的响应给未认证请求。

## 6. 密钥
客户端无密钥；CI 密钥按 §2 分级，最小权限、短期，**不在执行不受信代码的步骤中暴露**；审批扫描件只存私有存储。不引入第三方遥测（如需另行决策）。
