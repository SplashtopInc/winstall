# Tasks

## 1. 规范源工具方法与环境配置

- [x] 1.1 更新 `utils/helpers.js` 中的 `getSiteOrigin`，优先读取 `process.env.WINSTALL_PUBLIC_URL` 并回退到 `process.env.NEXTAUTH_URL`（去除末尾斜杠），未配置时返回空字符串，不硬编码 `localhost` 兜底；编写单元测试验证源解析优先级
- [x] 1.2 在 `.env.example` 中补充 `WINSTALL_PUBLIC_URL=http://localhost:3000` 配置项与注释说明

## 2. 路由安全重构（防范 Host 注入与 SSRF）

- [x] 2.1 重构 `pages/api/installer.js`：废弃直接基于 `req.headers['x-forwarded-proto']` 和 `req.headers.host` 的字符串拼接，改用 `getSiteOrigin()` 与标准 `URL` 对象生成 `callbackUrl`（传给 Jenkins webhook 或 BuilderBase）和初始 `statusUrl`
- [x] 2.2 重构 `pages/api/installer/status.js`：废弃直接读取请求头中的 host 与 proto，使用 `getSiteOrigin()` 与标准 `URL` 对象生成处理中重定向状态的 `statusUrl`

## 3. 安全与回归验证

- [x] 3.1 在 `test/installerCacheRoute.test.js` 中新增安全回归测试：模拟带有伪造内网元数据 Host（`Host: 169.254.169.254/latest/meta-data/?`）与恶意协议（`X-Forwarded-Proto: gopher`）的客户端请求，验证派发给 Builder 的 `url_callback` 和返回的 `statusUrl` 严格指向配置的规范源
- [x] 3.2 运行全量测试套件 `npm test`，确保所有既有功能与新断言全部绿灯通过
