## Context

See proposal.md — Why。本仓 Pack 权威仍在本地：`fetchPackAPI` → `/api/packs/*` → Session → `packService` → Mongo；BFF `/api/winstall` 已能为部分旧 Pack 路径代签 JWT，但客户端未走通。`winstall-api` 的 `migrate-pack-to-api` 已定义目标路由与 `PackStats` 单源。约束：本期 **不做** 浏览器 JWT 直连；**不删** 本地 Pack 路由；生产切流依赖 API 侧迁数对账。

## Goals / Non-Goals

**Goals:**

- 单一适配入口把 Pack CRUD/列表切到 API（经 BFF）
- 更新 BFF `requiresAuth` 覆盖新 API 路径（尤其 `POST /packs`、`GET /packs/me`）
- Pack view/download 经 BFF `POST /analytics/track`（flag on 不经 `pages/api/packs/`）
- SSR/sitemap/删号级联改读/写 API
- 切流可回滚到本地 `/api/packs`（代码保留；flag on 时该目录零 HTTP）

**Non-Goals:**

- 不实现 JWT 下发与浏览器直连 API
- 不删除本地 Pack model / service / routes
- 不实现生产迁数脚本（API 仓）
- 不产品化 PackLike UI
- 不新增 `/packs/users/:id`（API 亦未做）

## Decisions

### Decision 1: 适配落在 `fetchPackAPI`，页面少改

**选择**: 改 `utils/fetchPackAPI.js`（及少量 stats 辅助）为经 `/api/winstall` 调用 API 路径；`createPack` / `fetchMyPacks` / `fetchPublicPacks` 等封装内完成路径映射。Pack 页面继续调这些函数。

**理由**: 调用面集中；避免每个组件散落新旧路径。

**备选**: 各页面直接 `fetchWinstallAPI` — 拒绝，重复映射与 credentials 处理。

**映射**:

| 封装 | 目标 |
|------|------|
| `fetchMyPacks` | `GET /api/winstall/packs/me` |
| `fetchPublicPacks` | `GET /api/winstall/packs?…` |
| `createPack` | `POST /api/winstall/packs` |
| `fetchPackById` / `updatePack` / `deletePack` | `/api/winstall/packs/:id` |
| `copyPack` | `POST /api/winstall/packs/:id/copy` |
| `trackPackStats`（flag on） | `POST /api/winstall/analytics/track` |
| `fetchPackStats`（flag on） | `GET /api/winstall/packs/:id/stats` |

客户端继续 `credentials: "same-origin"` 打 BFF；由 BFF 代签用户 JWT。服务端 SSR 若直连 API，用 `AuthKey`/`AuthSecret`（及需要时的 user 上下文），可复用/扩展 `fetchWinstallAPI` 的 server 分支。

### Decision 2: 扩展 BFF `requiresAuth`，废弃旧 create/profile 特例为主路径

**选择**: 在 `pages/api/winstall/[...path].js` 中把 Pack 鉴权规则改为对齐 API：

- 需要用户 JWT：`POST` 且 path 为 `packs`（精确创建）、`PATCH|DELETE` 且 `packs/:id`、`POST` 且 `packs/:id/copy`、`GET` 且 `packs/me`
- 不需要用户 JWT：`GET packs`（公开列表）、`GET packs/:id`（可见性由 API 处理；若需 owner 读 private，BFF 在有 session 时**可选**附带 JWT——见 Decision 3）

可保留对遗留 `packs/create`、`packs/profile/` 的代签以兼容旧调用，但本 change 主路径不再依赖它们。

**理由**: API 已拒绝 `POST /packs/create` 作为规范形状；`/packs/me` 必须代签。

**备选**: 浏览器直连 + 客户端 JWT — 本期非目标。

### Decision 3: 详情 GET 在有 session 时附带 JWT

**选择**: `GET /packs/:id` 在存在 NextAuth session 时由 BFF 代签 JWT 转发；无 session 则仅带 AuthKey/Secret。

**理由**: private/unlisted 所有者查看依赖 API 解析 `userId`；与 API `resolveUserId` 可选语义一致。

**备选**: 详情永远匿名 — 拒绝，所有者无法打开自己的 private pack。

### Decision 4: Pack stats 经 BFF analytics，不经本地 `/api/packs`

**选择**:

1. **flag on**：`trackPackStats` 打 `POST /api/winstall/analytics/track`，body：`{ event, targetType: "pack", targetId, sessionId }`。BFF 已用 AuthKey/Secret 转发；`requiresAuth` 不匹配该 path，不代签用户 JWT（与现网 App 服务端 track 同等威胁模型）。
2. **flag off**：仍 `POST /api/packs/:id/stats`，本地 `$inc`（回滚面）。
3. 需要展示终身量时：`GET /api/winstall/packs/:id/stats`（或服务端直连）。详情/下载调用方继续 `getSessionId()`，失败不挡 UX。
4. **不**把 `pages/api/packs/[id]/stats.js` 当作切流后的 track 入口。该文件只服务 flag-off；其中为迁就老 URL 加的 analytics proxy 分支应去掉，避免 flag on 仍命中待删目录。

**理由**: flag on 必须对 `pages/api/packs/` 零 HTTP，否则后期无法整夹删除该包。App 的 `/api/apps/:id/stats` 薄代理可继续存在——那是另一个目录，不挡 Pack 清理。

**备选**: 改造 `/api/packs/:id/stats` 为 analytics 代理（原选择）— **拒绝**，热路径留在待删包里。新建 `/api/packs/:id/track` — 同样拒绝。另抽 Web `/api/analytics/track` — 本期不需要，BFF 已能转发。

