# Tasks

## 1. 服务端 Webhook 请求序列化与编码改造

- [x] 1.1 在 `pages/api/installer.js` 中将发往 Jenkins Webhook 的请求体构造从 `FormData` 改为 `URLSearchParams`，移除无用的 `formData.set('Content-Type', ...)`，确保以 `application/x-www-form-urlencoded` 且 UTF-8 百分比编码的形式发送，并通过已有构建与路由逻辑检查
- [x] 1.2 编写或更新单元测试，验证在含有中日文非 ASCII 字符（如“网易云音乐”）时，发往 Webhook 的请求体中 `installer_config` 字段为合法的 UTF-8 百分比编码且能被 URLSearchParams/URL 解码还原为完全一致的 JSON

## 2. 回归与验证

- [x] 2.1 运行既有测试套件 `npm test`（覆盖 `test/installerCacheRoute.test.js`、`test/downloadInstantInstallerDispatch.test.js` 等），确认全流程无回归异常
