# Proposal

## Why

网站的 Service Worker（`sw/sw.ts`）把运行时缓存全部交给 Serwist 的 `defaultCache`。浏览器直连的 winstall-api 是跨源的，会命中 `defaultCache` 末尾 `!sameOrigin` 的 NetworkFirst 规则，写入 `cross-origin` 缓存（32 条、1 小时）。Cache API 的 key 只有 URL，不含 `Authorization`，所以登录后带 Bearer 的响应（`GET /packs/me`、`/packs/me/quota`、`/apps/liked`、`/packs/liked`、`/packs/:id/like`，以及 owner 读私有 Pack）都会被缓存。网络超时或离线时 NetworkFirst 会回退读缓存，同一浏览器换账号后可能读到上一个用户的数据；登出后这些数据也仍留在本地磁盘。

请求上的 `cache: "no-store"` 只绕过 HTTP 缓存，挡不住 Service Worker 的 Cache API，因此不能当作缓解手段。

## What Changes

- 在 Service Worker 的运行时缓存规则最前面新增规则：任何带 `Authorization` 请求头的请求一律走 NetworkOnly，不读也不写任何缓存。该规则不依赖 API origin，因为 API origin 只在运行时才知道，构建期的 SW 拿不到。
- 新 SW 激活时一次性删除历史遗留的 `cross-origin` 与 `apis` 缓存，清除已经落盘的旧私有数据。
- 把"某个请求是否属于不可缓存的凭证请求"以及"需清理的旧缓存名"抽成无 `self` 依赖的纯模块，使其可以用 Node 原生测试覆盖。
- 更正 `docs/SERVICE_WORKER_GUIDE.md` 中与实际不符的缓存策略描述（例如"API、认证：NetworkOnly"）。
- 不在本变更范围内：不把公共 API 改成 StaleWhileRevalidate，不调整公共数据的缓存时长，不改变现有 `cross-origin` NetworkFirst 对公共数据的行为。

## Capabilities

### New Capabilities
- `sw-cache-privacy`: Service Worker 对带用户凭证请求的缓存隔离，以及升级时对历史缓存的清理。

### Modified Capabilities

（无。现有 `openspec/specs` 中没有任何 Service Worker 缓存相关的需求，`api-client-credentials` 与 `pack-api-client` 的需求不变。）

## Impact

- 代码：`sw/sw.ts`；新增 `sw/` 下的纯函数模块与对应的 `test/` 测试。
- 文档：`docs/SERVICE_WORKER_GUIDE.md`。
- 用户影响：带 Bearer 的请求不再有离线回退，离线时登录态数据会直接失败；公共数据行为不变。已安装旧 SW 的用户在新 SW 激活后，`cross-origin` 与 `apis` 缓存被清空一次。
- 依赖与 API：无新增依赖，winstall-api 与公开 URL（`/apps/:id`、`/packs/:id` 等）不受影响。
- 关联：`openspec/specs/my-likes/design.md` 中"请求继续 `cache: no-store` 即可避开 Service Worker 缓存"的假设不成立，该处已归档设计不在本变更中修改，仅在本变更的 design.md 中说明。