### Decision 5: SSR / sitemap 走服务端 API，不经浏览器 BFF

**选择**: `pages/index.js` 推荐 Pack、`pages/sitemap-packs.xml.js` 等改为 server-side `fetch` API（`GET /packs` 或按官方 creator 过滤的约定查询）。过滤「官方推荐」若现网靠 `userId === NEXT_OFFICIAL_PACKS_CREATOR`，在 API 公开列表结果上过滤，或后续让 API 支持 `userId` 查询（首期过滤即可）。

**理由**: ISR/构建环境无浏览器 session；AuthKey 足够读公开数据。

**备选**: SSR 仍读本地 Mongo「只读副本」— 拒绝，与权威迁移冲突，生产异库会读到旧数据。

### Decision 6: 删号级联 = list me + delete each（服务端）

**选择**: `deleteUserAccount` 在切流后：用服务端凭据 + 用户 JWT（或 API 接受的 `X-User-Id` / 等价机制，与 like 一致）调用 `GET /packs/me`，再对每个 id `DELETE /packs/:id`；然后继续删 NextAuth 用户。本地 `Pack.deleteMany` 可作为双清（同库测试无害；生产异库清本地残留）。

**理由**: API 无 bulk-delete-by-user；复用已有 DELETE。

**备选**: 等 API 提供 `DELETE /packs/me` — 可后续优化，不阻塞本 change。

### Decision 7: 切流开关与一次切换

**选择**: 用环境变量或单一适配开关（例如 `PACK_API_VIA_WINSTALL=1`）控制 `fetchPackAPI` / SSR / stats / 删号是否走 API。默认开发可开；生产在 API 迁数对账通过后打开。不做长期双写。回滚：关开关，流量回到本地 `/api/packs`（代码仍在）。

**理由**: 与 API design Decision 9 一致；降低 big-bang 风险。

**备选**: 无开关直接改死 — 仅适合测试同库已共用 collection 且可接受瞬间切换时。

### Decision 8: 本地路由保留但 flag on 零依赖

**选择**: 本期不删 `pages/api/packs/*`（回滚面）。**不变量**：`PACK_API_VIA_WINSTALL`（及客户端 `NEXT_PUBLIC_*`）为 on 时，浏览器、SSR、客户端 helper **不得**请求 `/api/packs/*`（含 stats）。该目录仅在 flag off 时接收流量。本地 handler 的 deprecation log 在 flag on 时应保持沉默；若仍打出，视为漏改。

后续 cleanup change：删整个 `pages/api/packs/`，再砍 `fetchPackAPI` / SSR / 删号的 flag-off 分支与 `packService` / `Pack` 模型。删号里对本地 Mongo 的残留双清不属于本 API 包，随 model 一起拆。

**理由**: 代码留着 ≠ 切流后还走这些接口。零 HTTP 才能让后期删除变成机械清理，而不是再发现 stats 热路径。

## Risks / Trade-offs

- **[Risk] 生产未迁数就开开关 → 空列表 / 全 0 stats** → Mitigation：开关与运维清单；切流前抽样 `_id` + `GET .../stats` 对账  
- **[Risk] BFF 漏代签 `GET /packs/me` 或 `POST /packs`** → Mitigation：按 Decision 2 列清单写测试/手工用例  
- **[Risk] 详情无 JWT 导致 owner 打不开 private** → Mitigation：Decision 3  
- **[Risk] Pack track 无 sessionId 被 API 拒** → Mitigation：对齐 App，强制 `getSessionId()`  
- **[Risk] 官方推荐过滤在公开列表分页下不全** → Mitigation：提高 limit / 循环分页直到收齐 creator；或后续 API 按 userId 查  
- **[Risk] flag on 仍打 `/api/packs/:id/stats`** → Mitigation：Decision 4/8；`trackPackStats` 按开关分支；deprecation log 验收零命中  
- **[Trade-off] Pack track 与 App 入口不一致**（BFF analytics vs `/api/apps/:id/stats`）→ 接受；好让 `pages/api/packs/` 可独立删除  
- **[Trade-off] 保留本地路由增加「两套入口」迷惑** → 可接受至 cleanup change；用开关与「flag on 零命中」约束降低误用  
- **[Trade-off] 删号 N 次 DELETE** → 用户 Pack 数量有限（公开上限 10），可接受  

## Migration Plan

1. **前置（API 仓）**: Pack CRUD 可用；生产完成 packs 导入 + PackStats 灌数并对账；测试同库确认 collection 共用策略。  
2. **本仓实现**: BFF 规则 → `fetchPackAPI` 映射 → stats/track → SSR/sitemap → 删号；加切流开关。  
3. **验证（开关开）**: 创建/编辑/删除/复制、我的列表、公开列表分页与搜索、详情（含 private 所有者）、view track、首页推荐、sitemap、删号后 API 无孤儿。  
4. **生产切流**: 维护窗或低峰开开关；监控 4xx/5xx 与空列表。  
5. **回滚**: 关开关；确认本地库在窗口内仍可读（若生产已停写本地，回滚需同时恢复写或接受只读旧数据——运维需知情）。  
6. **后续 change**: 确认 flag on 下 `pages/api/packs/` 零命中后，删除该目录及 flag-off 分支 / `packService` / `Pack` 模型；可选 JWT 直连（需求 4）。

## Open Questions

- 官方推荐 Pack：首期「拉公开列表再按 `NEXT_OFFICIAL_PACKS_CREATOR` 过滤」是否足够，或是否要在 API 增加按 `userId` 列表接口（不阻塞适配，只影响推荐完整性）。
