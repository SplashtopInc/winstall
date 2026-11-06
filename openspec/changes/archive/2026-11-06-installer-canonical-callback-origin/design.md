# Design

## Context

在即时安装包生成端点 `pages/api/installer.js` 与状态查询端点 `pages/api/installer/status.js` 中，目前通过读取 `req.headers['x-forwarded-proto']` 和 `req.headers.host` 动态拼装外部回调 URL（`callbackUrl`）及客户端轮询状态 URL（`statusUrl`）。

详见 `proposal.md` 的动机说明：由于 Node HTTP 解析器允许客户端在 Host 头中注入路径、查询参数（如 `169.254.169.254/latest/meta-data/?`），恶意客户端可诱导外部构建系统向任意目标发起 Blind SSRF 请求。

## Goals / Non-Goals

**Goals:**
- 从根源阻断客户端请求头（`Host`、`X-Forwarded-Proto` 等）对外部构建系统回调 URL 及状态轮询 URL 的控制。
- 引入规范的公开源环境变量 `WINSTALL_PUBLIC_URL`，同时平滑回退到已有的 `NEXTAUTH_URL`。
- 在 `.env.example` 中补充清晰的本地开发默认值，保证开箱即用。
- 遵循项目极简原则，不在代码内增加隐式 `localhost` 兜底。

**Non-Goals:**
- 不引入外部 Host 白名单过滤库或庞杂的安全中间件。
- 不对客户端发起的普通页面或内联 API 请求的主机头进行拦截（仅关注向第三方外部系统传递 URL 及敏感返回场景）。

## Decisions

### 1. 规范站点源提取机制（getSiteOrigin 扩展）

- **决策**：
  在 `utils/helpers.js` 的 `getSiteOrigin()` 中定义优先顺序：
  1. 浏览器环境：继续使用 `window.location.origin`。
  2. Node.js 服务端环境：
     - 若配置了 `process.env.WINSTALL_PUBLIC_URL`，去除首尾斜杠并返回；
     - 若未配置，则回退到 `process.env.NEXTAUTH_URL`，去除首尾斜杠并返回；
     - 若两者均未配置，则返回空字符串 `""`（不硬编码 `localhost` 兜底）。
- **理由**：
  保持与代码库中 `WINSTALL_API_BASE`、`WINSTALL_ICON_BASE` 等变量一致的设计理念：代码只负责读取配置，环境初值由 `.env.example` 提供，避免隐藏的运行时环境假设。

### 2. URL 构造方式迁移至标准 `URL` 对象

- **决策**：
  在 `pages/api/installer.js` 与 `pages/api/installer/status.js` 中：
  - 调用 `getSiteOrigin()` 获取受信任源 `origin`。若服务端未配置任何规范源（空字符串），在派发需要回调的任务时抛出明确配置异常（500 内部错误，提示服务未配置规范公网地址），避免派发不可达或恶意回调。
  - 使用标准的 `new URL('/api/installer/callback', origin)` 与 `searchParams.set('taskId', taskId)` 构造 `callbackUrl`。
  - 使用同样的可信源构造 `statusUrl`。
- **理由**：
  标准 `URL` 对象在处理协议、主机名与查询参数拼接时能防止参数走样，彻底避免模板字符串拼接带来的路径/查询注入风险。

## Risks / Trade-offs

- **[Risk] 新老部署缺少配置** → **Mitigation**: 自动回退到 `NEXTAUTH_URL`。在生产和预发部署中，`NEXTAUTH_URL` 已是必需的基础配置；在 `.env.example` 中已声明 `WINSTALL_PUBLIC_URL=http://localhost:3000`。
- **[Risk] 测试环境 process.env 污染** → **Mitigation**: 在 Node.js 原生测试用例中使用 snapshot 保存并在 `afterEach` / `finally` 中严格还原环境变量。
