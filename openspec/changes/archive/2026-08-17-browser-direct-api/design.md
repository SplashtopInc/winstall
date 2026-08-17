## Context

See proposal.md — Why。现状：浏览器 catalog / Pack / Pack track 打同源 `/api/winstall`，App track 打 `/api/apps/:id/stats`；BFF 用 session 代签 `{ userId }` JWT（5m）再转发，非生产另贴 `X-User-Id`。SSR / sitemap / `deleteUserPacksViaApi` 已直连 `WINSTALL_API_BASE`。该变量 **只在运行时注入**（Docker build 没有）。客户端 `getRuntimeConfig().apiBase` 在浏览器恒为空。`_document` 的 meta 只在生成该份 HTML 时求值：纯静态页冻在 build，SSR / 已热身 ISR 才能带上运行时 origin。搜索挂在 `_app`，任意整页落地都会打 API。NextAuth 已是 JWT session；cookie JWT **不能**当 API Bearer。

## Goals / Non-Goals

**Goals:**

- 先把需要 API 地址的整页入口改成 ISR，再注入 runtime meta，再直连
- 浏览器从 meta 读 API origin；catalog / Pack / analytics 直连
- 短 API JWT 经 jwt / session 回调下发与续签；用户写只带 `Authorization: Bearer`
- 删掉 `/api/winstall` 与 `/api/apps/:id/stats`
- 服务端直连保持；删号级联自签 JWT，去掉 `X-User-Id`

**Non-Goals:**

- 不新增 `/api/config` / `/api/runtime`，不用 `NEXT_PUBLIC_WINSTALL_API_BASE`
- 不把客户端 Pack/catalog 拉数搬进 `getStaticProps`
- 不把 `/packs/[id]` 改成 ISR（已按请求 SSR）
- 不改 NextAuth 登录 / `signJwt` 默认载荷与 TTL
- 不在本仓改 winstall-api；API 非生产解析 JWT、CORS 预发域名是外部前置

## Decisions

### Decision 1: 分两步——先 ISR，再直连

**选择**:

1. 把「整页打开后会打 API」的入口改成 ISR（build 无 `WINSTALL_API_BASE` 时 `revalidate: 1`，与首页现有分支相同）。不改客户端仍走 BFF。
2. `_document` 增加 `winstall-api-base` meta，`getRuntimeConfig()` 浏览器读 meta。可用「热身后 View Source」验收 origin，此时尚未直连。
3. 再改 session JWT、`fetch*` 直连、删代理。

**理由**: origin 只在运行时存在。ISR 让 `_document` 在已有 env 的 Node 里再跑一遍。先改渲染策略、后切流量，避免直连和空 meta 同时上线。

**备选**: 先硬切直连再补地址 — 拒绝，Docker 下客户端会停。`/api/runtime` — 本期不采用。`NEXT_PUBLIC_*` — 拒绝，冻在 build。

### Decision 2: 哪些页改 ISR，哪些保持

**选择**: 搜索在全局，需要 API 地址的是「可能作为第一次整页文档」的页，不只是 `/packs`。

| 页 | 处理 |
|----|------|
| `/packs`、`/generate`、`/about`、`/privacy`、`/eli5`、`/compare`、`compare-*`、`/404` | 加上空的 `getStaticProps`，改为 ISR。**不**把列表/搜索搬到服务端 |
| `/`、`/apps`、`/express`、`/apps/[id]` | 已是 ISR，不动 |
| `/packs/[id]` | 保持按请求 SSR，不改 ISR（无需 `getStaticPaths`） |
| sitemap / opensearch | 已是 `getServerSideProps`，不动 |

`getStaticProps` 在没有 `WINSTALL_API_BASE` 时返回空 props + `revalidate: 1`；运行时重生后可用更长间隔（如 600s）。

**理由**: 从 `/about` 落地再点搜索或进 `/packs`，用的是第一份文档的 meta。只改 `/packs` 不够。`/packs/[id]` 已经每次现渲，改 ISR 是退步。

**备选**: 只 ISR `/packs` — 拒绝，其它静态壳仍会带空 meta。全站 `_app.getInitialProps` — 拒绝，冲掉现有 ISR。

### Decision 3: API origin 仍用 meta，不打进构建产物

**选择**: `_document` 增加 `meta[name="winstall-api-base"]`，content 为运行时 `WINSTALL_API_BASE`。`getRuntimeConfig()` 浏览器读该 meta（可缓存），服务端仍读 env。空 content 则不发请求。

**理由**: Decision 1–2 之后，热身过的入口文档会带上 origin。与 icon-base 同模式。不新开路由。

