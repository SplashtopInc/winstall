## Why

用户能在详情页点赞，但没有地方看自己点过的 App 和 Pack。winstall-api 已提供当前用户的 `GET /apps/liked` 与 `GET /packs/liked`。网站需要一个只属于当前用户的列表页把这两条接口接上。

## What Changes

- 新增页面 `/my/likes`：已登录用户查看自己点赞过、且现在仍可访问的 App 与 Pack。视觉对齐 `.demo/liked.html`。
- Apps / Packs 两个标签各自用 Load more 追加。每次进入页面从第一页重新请求；同一次停留里切换标签保留已加载内容。
- App 卡可勾选，写入全站已有的安装选择。列表上不提供取消赞，取消赞仍只在详情页。
- 未登录看到登录说明。个人列表不进 sitemap，页面不给搜索索引。`/my` 本身不提供页面。
- 浏览器请求这两条列表时带上现有 session API JWT。不改 winstall-api。

## Capabilities

### New Capabilities

- `my-likes`：当前用户在 `/my/likes` 分页查看自己点赞过的 App 与 Pack，App 可加入全站选择，列表本身不取消赞。

### Modified Capabilities

- （无）卡片计数、统计开关、详情点赞与 `/apps`、`/packs` 公开路径的既有要求不变。

## Impact

- 前端：新页面 `pages/my/likes.js`，头像菜单增加 Liked 入口；`fetchWinstallAPI` 对 `GET /apps/liked` 与 `GET /packs/liked` 强制带 session API JWT。复用 `SingleApp`、`PackCard`、货架骨架与全站选择条。
- API：只消费已有的 `GET /apps/liked`、`GET /packs/liked`。无新接口，无数据迁移。
- URL：新增 `/my/likes`。不改 `/apps`、`/packs`、`/apps/:id`、`/packs/:id`，也不恢复 `/users/:id`。
