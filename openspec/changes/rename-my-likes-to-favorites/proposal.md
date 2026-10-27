## Why

点赞列表页是用户自己的收藏架，用来回看并安装自己留过的 App 与 Pack。菜单和标题现在用过去分词 Liked，读起来像筛选项，不像一个要打开的地方。主流产品里，这种私人货架叫 Favorites。

## What Changes

- **BREAKING** 收藏架的页面地址从 `/my/likes` 改为 `/my/favorites`。账户菜单与页面标题改为 Favorites。副标题、文档描述改为 “Your favorite apps and packs.”。未登录说明改为 “Sign in to see your favorite apps and packs.”。
- 请求 `/my/likes` 时重定向到 `/my/favorites`。除此之外不新增指向该页的重定向。`/my` 仍然不是页面，也不重定向。
- 详情上的 Like / Unlike、心形图标，以及 `GET /apps/liked`、`GET /packs/liked` 保持不变。空态仍用 Like 说明如何把条目放进收藏架。
- 页面继续 `noindex`，继续不进入静态 sitemap，继续不出现在主导航。

## Capabilities

### New Capabilities

### Modified Capabilities

- `my-likes`：收藏架改到 `/my/favorites`，可见名称改为 Favorites，并只从 `/my/likes` 重定向过来。列表数据、分页与勾选不变。空态与错误态仍分开，货架文案不再使用 liked。

## Impact

- 前端：`pages/my/likes.js` 改为 `pages/my/favorites.js`；`components/UserMenu.js` 的菜单文案与链接；登录 `callbackUrl`。`next.config.js` 增加 `/my/likes` → `/my/favorites` 的重定向。
- 规格：`openspec/specs/my-likes/spec.md` 里钉死 `/my/likes`、禁止改道的要求需要改写。
- API：不改 winstall-api，不改 `GET /apps/liked` 与 `GET /packs/liked`。
- 公开 URL：不改 `/apps`、`/packs`、`/apps/:id`、`/packs/:id`。`llms-txt` 已排除 `/my`，无需改其要求。
