# Tasks

## 1. 安装包相关 API 错误拦截与脱敏改造

- [x] 1.1 修改 `pages/api/installer.js` 的 catch 块，使用原生的 `randomUUID()` 生成 `correlationId`，打印包含 ID 的服务异常日志，并返回脱敏的固定错误文案与 `correlationId`
- [x] 1.2 修改 `pages/api/installer/status.js`，引入 `node:crypto` 的 `randomUUID()`，重写 catch 块以输出带 ID 日志并返回脱敏的固定错误文案与 `correlationId`
- [x] 1.3 修改 `pages/api/installer/callback.js`，引入 `node:crypto` 的 `randomUUID()`，重写 catch 块以输出带 ID 日志并返回脱敏的固定错误文案与 `correlationId`
- [x] 1.4 移除 `utils/downloadInstantInstaller.js` 中开发环境下对 `Installer config` 的 `console.log`，保持仅由服务端 `pages/api/installer.js` 输出配置日志

## 2. 验证与回归测试

- [x] 2.1 新增/补充针对于这三个 API 路由在抛出异常情况下的单元测试，断言 HTTP 500 返回的响应体符合 `{ error, correlationId }` 且不包含 `error.message` 敏感信息，执行 `npm test` 验证通过
- [x] 2.2 验证现有客户端功能与测试套件正常运行，确认无意外破坏

## Workflow follow-up

- 审核通过并完成测试后执行归档操作。
