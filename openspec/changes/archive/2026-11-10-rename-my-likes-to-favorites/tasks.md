## 1. 收藏架页面

- [x] 1.1 将 `pages/my/likes.js` 移到 `pages/my/favorites.js`。登录 `callbackUrl` 与 `MetaTags` 的 `path` 改为 `/my/favorites`
- [x] 1.2 菜单项、主标题、文档标题和标签列表的无障碍名称改为 Favorites。副标题与文档描述改为 “Your favorite apps and packs.”。未登录标题改为 “Sign in to see your favorite apps and packs.”。空态标题改为 “No apps yet” / “No packs yet”，说明仍用 Like。失败说明改为 “Could not load apps.” / “Could not load packs.”
- [x] 1.3 将 `styles/myLikes.module.scss` 改名为 `styles/myFavorites.module.scss`，并更新页面引用。类名保持不变

## 2. 旧地址与入口

- [x] 2.1 在 `next.config.js` 增加 `/my/likes` 到 `/my/favorites` 的重定向，`permanent` 为 `false`。不增加其它指向该页的重定向，也不新增 `pages/my/index.js`
- [x] 2.2 在 `components/UserMenu.js` 把该项改为 Favorites，链接改为 `/my/favorites`，保留心形图标。主导航不增加该项
- [x] 2.3 确认 `pages/sitemap-static.xml.js` 的路径数组不含 `/my/favorites` 与 `/my/likes`

## 3. 核对

- [x] 3.1 确认 `utils/engagementPaths.js` 仍只把 `GET /apps/liked` 与 `GET /packs/liked` 当作点赞列表，Like / Unlike 文案未改
- [x] 3.2 请求 `/my/likes` 得到 307，目标路径为 `/my/favorites`，且查询字符串仍在。请求 `/my` 不是收藏架，也不重定向
- [x] 3.3 运行现有 `engagementPaths` 与 `llmsTxt` 测试，确认仍通过
