## Context

See proposal.md — Why。Track 写入已直连 `POST /analytics/track`。`fetchPackStats` 已封装 `GET /packs/:id/stats` 但详情未调用。App 详情无 stats helper。Like 无客户端、无本地模型（PackLike 已删）。登录门闸已有：`useRequireAuth` + `LoginPanel` + `resumeKey`（Copy Pack 同款）。

## Goals / Non-Goals

**Goals:**

- 先用 `.demo` 静态假数据确认详情上的数字与 Like 位置，再改页面并接 API
- 详情读 stats、画 views / installs；Like 复用现有登录门闸
- Pack / App 的 like 与 stats 各收在一个 helper 里，路径变更只改一处

**Non-Goals:**

- 不在 design 里发明一套与 API 仓冲突的 Like URL；未确认前用下方默认假设，确认后只改 helper
- 不把 counts 或 Like 铺到列表/卡片
- 不做 Trending、不做 Like 开关
- 不改 track 写入路径

## Decisions

### Decision 1: Demo 只铺数据，再改真页面

**选择**: `.demo` 放 App / Pack 详情静态稿，写上假的 views、installs、likeCount、liked。不接登录、不接 API。版式确认后再改 `AppDetailView` 与 `pages/packs/[id].js`。

**理由**: 需求已限定「demo 先加数据」；交互与回跳有现成门闸，不必在静态稿里演一遍。

**备选**: 直接改生产页面 — 拒绝，先对齐位置。交互式 demo — 超出「先加数据」。

### Decision 2: 数字放详情，不挡主操作

**选择**:

- App：标题 / publisher 下方一行 `views · installs`；Like 放在操作行，Add to list 之后、Share 之前
- Pack：现有 badge 行下方一行 counts；Like 放在 Install 右侧、owner 操作左侧

Copy / Install / Add to list 位置不变。

**理由**: 不抢安装主路径；Pack 的 Install 仍是第一操作。

**备选**: 把 counts 塞进 Information 表 — 拒绝，太容易看不见。卡片同步上数字 — 本期不做。

### Decision 3: Stats 读接口

**选择**:

| 资源 | 读 |
|------|----|
| Pack | 已有 `GET /packs/:id/stats`（`fetchPackStats`） |
| App | 对等 `GET /apps/:id/stats`（新增 helper，走 `fetchWinstallAPI`） |

匿名读，不带 Bearer（与现有 `GET /packs/:id/stats` 一致）。若 API 要带票才能返回 `liked`，helper 按 `GET /packs/:id` 的「有未过期票才带」处理，缺票仍要能拿到公开计数。

字段在 helper 里映射成 `{ views, downloads, likeCount, liked }`。API 字段名不同只改映射。读失败：不画该行数字，页面其余照常。

**理由**: Pack 契约已在 `pack-api-client`；App 镜像同一形状，避免两套展示逻辑。

**备选**: 把 counts 嵌回 Pack/App 文档 — 拒绝，与现行 spec 冲突。SSR 拉 stats — 不必要，详情客户端已拉 Pack/App。

### Decision 4: Like 走独立 helper，默认统一 likes 面

**选择**: 与 winstall-api 现网对齐（`src/server.js` / `statsApi` 测试）：

- 读：`GET /apps/:id/stats`、`GET /packs/:id/stats` → `{ id, viewCount, downloadCount, likeCount, liked? }`。`liked` 仅在带有效用户身份时出现。
- 写：`POST|DELETE /apps/:id/like`、`POST|DELETE /packs/:id/like` → `{ id, likeCount, liked }`。重复 like 为 409。

Helper 映射为 `{ views, downloads, likeCount, liked }`。`GET …/stats` 有未过期 session 票则带 Bearer（拿 `liked`）；like 路径必带 JWT。

**理由**: 两端同一套 target 模型，和 analytics 的 `targetType` 一致。URL 未钉死时不应散落在两个页面里。

**备选**: `POST /apps/:id/like` 与 `POST /packs/:id/like` — 若 API 已是这样，helper 内改映射即可。恢复本地 PackLike — 拒绝。

### Decision 5: 未登录点心复用 Copy Pack 门闸

**选择**: `useRequireAuth({ resumeKey })`。未登录 `openLogin`；登录回详情后 `consumeAuthGateIntent` 再发 like。`callbackUrl` 为当前详情 path。

**理由**: 行为与 Copy Pack 一致，用户已熟悉 `LoginPanel`。

**备选**: 点心只 toast「请登录」— 拒绝，需求是弹出登录。自造第二套登录 — 拒绝。

### Decision 6: 本 change 不做开关、不做 Trending

**选择**: Like 与 counts 默认露出。不设 `ENABLE_LIKE`。不画 Trending。

**理由**: 提案已收口；开关留后续。

## Risks / Trade-offs

- **[Risk] API 尚无 `GET /apps/:id/stats` 或 likes 面** → Mitigation：实现前与 API 仓对契约；Web 只改 helper。缺 App stats 时 Pack 仍可先接 `fetchPackStats`，App 计数暂省略（符合「读失败不挡页」）。
- **[Risk] 登录回跳后用户改了 URL** → Mitigation：`callbackUrl` 锁在详情；`resumeKey` 按 appId/packId 区分。
- **[Risk] 点心与 track download 被当成同一动作** → Mitigation：Like 不打 `download` track；Copy / Install 仍只打 download。
- **[Trade-off] 列表没有数字** → 接受；有强需求另开 change。

## Migration Plan

1. 落地 `.demo` 静态稿，确认文案与位置。
2. 接 Pack stats（已有 helper）→ App stats helper → Like helper。
3. 详情接线；Like 走门闸。
4. 回滚：撤详情上的展示与 like 调用即可，不改 track 写入。

## Open Questions

无。likes 与 stats 字段已按 API 仓现网契约钉死。
