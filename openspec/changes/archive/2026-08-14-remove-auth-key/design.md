## Context

See proposal.md — Why。本仓四处往 winstall-api 贴 `AuthKey`/`AuthSecret`：BFF 每条转发、SSR `fetchWinstallAPI`、`deleteUserPacksViaApi`、`pages/api/apps/[id]/stats.js`（缺 key 直接 500）。用户写路径 BFF 已代签 JWT 并在非生产补 `X-User-Id`。API 仓 `refine-auth-method` 已把 catalog / `GET /packs` / `POST /analytics/track` 改为不验钥匙；用户接口 JWT 或 AuthKey 均可。本 change 只停发，不改 API。

## Goals / Non-Goals

**Goals:**

- 本仓所有打 winstall-api 的路径去掉 AuthKey/Secret 头与对 `WINSTALL_API_*` key/secret 的运行时依赖
- App track 在只有 `WINSTALL_API_BASE` 时仍能转发
- BFF 代签 JWT / `requiresAuth` / 可选 JWT 读 private pack 保持原样

**Non-Goals:**

- 不改 winstall-api、不删 API 侧 AuthKey 分支
- 不拆 BFF、不下发浏览器 JWT
- 不改 NextAuth、不改 `signJwt` 载荷或 TTL
- 不把非生产的 `X-User-Id` 一并删掉（那是 API 非生产不解析 JWT 的现有便利，留给直连 change）

## Decisions

### Decision 1: 直接停发，不留开关

**选择**: 从 BFF、`fetchWinstallAPI`、`packApiServer`、App stats 代理删除贴头逻辑；`runtimeConfig` 不再暴露 `apiKey`/`apiSecret`。不设 `SEND_AUTH_KEY` 之类 flag。

**理由**: 停发后公开读走 API 已放行的匿名面；用户写靠已有 JWT。开关只会留下「再贴回去」的死代码。回滚用 git revert。

**备选**: 环境变量控制是否贴头 — 拒绝，本 change 就是要本仓不再依赖这组钥匙。

### Decision 2: App stats 只闸 `WINSTALL_API_BASE`

**选择**: `pages/api/apps/[id]/stats.js` 在缺少 API base 时 500；不再把 key/secret 当作配置齐备的条件。body 仍转发 `{ event, targetType: "app", targetId, sessionId }`。

**理由**: `POST /analytics/track` 在 API 上已公开；现网「没 secret 就 500」会在撤环境变量后误伤 App 详情统计。Pack track 走 BFF，随 Decision 1 停发即可。

**备选**: 把 App track 也改打 `/api/winstall/analytics/track` — 本期不需要，两个入口都能停发。

### Decision 3: BFF 身份逻辑不动

**选择**: `requiresAuth`、有 session 时签 `{ userId }`、`GET packs/:id` 可选 JWT、非生产 `X-User-Id` 全部保留。只删 `headers.AuthKey` / `AuthSecret` 赋值。

**理由**: 生产用户接口在停发 AuthKey 后必须仍带 JWT，否则 401。漏改代签应在冒烟时暴露，而不是用 AuthKey 兜底。

**备选**: 顺手删 `X-User-Id` — 拒绝，本地 API 非生产不解析 JWT，删了会搞挂「我的 Pack」。

### Decision 4: 部署前确认 API 公开面已不验钥匙

**选择**: 本仓合并/上线的前置是目标环境 winstall-api 已按路由挂载鉴权（catalog / 公开 Pack / track 无凭证 200）。本仓不改 API。

**理由**: 若目标 API 仍是全局 `checkUser`，停发后首页 SSR 和匿名 BFF 会全面 401。

**备选**: Web 停发与 API 删 AuthKey 同一变更窗口 — 拒绝，用户要求 API 先不动，用 BFF 当对照面。

## Risks / Trade-offs

- **[Risk] 目标环境 API 仍全局验 AuthKey** → Mitigation：Decision 4；上线前对无头 `GET /apps`、`GET /packs`、`POST /analytics/track` 抽检 200
- **[Risk] BFF 某条用户路径漏代签、过去靠 AuthKey + `X-User-Id` 过关** → Mitigation：冒烟覆盖 create/me/copy/patch/delete 与 owner 读 private；失败先补 JWT，不把 AuthKey 加回
- **[Risk] 文档或部署清单仍把 KEY/SECRET 标成必需，导致误配** → Mitigation：tasks 里扫 README / env 示例，改为只要求 `WINSTALL_API_BASE`
- **[Trade-off] API 仍接受 AuthKey** → 接受；其它调用方与后续 API change 再删分支
- **[Trade-off] 非生产仍发 `X-User-Id`** → 接受；与浏览器直连解耦

## Migration Plan

1. 确认目标 API 公开路由无凭证可访问。
2. 部署本仓：停发头、stats 只依赖 base、去掉 runtime key 读取。
3. 冒烟：匿名 catalog / 公开 Pack / track；登录 Pack CRUD 与 private 详情；删号级联；Web 环境不设 KEY/SECRET 时 App track 不 500。
4. 部署侧去掉 `WINSTALL_API_KEY` / `WINSTALL_API_SECRET`（可选，代码已不读）。
5. 回滚：revert 本 change 并重新部署 Web；API 无需回滚。
