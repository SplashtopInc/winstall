# Design

## Context

详见 [proposal.md](./proposal.md)。
项目运行环境为 Node.js 22。当前工程 `package.json` 中声明了 `bad-words`、`uuid` 与 `@playwright/test`。经全代码库扫描：
1. `bad-words` 在项目历史重构（迁至 `winstall-api`）后已无任何引用代码，为残留依赖。
2. `@playwright/test` 虽在 `devDependencies` 与 `.github/workflows/playwright.yml` 中声明，但仓库从未编写 Playwright 测试配置与用例，所有自动化测试均由 Node 原生测试运行器 `node --test` 执行。
3. `uuid` 仅在 [pages/api/installer.js](/Users/Liu/github/winstall/pages/api/installer.js) 的任务创建中使用了一处 `uuidv4()`，完全可使用 Node.js 22 原生支持的 `node:crypto` 的 `randomUUID()` 替换。

## Goals / Non-Goals

**Goals:**
- 从 `package.json` 移除未使用的依赖：`bad-words`、`@playwright/test`、`uuid` 以及 `overrides.uuid`。
- 移除空置且失去依赖支撑的 CI 工作流 `.github/workflows/playwright.yml`。
- 将 `pages/api/installer.js` 中的 `uuid` 替换为 Node.js 原生 `node:crypto` 的 `randomUUID()`。
- 同步更新 `package-lock.json`，确保现有测试套件（`npm test`）和构建（`npm run build`）全部通过。

**Non-Goals:**
- 不重构 `pages/api/installer.js` 的其他业务逻辑。
- 不引入新的测试框架，保持既有的 Node.js 原生测试体系。
- 不变更现有的对外 API 契约与格式规范。

## Decisions

### 1. 使用 `node:crypto` 的 `randomUUID()` 替代第三方 `uuid` 库
- **背景**：`pages/api/installer.js` 仅需生成标准 RFC 4122 v4 UUID 作为任务缓存键和回调凭证。
- **选择**：采用 Node.js 内置模块 `const { randomUUID } = require('node:crypto');`，调用 `randomUUID()`。
- **理由**：Node.js 19+（以及本项目使用的 Node 22）原生内置 CSPRNG 高性能 UUID v4 生成能力，格式与 `uuid.v4()` 完全一致，零第三方依赖开销。
- **备选方案**：使用项目中已有的 `nanoid`。未采用的原因是 `nanoid` 生成的是自定义字母数字格式，而旧版向外部构建器/客户端透出的 taskId 一直为 UUID 格式，为确保绝对向后兼容，保持原生 UUID 最佳。

### 2. 移除 `@playwright/test` 并清理对应 CI 脚本
- **选择**：从 `devDependencies` 移除 `@playwright/test`，并同步删除 `.github/workflows/playwright.yml`。
- **理由**：仓库无任何 Playwright 测试用例，CI 运行属于无效开销；若仅移除依赖而保留 workflow 会导致 CI 流程找不到 runner 或拉取失败。

### 3. 清理 `package.json` 中的 `overrides.uuid`
- **选择**：在清理 `dependencies.uuid` 的同时，移除 `overrides` 中冗余的 `"uuid": "^11.1.0"` 配置。
- **理由**：避免遗留过期的覆盖规则干扰未来依赖解析。

## Risks / Trade-offs

- **[Risk] `randomUUID()` 生成的 ID 是否与原 `uuidv4()` 格式完全兼容？**
  → **Mitigation**：Node.js `crypto.randomUUID()` 严格遵循 RFC 4122 v4 标准规范，输出形如 `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx` 的小写字符串，与 `uuid.v4()` 行为完全等价，外部对接系统无感。
- **[Risk] 移除 `bad-words` 是否会影响潜在的动态引入？**
  → **Mitigation**：经全仓库文本检索与 Git 提交历史核查，相关审核模块及单元测试均已在先前迁移中安全删除，无任何隐式调用。
