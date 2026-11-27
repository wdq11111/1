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
dist/build-info.json                  { appVersion, gitSha, worldIdentities[], contentHash, distribution }
```
- **V1 不引入 Service Worker**（推迟到存档格式稳定后另行 ADR）；依赖 HTTP immutable 缓存。
- 启动时**原子选择兼容组合**：`build-info.json` 指定唯一的 app + world identities + content 组合，客户端只加载该组合；加载失败（404/hash 不符）→ 错误页，不混用版本。
- 存档兼容：06 §7。

## 4. 部署与访问控制
| 环境 | 存储与 URL 空间 | 访问 |
|---|---|---|
| internal | 独立存储桶/前缀 `internal/`，**全部文件**（HTML、JS、世界包、历史包）都在访问控制之后 | 身份认证网关（具体服务商待 D-07 定） |
| public | 独立存储桶 `public/` | 公开 |

- internal 与 public **不共享任何路径**；public 构建只能读取 `distribution = public` 的世界包（构建时校验）。
- 托管地区与方案（境内 / 境外 / 双轨）：D-07；涉及 ICP 备案、数据存储地等法规适用待 D-13 专业意见（未核实）。
- COOP/COEP：V1 不启用。

## 5. 发布与撤回
- 发布检查表：阶段验收报告；许可门禁；**审批登记有效且绑定当前产物**（05 §6.2）；视觉评审；性能报告；内容审核。
- 撤回：审批登记 `revoked` 或许可问题 → 执行 `make revoke VERSION=…`：删除 public 存储中该版本全部文件、CDN 清除缓存、`index.html` 回退到上一个合规版本、记录撤回日志。由于 V1 无 Service Worker，撤回后客户端在下次加载 `index.html` 时即不再获取旧版本。
- 历史世界包保留策略：public 仅保留有效审批覆盖的版本；internal 保留最近 5 个。

## 6. 密钥
客户端无密钥；CI 密钥按 §2 分级，最小权限、短期。不引入第三方遥测（如需另行决策）。
