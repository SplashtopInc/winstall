## Why

Web 调 winstall-api 时仍在每条 BFF/SSR/track/删号请求上贴 `AuthKey`/`AuthSecret`。这组钥匙写在开源的 API 仓里，不能当秘密；公开 catalog 与 track 在 API 侧已不需要它们，用户写路径已有 BFF 代签的 JWT。先让本仓停发，API 先不动，方便对照现有 BFF 验收。

## What Changes

- Web 发往 winstall-api 的请求 MUST NOT 携带 `AuthKey` 或 `AuthSecret`（BFF 转发、SSR `fetchWinstallAPI`、Pack 删号级联、App stats 代理）。
- App stats 代理只依赖 `WINSTALL_API_BASE`；缺 key/secret 不得再 500。
- 运行时不再读取或下发 `WINSTALL_API_KEY` / `WINSTALL_API_SECRET`。
- 用户写 / 我的 Pack / owner 读 private 仍经 BFF 代签 JWT（及现有 `X-User-Id` 开发便利）；session cookie 路径不变。
- **不做** winstall-api 删 AuthKey 分支、不拆 `/api/winstall` BFF、不下发浏览器 JWT、不直连 API。

## Capabilities

### New Capabilities

- `api-client-credentials`: Web 调 winstall-api 时不发送 AuthKey/Secret；公开读与 track 只需要 API base；用户态仍靠 session + BFF JWT。

### Modified Capabilities

- `pack-api-client`: SSR/BFF Pack 流量不再要求服务端 AuthKey；公开 Pack 读与 track 可不带头；用户 Pack 写与「我的」仍经 BFF JWT。

## Impact

- **代码**：`pages/api/winstall/[...path].js`、`utils/fetchWinstallAPI.js`、`utils/runtimeConfig.js`、`utils/packApiServer.js`、`pages/api/apps/[id]/stats.js`；文档/env 示例中的 `WINSTALL_API_KEY`/`SECRET`。
- **环境**：Web 部署可去掉 `WINSTALL_API_KEY`、`WINSTALL_API_SECRET`；`WINSTALL_API_BASE` 仍必需。
- **外部**：winstall-api 本 change 零改动，仍可接受 AuthKey（其它调用方不受影响）。BFF 仍是浏览器入口。
