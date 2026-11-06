# Proposal

## Why

在即时安装包生成接口（`pages/api/installer.js`）与任务状态接口（`pages/api/installer/status.js`）中，分发给外部构建服务的构建回调地址（`callbackUrl`）以及返回给客户端的轮询状态地址（`statusUrl`）目前直接读取客户端请求头中的 `Host` 与 `X-Forwarded-Proto` 进行字符串拼接。

未经认证的匿名客户端可通过伪造请求头（例如将 `Host` 设置为云服务内网元数据地址 `169.254.169.254/latest/meta-data/?`），使外部构建服务（如 Jenkins Job 或独立 Builder 服务）在构建完成上传后向攻击者指定的恶意 URL 发送 GET 请求，导致盲服务端请求伪造（Blind SSRF）及 Host 头注入风险。当前亟需将回调与状态 URL 严格锚定至服务端配置的规范站点源，阻断请求头注入。

## What Changes

- **服务端可信源判定**：在服务端统一基于环境变量配置（优先读取 `WINSTALL_PUBLIC_URL`，其次回退至现有的 `NEXTAUTH_URL`）解析规范站点源，禁止在构造外部回调和绝对状态 URL 时信任客户端 `Host` 与 `X-Forwarded-Proto` 请求头。遵循项目架构准则，不引入代码级 `localhost` 隐式兜底。
- **外部构建回调 URL 防御**：在 `pages/api/installer.js` 向 Jenkins Webhook（`url_callback`）或 BuilderBase（`upload.callback_url`）分发构建任务时，强制使用基于规范源构造的绝对 URL，消除 Blind SSRF 隐患。
- **任务状态 URL 防御**：在 `pages/api/installer.js` 与 `pages/api/installer/status.js` 返回任务排队/处理中状态时，基于规范站点源生成 `statusUrl`，避免客户端接收被污染的主机名与协议。
- **规范源解析工具扩展**：在 `utils/helpers.js` 中将 `getSiteOrigin` 扩展为优先支持 `WINSTALL_PUBLIC_URL`，未配置时回退到 `NEXTAUTH_URL`。
- **开发与部署模板补全**：在 `.env.example` 中新增 `WINSTALL_PUBLIC_URL=http://localhost:3000`，保持全新搭建环境开箱即用。
- **安全校验与测试补全**：新增/更新测试用例，模拟客户端传递恶意 `Host`（如内网元数据地址或注入查询参数的非法主机头）及非常规 `X-Forwarded-Proto`（如 `gopher`），验证无论客户端请求头如何伪造，向 Builder 派发的 `callbackUrl` 始终指向配置的可信规范源。

## Capabilities

### New Capabilities

### Modified Capabilities

- `install-export`: 修改即时安装包生成与分发要求，规定向外部构建系统分发的 `callbackUrl` 以及对外返回的 `statusUrl` 必须严格来源于服务端配置的规范站点源，禁止由客户端请求头控制。

## Impact

- **受影响代码**：`pages/api/installer.js`、`pages/api/installer/status.js`、`utils/helpers.js`、`.env.example`、`test/installerCacheRoute.test.js`。
- **环境配置**：新增可选的环境变量 `WINSTALL_PUBLIC_URL`，未配置时自动沿用已有的 `NEXTAUTH_URL`，保持生产部署兼容性。
- **对外 API**：接口响应格式与业务行为完全兼容，对正常用户无感知；阻断针对 Builder 基础设施的伪造请求。
