# Proposal

## Why

目前 `pages/api/installer.js`、`pages/api/installer/status.js` 及 `pages/api/installer/callback.js` 的 `catch` 异常处理块中，直接将内部未处理的 `error.message` 返回给外部客户端（HTTP 500）。当内部构建系统、Redis 或 S3 发生故障时，错误信息可能会暴露内部系统架构、连接配置或堆栈细节，存在信息泄漏的安全隐患。

为提高系统安全性与可观测性，需要拦截此类原始错误信息，替换为统一、固定的通用错误文案，并通过 Node.js 原生支持生成全局唯一的关联 ID（Correlation ID），同时输出于服务端日志与响应体中，以便在不泄漏内部细节的前提下支持快速问题排查与审计。

## What Changes

- 修改 `pages/api/installer.js` 的异常处理逻辑：捕获未处理错误时生成 `correlationId`，在服务端记录包含该 ID 的详细错误日志与清理日志，向客户端返回统一错误文案与关联 ID（`{ error: "An unexpected error occurred while processing your request.", correlationId }`）。
- 修改 `pages/api/installer/status.js` 的异常处理逻辑：捕获未处理错误时生成 `correlationId`，在服务端记录日志，向客户端返回统一错误文案与关联 ID（`{ error: "Failed to retrieve installer status.", correlationId }`）。
- 修改 `pages/api/installer/callback.js` 的异常处理逻辑：捕获未处理错误时生成 `correlationId`，在服务端记录日志，向客户端返回统一错误文案与关联 ID（`{ error: "Callback processing failed.", correlationId }`）。
- 移除前端 `utils/downloadInstantInstaller.js` 中在开发环境下对 `Installer config` 的无谓 `console.log`，只在服务端（`pages/api/installer.js`）保留调试日志。
- 使用 Node.js 原生内置模块 `node:crypto` 的 `randomUUID()` 生成关联 ID，严禁引入外部 `uuid` 库。
- 保持前端已有的错误读取逻辑（读取 `response.error`）完全向后兼容。

## Capabilities

### New Capabilities
- `installer-error-sanitization`: 定义安装包生成相关服务端接口（installer, installer/status, installer/callback）在异常崩溃时的统一脱敏输出与日志关联机制。

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec file.
     Use the exact existing path under openspec/specs/. Leave empty if no requirement
     changes. A change with no capabilities at all (pure refactor, tooling, docs)
     must set `skip_specs: true` in its .openspec.yaml - openspec validate rejects
     a zero-delta change without that marker. Do not invent a requirement just to
     satisfy validation. -->

## Impact

- 受影响代码：`pages/api/installer.js`、`pages/api/installer/status.js`、`pages/api/installer/callback.js`、`utils/downloadInstantInstaller.js`
- API 响应影响：当安装包构建相关接口发生 500 异常时，不再返回原始堆栈或内部错误消息，而是返回安全的静态文案及 `correlationId` 字段。
- 前端日志影响：浏览器控制台在开发环境下不再输出冗余的 `Installer config` 日志。
- 依赖影响：零新增依赖，使用 Node.js 原生 `node:crypto`。
