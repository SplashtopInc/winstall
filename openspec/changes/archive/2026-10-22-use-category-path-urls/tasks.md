## 1. 货架路径与标题

- [x] 1.1 新增 `utils/categoryShelfPath.js`，不引用图标。导出 14 个货架 slug、`categoryPagePath`、`categoryDocumentTitle`，以及文档请求重定向列表。All 的路径为 `/category`，标题为 `Apps by Category - winstall`。货架路径为 `/category/<slug>`，标题为 `{展示名} - winstall`。`cloud_storage` 保持下划线
- [x] 1.2 `utils/categoryMeta.js` 的 `CATEGORY_SLUGS` 改为 `all` 加这份货架 slug。展示名仍由 `CATEGORY_LABELS` 提供，标题函数与页面共用它
- [x] 1.3 用 Node 测试锁定：14 个货架路径与标题、`category=all` 与每个货架查询的重定向目标不再带 `category` 参数、未知查询不在重定向列表里

## 2. 分类页改读路径

- [x] 2.1 将 `pages/category.js` 移到 `pages/category/[[...slug]].js`，修正相对导入。`getStaticPaths` 预生成 `/category` 与 14 个货架。无段为 All；`all`、未知段或多段由 `getStaticProps` 永久重定向到 `/category`
- [x] 2.2 标签切换写入 `categoryPagePath`。激活 All 时地址为 `/category`。页面不再读取或写回 `category` 查询。`MetaTags` 的 `title` 与 `path` 使用 `categoryDocumentTitle` 和 `categoryPagePath`
- [x] 2.3 确认分类网格、Load more、广告与「页面上不出现分类标题」保持原样

## 3. 站内入口

- [x] 3.1 `components/topCategories.js` 的五个入口改为 `/category/<slug>`
- [x] 3.2 `components/Nav.js` 的 Apps 仍指向 `/category`。路径为 `/category` 或以 `/category/` 开头时为选中态

## 4. 文档请求重定向

- [x] 4.1 `proxy.js` 匹配 `/category`，用 `categoryQueryRedirectPath` 做 308。目标地址删除 `category` 参数。Next 16 的 `redirects()` 会保留原查询，不用它
- [x] 4.2 确认站内没有剩余的 `/category?category=` 链接

## 5. 核对

- [x] 5.1 打开 `/category`，确认为 All，标题为 `Apps by Category - winstall`，canonical 为 `/category`
- [x] 5.2 从首页进入 Developer Tools，地址为 `/category/development`，标题为 `Developer Tools - winstall`，Apps 为选中态。再切到 browser，地址为 `/category/browser`
- [x] 5.3 文档请求 `/category?category=browser` 与 `/category?category=all`，确认落到对应路径且最终地址没有 `category` 查询。打开 `/category/all` 与 `/category/not-a-shelf`，确认回到 `/category`