**备选**: 见 Decision 1。冷启动第一次仍可能是 build 空壳 — 接受，靠部署后整页打开入口热身（测试/预热），不在本 change 做每副本启动预热脚本。

### Decision 4: 短 JWT 挂在 session 顶层，jwt 回调过期再签

**选择**: jwt 回调在 `token.id`（publicId）存在且 `token.apiToken` 空或即将过期（留约 30s 余量）时 `signJwt({ userId: token.id })`，并记 `token.apiTokenExpires`。session 回调设 `session.apiToken` / `session.apiTokenExpires`（顶层，不进 `session.user`）。不新开 HTTP 发牌接口。客户端用 `useSession` / `getSession()`。

**理由**: `GET /api/auth/session` 本来就会跑这两步。与 BFF 同 secret、同 `{ userId }`、同约 5m。

**备选**: 专用发牌路由 / 把 NextAuth cookie JWT 当 Bearer / API 票 TTL 30 天 — 拒绝。

### Decision 5: 谁带头、401 怎么续

**选择**:

| 调用 | Bearer |
|------|--------|
| 公开 catalog、`GET /packs`、`POST /analytics/track`、匿名 `GET /packs/:id`、`GET /packs/:id/stats` | 不带 |
| `POST /packs`、`GET /packs/me`、`PATCH`/`DELETE /packs/:id`、`POST /packs/:id/copy` | 已登录则带；未登录不带 |
| 已登录 `GET /packs/:id` | 仅当有未过期 `apiToken` 时带；先 `getSession()` 续签，仍没有则不带 |

用户写遇 401：再 `getSession()` 一次后重试至多一轮。跨域 `credentials: "omit"`。`getSession()` **只在浏览器**调用；SSR `fetchWinstallAPI` 不读 session。

**理由**: 可选鉴权遇到过期 Bearer 会整段 401。stats 路径不能和 `GET /packs/:id` 用同一套可选带头。

**备选**: 已登录一律带头 / 浏览器发 `X-User-Id` — 拒绝。

### Decision 6: 客户端入口收口，然后删代理

**选择**: 第二步再改 `fetchWinstallAPI` 为 `${apiBase}${path}`；`fetchPackAPI` 走同一入口；两种 track 都 `POST {apiBase}/analytics/track`。确认无调用方后删两个代理。`deleteUserPacksViaApi` 继续自签 JWT，去掉 `X-User-Id`。

**理由**: 第一步仍走 BFF，便于单独验收 meta。代理只剩换票，换票进 session 后即可删。

**备选**: 第一步就双跑直连 — 拒绝，与「先 ISR 再直连」冲突。

## Risks / Trade-offs

- **[Risk] ISR 第一次仍发 build 空 meta** → Mitigation：Decision 3；部署后对 `/`、`/packs`、`/generate`、`/about` 等做整页打开热身，再放量。多实例各热一份。不保证冷启动第一人
- **[Risk] 只热身点链接、没整页打开** → Mitigation：验收写明 View Source / 硬刷新，不单靠 SPA 点击
- **[Risk] 目标 API 非生产仍跳过 JWT 解析** → Mitigation：直连上线前置；本地无 `X-User-Id` 的登录写必须 200
- **[Risk] CORS 未放行预发域名或 `Authorization` 预检** → Mitigation：直连前抽检
- **[Risk] `GET /packs/:id` 或 `/stats` 带过期票** → Mitigation：Decision 5
- **[Risk] SSR `fetchWinstallAPI` 误调 `getSession()`** → Mitigation：Bearer 仅客户端
- **[Trade-off] 营销页为 meta 做空 ISR** → 接受；不搬数据
- **[Trade-off] 硬删 BFF** → 接受；回滚 revert
- **[Trade-off] API 仍接受 AuthKey** → 接受

## Migration Plan

1. **第一步（仍走 BFF）**：需 origin 的入口改为 ISR；加 meta；`getRuntimeConfig` 读 meta。部署后整页打开入口，确认 HTML 里 `winstall-api-base` 为运行时 origin。
2. 确认目标 API：非生产解析 Bearer；CORS 允许该 Web origin 与 `Authorization`。
3. **第二步**：session 下发票、客户端直连、删两个代理、删号级联去掉 `X-User-Id`。
4. 冒烟：匿名 catalog / 公开 Pack / 两种 track；登录 CRUD / 我的 / private 详情；未登录 create 失败；过期票后公开详情与 stats 仍 200；删号无孤儿。
5. 回滚：按步 revert；API 无需为回滚再改。

## Open Questions

无。热身由发布纪律完成，不在本 change 做启动预热脚本。
