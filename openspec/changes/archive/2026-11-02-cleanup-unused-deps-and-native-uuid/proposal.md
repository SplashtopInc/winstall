# Proposal

## Why

项目中存在历史重构遗留但未清理的死依赖（如 Pack 迁移后遗留的 `bad-words`）、未实际接入但占位的端到端测试依赖（`@playwright/test`），以及仅在一处使用且完全可用 Node.js 22 内置原生能力替代的冗余依赖（`uuid`）。
清理这些多余依赖并迁移到 Node.js 原生 API，可以精简 `node_modules` 体积、缩短 CI 安装耗时、降低潜在供应链安全风险并消除不必要的依赖维护负担。

## What Changes

- **移除 `bad-words` 依赖**：从 `package.json` 的 `dependencies` 及 `package-lock.json` 中移除已无任何引用的 `bad-words`。
- **移除 `@playwright/test` 依赖**：从 `package.json` 的 `devDependencies` 中移除未使用的 `@playwright/test`。
- **使用原生 `crypto.randomUUID()` 替换 `uuid` 库**：
  - 将 `pages/api/installer.js` 中的 `uuidv4()` 调用切换为 Node.js 原生 `crypto.randomUUID()`。
  - 从 `package.json` 的 `dependencies` 以及 `overrides` 中彻底移除 `uuid` 及其版本覆盖配置。

## Capabilities

### New Capabilities

无（纯内部重构与依赖精简，不引入新的系统功能规格）。

### Modified Capabilities

无（保持现有所有对外 API 行为与返回值不变，`.openspec.yaml` 已配置 `skip_specs: true`）。

## Impact

- **受影响代码**：`pages/api/installer.js`（移除 `require('uuid')`，改为 Node.js 内置 `crypto.randomUUID()` 生成任务 ID）。
- **受影响依赖配置**：
  - `package.json`：移除 `dependencies.bad-words`、`dependencies.uuid`、`devDependencies["@playwright/test"]`，移除 `overrides.uuid`。
  - `package-lock.json`：同步更新锁文件。
- **运行时环境**：项目当前运行于 Node.js 22，原生全局支持 `crypto.randomUUID()`，无需 polyfill。
- **对外行为**：`pages/api/installer.js` 生成的 `taskId` 仍为标准 UUID v4 格式，对外部调用方完全透明无感知。
