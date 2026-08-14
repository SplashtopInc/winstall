## Context

See proposal.md — Why。本仓 Pack 主路径已走 BFF → API；本地 `/api/packs`、`packService`、`Pack`/`PackLike`、mongoose、以及 `PACK_API_VIA_WINSTALL` 的 flag-off 分支仍在，只为回滚。`pages/users/[id].js` 已无站内入口，仍打旧 API 形状（`packs/users|profile`）和 `/api/twitter`。`contentModeration` 只被本地 `packService` 使用。

## Goals / Non-Goals

**Goals:**

- 删除切流开关，调用面只保留 API 形状
- 整夹删除本地 Pack HTTP / service / model / mongoose
- 删除废弃用户目录页及其 sitemap、Twitter 代理、BFF 遗留 path
- 删除 Web 侧 pack 审核模块

**Non-Goals:**

- 不拆 BFF、不下发浏览器 JWT、不直连 API
- 不产品化 PackLike、不迁 like UI
- 不改 NextAuth / `lib/mongodb.js` / `/api/users/me` 删号入口（只去掉本地 Pack 双清）
- 不为 `/users/:id` 做兼容跳转

## Decisions

### Decision 1: 硬切，删除开关，不留 flag-off

**选择**: 删除 `utils/packApiConfig.js` 与 `PACK_API_VIA_WINSTALL` / `NEXT_PUBLIC_PACK_API_VIA_WINSTALL`。`fetchPackAPI` 固定 `/api/winstall/packs`；`fetchMyPacks` → `/me`，`createPack` → `POST ""`，公开列表不再走 `/public`。`trackPackStats` 只打 `POST /api/winstall/analytics/track`。首页推荐与 sitemap 只走 `fetchAllPublicPacksFromApi`。`deleteUserAccount` 只调 `deleteUserPacksViaApi`，删除 `deleteLocalUserPacks`。

**理由**: 开关与本地栈互相支撑；留 flag 却删路由会留下一条必 404 的分支。回滚用 git revert。

**备选**: 默认 ON 仍读 flag — 拒绝，死代码。先删路由后留开关 — 拒绝，flag off 无落点。

### Decision 2: 本地 Pack 栈整层删除，mongoose 一起走

**选择**: 删除 `pages/api/packs/`（含 `session.js`）、`service/packService.js`、`service/packLikeService.js`、`dbModel/`（仅 Pack/PackLike）、`lib/mongoose.js`，并从 `package.json` 移除 `mongoose`。`service/index.js` 去掉对应 re-export（若该桶无其它引用可一并收束）。NextAuth 继续 `lib/mongodb.js`。

**理由**: mongoose 在本仓只服务 Pack；留下连接层没有调用方。

**备选**: 只删 handler、保留 model「以备 like」— 拒绝，PackLike 无 UI、无 API route。

### Decision 3: BFF 只保留现行 API Pack 鉴权形状

**选择**: `requiresAuth` 保留：`POST packs`（精确）、`GET packs/me`、`PATCH|DELETE packs/:id`、`POST packs/:id/copy`。删除 `packs/create` 与 `packs/profile/` 分支。`GET packs/:id` 有 session 时仍可选附带 JWT。不新增 `packs/users/:id`。

**理由**: 硬切后客户端不再打旧 path；用户目录页删除后 `profile`/`users` 无调用方。

**备选**: 无限期保留遗留代签 — 拒绝，制造「API 已无此路由」的假兼容。

### Decision 4: `/users/:id` 删除为 404，sitemap 与 Twitter 代理同删

**选择**: 删除 `pages/users/[id].js`。`sitemap-packs.xml.js` 不再收集 `userId`、不再输出 `/users/:id`。删除 `pages/api/twitter.js`；`TWITTER_BEARER` 不再被读取。NextAuth `TWITTER_CLIENT_ID` / `TWITTER_CLIENT_SECRET` 不动。`/api/users/me` 与 `fetchUserAPI` 不动。

**理由**: 站内无链入；页已废弃。sitemap 继续输出会制造死链。Twitter 代理只服务该页，且把 caller-supplied URL 交给服务端 bearer，应随页消失。

**备选**: 301 到 `/packs` — 拒绝，用户已确认废弃、不要兼容。保留 twitter.js「以备后用」— 拒绝，无调用方且面过大。

### Decision 5: Web 侧 contentModeration 随 packService 删除

**选择**: 删除 `utils/contentModeration/` 与 `test/contentModeration.test.js`。创建/更新 pack 的文本对错只反映 API 响应。

**理由**: 该模块唯一生产调用方是本地 `packService`；API 已做权威校验。

**备选**: 在 `createPack` UI 再调一次本地词库 — 拒绝，双源且本 change 正要拆这层。

## Risks / Trade-offs

- **[Risk] 某环境仍关着开关或依赖本地 `/api/packs`** → Mitigation：部署清单写明必须已走 API；合并后不再有 flag-off
- **[Risk] 生产未迁数却部署本 change → 空列表 / 全 0 stats** → Mitigation：依赖 API 仓迁数已完成（调用方已确认 API 侧就绪）
- **[Risk] 外部书签或搜索索引的 `/users/:id` 变 404** → Mitigation：接受；不跳转
- **[Risk] 漏删 `service/index.js` / 测试对 mongoose 的引用导致构建失败** → Mitigation：tasks 里按引用扫一遍再删依赖
- **[Trade-off] 失去本地回滚面** → 接受；回滚 = revert 本 change
- **[Trade-off] BFF 仍在** → 接受；直连是后续 change

## Migration Plan

1. 确认目标环境 Pack 已走 API（不再需要 flag off）。
2. 落地本 change：先收客户端/SSR/删号为单路径，再删本地栈、用户页、审核模块、mongoose。
3. 冒烟：创建/编辑/删除/复制、我的列表、公开列表、详情、view track、首页推荐、sitemap（无 `/users/`）、删号后 API 无孤儿；`/users/:id` 与 `/api/packs/*` 不再成功返回 Pack 数据。
4. 回滚：revert 本 change 的提交并重新部署。

## Open Questions

（无。开关删除、用户页 404、contentModeration 同删已在探索中确认。）
