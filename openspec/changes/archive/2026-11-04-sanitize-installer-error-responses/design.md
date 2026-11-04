# Design

## Context

见 `proposal.md`。当前 `pages/api/installer.js`、`pages/api/installer/status.js` 和 `pages/api/installer/callback.js` 的 `catch (error)` 块直接将 `error.message` 暴露在 500 状态码的响应 JSON 中。系统运行于 Node.js 22 环境，底层涉及 Redis 操作、S3 预签名 URL 生成与外部构建器通信。

## Goals / Non-Goals

**Goals:**
- 消除服务端未捕获异常泄漏到客户端的风险。
- 为每次异常生成唯一的关联 ID（Correlation ID），同时透传至客户端和记录于服务端日志，方便检索排查。
- 移除前端控制台中冗余的 installer config 日志，由后端日志统一承载。
- 遵循第一性原则与极简架构约束，杜绝引入第三方依赖。
- 保持与前端客户端（如 `downloadInstantInstaller.js`）现存的 `{ error }` 解析契约完全向后兼容。

**Non-Goals:**
- 不重构现有业务流程或更改非 catch 块内的明确业务错误（如 400 参数缺失、405 方法不支持）。
- 不引入外部 APM 或重型错误追踪 SDK（如 Sentry）。

## Decisions

### 决策 1: 使用 Node.js 原生 `node:crypto` 的 `randomUUID()`
- **方案**: 直接使用 `const { randomUUID } = require('node:crypto');`。
- **原因**: 项目基于 Node.js 22，原生具备极快且安全的 UUID v4 实现。在 `pages/api/installer.js` 头部已有该模块引入。
- **替代方案**:
  - 引入 npm `uuid` 包：被拒绝，违反“第一性原则”及“禁止引入第三方库来解决原生代码就能实现的简单逻辑”准则。
  - 使用 `Date.now() + Math.random()`：随机碰撞概率较高，格式不标准，难以与标准日志系统兼容。

### 决策 2: 保持统一的响应体数据结构 `{ error, correlationId }`
- **方案**: 响应体结构固定为：
  ```json
  {
    "error": "<固定的安全错误文案>",
    "correlationId": "<uuid>"
  }
  ```
- **文案对应**:
  - `pages/api/installer.js`: `"An unexpected error occurred while processing your request."`
  - `pages/api/installer/status.js`: `"Failed to retrieve installer status."`
  - `pages/api/installer/callback.js`: `"Callback processing failed."`
- **原因**: 前端通过 `errorData.error` 读取文案展示给用户，保持属性名 `error` 即可无缝兼容前端现有逻辑，同时额外附加的 `correlationId` 可以在用户报障或反馈时作为唯一追踪凭据。

### 决策 3: 结构化服务端异常日志
- **方案**: 服务端日志包含统一标签、关联 ID 以及完整 error 堆栈：
  ```javascript
  console.error(`[Installer][Error ID: ${correlationId}] <Endpoint Name> Error:`, error);
  ```
  如果存在后续清理逻辑（如 installer.js 中的 `redisClient.del(cacheKey)`），清理失败的日志亦带上同一个 `correlationId`。
- **原因**: 屏蔽对外泄漏的前提是内部必须具备完备的可追踪性，使用一致的 ID 标签便于在日志平台中做跨行检索与因果追溯。

### 决策 4: 移除前端冗余的 Installer Config 打印
- **方案**: 删除 `utils/downloadInstantInstaller.js` 中的 `if (process.env.NODE_ENV === "development") { console.log("Installer config:", ...); }`。
- **原因**: 后端 `pages/api/installer.js` 在开发环境下已经具备完整的 `console.log('[Installer] Config:', JSON.stringify(config, null, 2));` 打印。前端打印与后端 100% 重叠，且浏览器控制台不应充斥大段冗余的调试输出，完全由服务端日志单一承载更为清晰且避免前端混淆。

## Risks / Trade-offs

- **[客户端排查难度变化]** 客户端无法直接看到底层错误原因（如 Redis 离线或 S3 凭据失效）。
  - *Mitigation*: 客户端控制台与响应均带有 `correlationId`，运维人员可直接通过该 ID 检索服务端日志获得完整上下文与堆栈。
- **[Redis 清理次生异常]** 在 `installer.js` 的 catch 块中删除缓存 key 若再次抛出异常，可能导致未完成响应。
  - *Mitigation*: 保持现有对清理逻辑的独立 try-catch，并使用相同的 `correlationId` 输出清理错误日志，确保 500 响应正常送达客户端。
