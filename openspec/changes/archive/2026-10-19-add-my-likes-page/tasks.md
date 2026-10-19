## 1. 列表请求带上 JWT

- [x] 1.1 在 `utils/engagementPaths.js` 增加恰好匹配 `/apps/liked` 与 `/packs/liked` 的判断，且不让 `isLikePath` 把它们当成 `…/like`
- [x] 1.2 `utils/fetchWinstallAPI.js` 对这两条 GET 强制带 session API JWT，沿用现有 401 重试；不附带 `userId`
- [x] 1.3 在 `test/engagementPaths.test.js` 覆盖新判断，并确认 `/likes` 与 `…/like` 的原有结果不变

## 2. /my/likes 页面

- [x] 2.1 新增 `pages/my/likes.js`：静态文档壳、标题 Liked、`noindex`；session 未就绪时出货架骨架；未登录出登录说明且不请求列表，登录回跳 `/my/likes`
- [x] 2.2 已登录进入时并行请求两条列表，`offset` 0、`limit` 24；Apps / Packs 标签显示 `total`；Load more 只追加当前标签；不把标签、`page`、`offset` 写入地址栏
- [x] 2.3 列表状态只留在页面内。往返缓存恢复（`pageshow` 且 `persisted`）时从第一页重拉。不听标签重新可见。同一次停留内切换标签保留已加载卡片
- [x] 2.4 App 用紧凑 `SingleApp` 勾选并入全站选择；Pack 用 `PackCard`，仅 private 显示可见性。补全两侧图标 URL。空态链到 `/category` 与 `/packs`；失败用现有错误态。卡片不提供取消赞，不为卡片另读 stats
- [x] 2.5 确认 `pages/sitemap-static.xml.js` 的路径列表不含 `/my/likes`，且不新增 `pages/my/index.js`

## 3. 入口

- [x] 3.1 在 `components/UserMenu.js` 的登出项之前加入指向 `/my/likes` 的 Liked。主导航不增加该项
