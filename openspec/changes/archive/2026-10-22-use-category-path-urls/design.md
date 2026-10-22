## Context

见 proposal.md。现行分类页是 `pages/category.js`，用浅路由把货架写进 `?category=`。All 的稳定地址是裸 `/category`。展示名在 `utils/categoryMeta.js` 的 `CATEGORY_LABELS`。Pages Router 的配置重定向作用于文档请求，不作用于 `Link` / `router.push`。Next 16 会把原查询带到重定向目标；写成空的 `category=` 时，Location 仍带着这个参数。

## Goals / Non-Goals

**Goals:**

- 同一页面组件同时服务 `/category` 与 `/category/<slug>`。
- 重定向与页面共用一份货架 slug，避免 proxy 与 `CATEGORY_SLUGS` 各写一份。
- 旧的已知查询在文档请求上变成路径，且目标地址不再带 `category`。

**Non-Goals:**

- App 详情上的分类入口。
- 为无法识别的 `category` 查询写重定向规则。
- 改 `GET /apps/categories/:id`、分类网格、广告或 `llms.txt`。
- 把 slug 从下划线改成连字符。
- 改 All 的现有文档标题字符串。
- 改 `page_loaded` 的推送方式或 `page_title` 取值；报表按路径区分货架即可。

## Decisions

### 1. 可选 catch-all，不拆两个页面文件

**选择：** 将 `pages/category.js` 移到 `pages/category/[[...slug]].js`。无段为 All。一段且属于 14 个货架时为该货架。`all`、无法识别的一段、或多于一段时，`getStaticProps` 永久重定向到 `/category`。`getStaticPaths` 预生成裸路径和 14 个货架。

**理由：** 标签切换仍在同一个页面组件里，列表、广告会话和展开状态不用跨页面文件交接。`/category` 与 `pages/category/` 目录不能并存，所以原文件必须挪走。相对导入从 `../` 改为 `../../`。

**备选：** `index.js` 加 `[slug].js`。否决：切货架会卸载页面，状态要再抬一层。

### 2. 无图标的路径模块供配置引用

**选择：** 新增 `utils/categoryShelfPath.js`（不引用 `react-icons`）。它导出 14 个货架 slug、`categoryPagePath`、`categoryDocumentTitle`，以及文档请求用的重定向列表。`categoryMeta.js` 从这里取 slug，再拼上 `all` 与图标。`CATEGORY_LABELS` 仍是展示名来源，标题函数读取它，或把纯文案表放在这个新模块、由 `categoryMeta.js` 再导出。`next.config.js` 的 `redirects()` 动态 `import` 该模块，不在配置里手写 slug。

**理由：** `categoryMeta.js` 依赖图标，不能进 `next.config.js`。动态 import 避免配置去加载 React。

**备选：** 在 `next.config.js` 复制 14 条。否决：词表会分叉。

### 3. 用 proxy 清掉 category 查询

**选择：** `proxy.js` 只匹配 `/category`。查询 `category` 为 14 个货架之一时，308 到 `/category/<slug>` 并删掉该参数。值为 `all` 时，308 到 `/category` 并删掉该参数。其它查询参数保留。无法识别的值不重定向。路径由 `categoryQueryRedirectPath` 决定。页面不再读取或写回 `category` 查询。

**理由：** Next 16 的 `redirects` 会把原查询带到目标地址。把目标写成 `?category=` 时，Location 仍是 `/category/browser?category=`，空参数没有被去掉。Proxy 能在发 Location 之前删除这个参数。客户端导航不会走到这里，所以站内链接必须直接写路径。

**备选：** `next.config.js` 的 `redirects()`。否决：清不掉 `category`。只在页面里 `router.replace`。否决：首次打开会先记旧地址。

### 4. 文档标题与 canonical 跟路径走

**选择：** All 使用现有字符串 `Apps by Category - winstall`。其它货架使用 `{CATEGORY_LABELS[slug]} - winstall`，连字符两侧各一个空格，与 All 的分隔符一致。`MetaTags` 的 `title` 与 `path` 使用同一组结果。`path` 为 `/category` 或 `/category/<slug>`。不改 meta description，不在页面上加分类标题。

**理由：** `MetaTags` 已经把标题写入 `title`、`og:title`、`twitter:title`，并把 `path` 写成 canonical 与分享地址。

### 5. 导航选中认前缀

**选择：** `components/Nav.js` 在路径为 `/category` 或以 `/category/` 开头时给 Apps 选中态。链接目标仍是 `/category`。

**理由：** 货架页的路径不再等于 `/category`，精确相等会在货架上丢掉选中态。

## Risks / Trade-offs

- **[重定向目标仍带 category 查询]** → 不使用 `next.config.js` 的 `redirects()`。由 `proxy.js` 删除该参数后再 308，并请求旧地址确认 Location 里没有 `category`。
- **[Pages Router 不对客户端导航应用 next.config 重定向]** → 站内链接直接写路径。只有整页请求的旧书签走配置重定向。已经留在前端路由里的旧查询不会被这组规则改写；页面忽略该查询并显示 All。
- **[308 会被浏览器缓存]** → 接受。回滚后，缓存过该重定向的客户端仍会跳到路径，直到缓存过期。
- **[未知查询留在地址栏]** → 接受。不为 `?category=nope` 写规则；页面显示 All。
- **[`page_loaded` 的 `page_title` 可能仍是上一页]** → 接受。本 change 不改 GTM 推送；货架区分靠 `page_path`。

## Migration Plan

- 只发 Web。先有路径页面，再启用重定向，避免旧地址跳到尚未存在的路径。
- 回滚：去掉 `proxy.js` 里的这条重定向，把分类页移回 `pages/category.js` 并恢复查询同步。已缓存的 308 不会立刻跟着回滚。
- 不迁移 API，不改 sitemap 或 `llms.txt`。
