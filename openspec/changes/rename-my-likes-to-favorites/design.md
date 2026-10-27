## Context

见 proposal.md 的 Why。现状：收藏架是 `pages/my/likes.js`，账户菜单在 `components/UserMenu.js`，文案是 Liked。列表仍由浏览器请求 `GET /apps/liked` 与 `GET /packs/liked`。`next.config.js` 目前没有 `redirects`。静态 sitemap 的路径数组不含该页。能力目录继续叫 `my-likes`。

## Goals / Non-Goals

**Goals:**

- 页面文件与菜单链接改到 `/my/favorites`，可见货架文案按 delta spec。
- 只让 `/my/likes` 在响应阶段重定向到 `/my/favorites`，并带上原查询字符串。

**Non-Goals:**

- 不改 Like / Unlike、心形图标，也不改 `isLikedListPath` 与两条 liked 列表接口。
- 不把 `/my` 做成页面，不从其它路径重定向过来。
- 不改 Service Worker 的缓存策略，不改 `llms.txt` 的排除规则。

## Decisions

### 1. 用配置重定向，而不是留一个旧页面

把 `pages/my/likes.js` 移到 `pages/my/favorites.js`。在 `next.config.js` 的配置对象里增加 `redirects`：`source` 为 `/my/likes`，`destination` 为 `/my/favorites`，`permanent` 为 `false`。Next.js 在进入页面文件之前处理这条规则，所以 `/my/likes` 不会再渲染列表。查询字符串默认会跟到目标地址，页面继续忽略 `page`、`offset` 和标签查询。

`permanent: false` 是 307。不用 308：这个地址上线不久，308 会被浏览器记下来；回滚后旧书签仍会跳到已经不存在的新地址。307 每次仍会跳到收藏架，回滚时去掉这条规则即可。

不在 `pages/my/likes.js` 里做客户端跳转。那样会先画出旧页面。

### 2. 文案只改货架，不改放入动作

菜单、主标题、`MetaTags` 标题、标签列表 `aria-label` 改为 Favorites。副标题与描述为 “Your favorite apps and packs.”。未登录标题为 “Sign in to see your favorite apps and packs.”。空态标题改为 “No apps yet” / “No packs yet”，说明仍是 “Like an app from its page. It will show up here.” 与对应的 pack 句子。失败说明改为 “Could not load apps.” / “Could not load packs.”。登录 `callbackUrl` 改为 `/my/favorites`。菜单继续用 `FiHeart`。

样式文件从 `styles/myLikes.module.scss` 改名为 `styles/myFavorites.module.scss`，类名不动。

### 3. 能力目录不改名

delta 写在 `specs/my-likes/spec.md`。不把 `openspec/specs/my-likes/` 改成 `my-favorites`。要求标题 “Liked page lives at /my/likes” 保持原样，归档时才能对上。

## Risks / Trade-offs

- [浏览器或 Service Worker 仍缓存着旧的 `/my/likes` 文档] → 接受。缓存失效后的网络请求会走到 307。本变更不改 Service Worker。
- [307 不更新书签里的地址] → 接受。打开旧地址仍进入收藏架。页面带 `noindex`，没有搜索引擎地址要迁移。
- [回滚时若先删页面、后删重定向，`/my/favorites` 会 404] → 回滚时同时移回页面文件并去掉 `redirects`。

## Migration Plan

1. 同一次部署带上新页面、菜单链接和 `/my/likes` 重定向。
2. 回滚：把页面文件移回 `pages/my/likes.js`，菜单与 `callbackUrl` 改回，并删除这条 `redirects`。无数据迁移。

## Open Questions

无。
