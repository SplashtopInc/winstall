## Why

winstall-api 的 `GET …/stats` 已不再返回 `liked`；当前用户是否点赞改由强制登录的 `GET …/like` 提供。Web 详情仍从 stats 映射 `liked`，已登录用户会一直显示未赞，409 后重拉 stats 还会把刚点上的赞态盖掉。需要立刻把读路径拆开，否则详情 Like 与 API 契约不一致。

## What Changes

- 详情终身 **views / downloads** 继续只读 `GET /apps/:id/stats` 与 `GET /packs/:id/stats`，映射中去掉 `liked`，**已登录后也不用 stats 的 `likeCount` 画按钮**（stats 可能缓存）。
- 已登录用户另发 `GET /apps/:id/like` 或 `GET /packs/:id/like`，采用 **`liked` 与 `likeCount`**；未登录不请求（like 强制 JWT），按钮数字回退 stats 的 `likeCount`；401 或读失败当作未赞，且不得挡住 views/downloads。
- GET stats **不再附带** session JWT。
- 点赞 / 取消赞仍走 `POST` / `DELETE …/like`。写成功后的即时 `liked` / `likeCount` 用写响应；刷新 stats（如 Pack 导出）不得覆盖 `liked` 与按钮上的 likeCount。
- 列表卡、周榜、Pack 详情 app 卡不改（本就不读 `liked`）。

## Capabilities

### New Capabilities

- （无）

### Modified Capabilities

- `detail-engagement`: 已登录时 Like 的已赞态与 likeCount 必须来自 `GET …/like`（或写响应），不得用可能缓存的 stats `likeCount`；未登录仍用 stats 的 likeCount。
- `pack-api-client`: Pack 详情 stats 必须匿名、不带 `Authorization`；liked 与已登录 likeCount 改由 `GET /packs/:id/like` 提供。

## Impact

- 代码：`utils/engagementStats.js`、`utils/engagementApi.js`、`hooks/useResourceEngagement.js`、`utils/fetchWinstallAPI.js`；测例 `test/engagementApi.test.js`。`AppDetailView` / `pages/packs/[id].js` 若仍消费合并后的 `stats.liked` 可不动。
- API：对齐现网 `GET|POST|DELETE /apps/:id/like` 与 `/packs/:id/like`（同形）；stats 不含 `liked`。
- 无新依赖。
