# Tasks

## 1. 替换 UUID 为 Node 原生 API

- [x] 1.1 修改 `pages/api/installer.js`，将 `require('uuid')` 替换为 `const { randomUUID } = require('node:crypto')`，并使用 `randomUUID()` 生成 `taskId`
- [x] 1.2 编写或更新单元测试验证 `randomUUID()` 生成的 `taskId` 符合标准 UUID 格式并在 `installer` 处理中正常工作

## 2. 清理冗余依赖与 CI 脚本

- [x] 2.1 从 `package.json` 中移除 `dependencies.bad-words`、`dependencies.uuid`、`overrides.uuid` 以及 `devDependencies["@playwright/test"]`，并执行 `npm install` 同步更新 `package-lock.json`
- [x] 2.2 移除空置且失去依赖支撑的 `.github/workflows/playwright.yml` 配置文件

## 3. 全局构建与回归验证

- [x] 3.1 运行 `npm test` 确保所有既有单元与集成测试全部通过
- [x] 3.2 运行 `npm run build` 确保生产环境打包顺利完成，无遗留或缺失模块报错
