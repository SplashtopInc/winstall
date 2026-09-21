## 1. 映射与 API helper

- [x] 1.1 改 `utils/engagementStats.js` 的 `mapStatsPayload`：只映射 `viewCount` / `downloadCount` / `likeCount`，不再读 `liked`
- [x] 1.2 在 `utils/engagementApi.js` 增加 `fetchResourceLike`（`GET /apps/:id/like` 与 `GET /packs/:id/like`），映射 `liked` 与 `likeCount`；401 或失败返回未赞且不抛成整页错误
- [x] 1.3 更新 `test/engagementApi.test.js`：stats 映射不含 `liked`；覆盖 GET like 的 `liked` / `likeCount` 映射

## 2. 鉴权

- [x] 2.1 改 `utils/fetchWinstallAPI.js`：GET stats 不再 `prefersOptionalUserJwt`；GET like 仍 `requiresUserJwt`

## 3. 详情 hook

- [x] 3.1 改 `hooks/useResourceEngagement.js`：始终拉 stats（views/downloads，未登录时 likeCount）；已登录再拉 GET like 并 merge `liked` 与 `likeCount`；session 从无到有补拉
- [x] 3.2 stats / `reloadStats` 只更新 views/downloads，禁止覆盖 `liked` 与已从 like 面拿到的 likeCount；409 后可重拉 GET like 校正
- [x] 3.3 确认 `components/AppDetailView.js` 与 `pages/packs/[id].js` 仍可用合并后的 `stats.liked` / `likeCount`

## 4. 验收

- [x] 4.1 未登录详情：有计数、按钮未赞、网络无 `GET …/like`
- [x] 4.2 已登录且已赞：打开详情按钮为已赞且数字来自 GET like；点赞/取消赞后数字跟写响应；stats 刷新不打掉赞态与 likeCount
