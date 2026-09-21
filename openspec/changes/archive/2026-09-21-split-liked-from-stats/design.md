## Context

见 proposal.md 的 Why。详情 engagement 现由 `useResourceEngagement` 一次 `GET …/stats` 得到 `{ views, downloads, likeCount, liked }`；`fetchWinstallAPI` 对 GET stats 可选带未过期 JWT，对 GET/POST/DELETE `…/like` 强制 JWT。写赞已是 `setResourceLike`。winstall-api：stats 仅计数；`GET …/like` 200 `{ id, liked, likeCount }`（未赞亦 200）；无票 401。

## Goals / Non-Goals

**Goals:**

- 公开计数（views / downloads）与 like 态分请求
- 已登录用 GET like 的 `liked` + `likeCount`（避开 stats 缓存）；未登录 likeCount 回退 stats
- 登录后补拉 GET like；stats 刷新不冲掉 liked / like 侧 likeCount
- stats 请求去掉 Bearer

**Non-Goals:**

- 不改列表 / 周榜 / Pack 详情 app 卡
- 不改 POST/DELETE like 路径与 409 语义
- 不把 GET like 当 views / downloads 来源

## Decisions

### 1. Helper 拆映射，页面仍吃合并对象

**选择：** `mapStatsPayload` 去掉 `liked`。新增 `fetchResourceLike`，映射 `liked` 与 `likeCount`。Hook 合成现有 `stats` 形状：views/downloads 永远来自 stats；已登录后 `liked` / `likeCount` 来自 like 面。详情页可不改。

**理由：** 契约变化集中在 `engagementApi` / hook；stats 可能缓存 likeCount，按钮数字应跟 like 接口。

**备选：** 按钮 likeCount 始终信 stats — 拒绝，缓存会滞后。未登录也打 GET like — 拒绝，API 无票 401。

### 2. 何时打 GET like

**选择：** 有 session（`useSession` 已登录且能带 JWT）才请求。session 从无到有再拉一次。未登录不打。401 / 失败 → `liked: false`，views/downloads 与回退 likeCount 保留 stats。

**理由：** API 无票 401；匿名只需计数。

**备选：** 始终打 GET like 靠 401 — 多一次失败请求。

### 3. 写后与 reloadStats

**选择：** POST/DELETE 成功用写响应的 `liked` + `likeCount`。409 标已赞，可重拉 GET like 校正数字。`reloadStats`（Pack 导出）只更新 views/downloads，不覆盖 `liked` / 按钮 likeCount。

**理由：** 写响应与 GET like 都是 like 面、无 stats 缓存；导出只动 download 计数。

**备选：** 写后再 GET stats 刷新 likeCount — 拒绝，可能仍是缓存。

### 4. stats 鉴权

**选择：** `prefersOptionalUserJwt` 不再匹配 GET stats。GET like 保持 `requiresUserJwt`。

**理由：** 票既拿不到 `liked`，也不是 stats 准入条件。

## Risks / Trade-offs

- **[Risk] 登录后 like 先于 JWT 进 session** → Mitigation：依赖 `useSession`；无 token 则跳过或失败当未赞，session 就绪再拉。
- **[Risk] 两请求竞态，后到的 stats 覆盖 liked / likeCount** → Mitigation：stats 路径只写 views/downloads；like 路径写 liked / likeCount。
- **Trade-off：** 未登录按钮数字仍可能吃 stats 缓存。可接受（GET like 强制登录）；已登录以 like 面为准。

## Migration Plan

1. 与现网 API 同时上线即可（API 已拆字段）。
2. 回滚：恢复 stats 映射 `liked` 与 optional JWT（旧 API 才有意义）。

## Open Questions

无。未赞为 200、App/Pack 同路径、已登录 likeCount 走 like 面、401 当未赞均已对齐。
