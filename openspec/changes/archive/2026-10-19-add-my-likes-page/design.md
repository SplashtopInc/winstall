## Context

见 `proposal.md` 的 Why。行为契约见 `specs/my-likes/spec.md`。

winstall-api 已提供需登录的 `GET /apps/liked` 与 `GET /packs/liked`，成功体为 `{ total, offset, limit, data }`，顺序是点赞时间从新到旧。卡片分别与分页后的 `GET /apps`、`GET /packs` 同形，并带 `liked: true` 与终身 `viewCount` / `downloadCount` / `likeCount`。App 卡片不含 `versions`。隐藏已删除 App、他人 private Pack 时不删点赞记录。

网站侧：`fetchWinstallAPI` 只对 `GET /packs/me` 和 `…/like` 强制带 session API JWT，`/apps/liked` 目前会匿名发出并得到 401。`isLikePath` 匹配的是 `/apps/:id/like`，测试明确 `/likes` 不是 like 路径。列表页在浏览器里拉数据；`Pages Router` 离开后再进入会重新挂载。`/packs` 另在 `pageshow`（`persisted`）和标签重新可见时刷新，后者不适用于本页。全站选择存在 `_app` 与 `localStorage`。`/generate` 会为缺少 `versions` 的已选应用补目录详情。静态 sitemap 是显式路径列表。视觉源是 `.demo/liked.html`。

## Goals / Non-Goals

**Goals:**

- 用一次客户端挂载把两条列表从 offset 0 画出来，Load more 只追加当前标签。
- 把这两条 GET 纳入现有 JWT 与 401 重试，不扩大 like 写路径。
- App 勾选复用全站选择；Pack 卡复用 Hub 轻卡。

**Non-Goals:**

- 不在列表上取消赞，也不新增点赞变更事件。
- 不在停留期间轮询，也不在标签重新可见时重拉。
- 不做 `/my` 首页，不把 My Packs 从 `/packs` 搬来。
- 不改 winstall-api，不改公开 URL。

## Decisions

### 1. 页面只在浏览器拉列表

新增 `pages/my/likes.js`。文档壳走与其它静态页相同的静态 props。列表等 session 就绪后由浏览器请求。服务端 helper 拿不到 session，不能代拉。

未登录沿用 `/packs` My 的登录说明和 `LoginButtons`，`callbackUrl` 为 `/my/likes`。session 加载中与第一批未返回且尚无卡片时，用现有货架骨架（App / Pack 两种），大约两行，不按 24 条生成。

### 2. JWT 用独立路径判断

在 `utils/engagementPaths.js` 增加「恰好是 `/apps/liked` 或 `/packs/liked`」的判断，供 `fetchWinstallAPI` 在 GET 时与 `/packs/me` 一样强制带 JWT，从而沿用现有 401 后重读 session 的一次重试。不把这两条并进 `isLikePath`，避免 `POST` / `DELETE` 被当成单条赞写。

查询只带 `offset` 与 `limit`。`limit` 常量 24，首屏与 Load more 相同。不传 `sort`，不传 `userId`。

### 3. 进入即重挂载，往返缓存再拉一次

列表状态只放在页面组件里。正常路由进入会卸载再挂载，`useEffect` 从 offset 0 同时请求两条列表，替换而不是追加。浏览器以往返缓存恢复文档时听 `pageshow` 且 `persisted` 为真，再做同一次重置。不听 `visibilitychange`。

同一次停留里切换标签只改当前标签，不重置另一侧已加载的 `data`。再次进入时组件是新的，两侧都回到第一页，Load more 展开的后续页自然丢掉。

全站选择不在这个状态里，重拉列表不会清勾选。

### 4. 卡片直接复用

App 用紧凑 `SingleApp`，打开 `showSelectCheckbox`。不在本页补 `versions`；生成脚本时现有 `/generate` 会补。图标 URL 按 `/apps` 列表的同一映射补全。

Pack 用 `PackCard`。`visibility` 为 private 时打开可见性徽章，public 时关闭。图标 URL 按 `/packs` 列表的同一映射补全。计数仍由这两张卡和统计展示开关决定，本页不另读 `…/stats`。

账户菜单在 `components/UserMenu.js` 的登出项之前加指向 `/my/likes` 的 Liked。页面用 `MetaTags` 标题 Liked，并另写 `robots` `noindex`。静态 sitemap 的路径数组不加入该页。

空态链到 `/category` 与 `/packs`。失败用现有错误展示。

## Risks / Trade-offs

- [另一标签页里取消赞，当前停留看不到] → 接受。下次进入会重拉。不为详情写成功补事件。
- [往返缓存不重挂载，列表停在离开前] → 只在 `pageshow` 且 `persisted` 时从第一页重拉。
- [App 卡片没有 `versions`，勾选后生成脚本缺安装器] → 沿用 `/generate` 已有的补全，本页不额外打 `GET /apps/:id`。
- [API 未部署时页面只有错误态] → 回滚时去掉页面与菜单项即可。无数据要清。
- [Service Worker 若缓存 API GET，重拉仍可能是旧响应] → 请求继续 `cache: no-store`。本变更不把这两条路径加进运行时缓存。

## Migration Plan

1. 确认目标环境已有 `GET /apps/liked` 与 `GET /packs/liked`。
2. 部署本页与 JWT 判断。未部署前没有 `/my/likes`。
3. 回滚：去掉页面、菜单项和路径判断。无迁移、无回填。

## Open Questions

无。
