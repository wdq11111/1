# ADR-016 · P1a-01 依赖锁定记录

日期 2026-11-27。状态为合成原型记录。参考设备阈值和其余阶段工具版本待 P1a 实测后补齐。

| 项目 | 版本 |
| --- | --- |
| Node（Cloud 实装） | 24.22.3 |
| pnpm | 9.15.9 |
| TypeScript | 5.9.2 |
| Vite / React 插件 | 7.1.4 / 5.0.2 |
| React / React DOM | 18.3.1 |
| Three.js | 0.179.1 |
| Vitest / Playwright | 3.2.4 / 1.55.0 |
| Python（环境现有） | 3.12.14 |

锁文件见 `pnpm-lock.yaml`。该环境无法通过 Corepack 直连 npm registry 下载 pnpm，使用官方 npm registry 上相同版本的 tarball 启动 pnpm，随后成功安装。项目标准命令使用 corepack pnpm。Node 22 为基线推荐 LTS，本次构建实际运行于环境提供的 Node 24。
