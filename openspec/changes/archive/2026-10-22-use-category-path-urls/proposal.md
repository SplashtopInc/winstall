## Why

分类货架现在写在查询参数上，例如 `/category?category=browser`。GTM 与 GA4 的页面路径默认丢掉 query，各货架被记成同一条 `/category`，文档标题也都是 `Apps by Category - winstall`，报表拆不开。货架改成路径之后，路径本身就是统计维度，标题也可以按货架区分。

## What Changes

- **BREAKING** 14 个货架的公开地址从 `/category?category=<slug>` 改为 `/category/<slug>`。slug 保持现有词表，含下划线（如 `cloud_storage`）。
- 裸 `/category` 继续表示 All，地址栏不写 slug。不发布 `/category/all`。
- 已知货架的旧查询 `/category?category=<slug>` 在进入页面前重定向到 `/category/<slug>`。`?category=all` 与路径 `/category/all` 重定向到 `/category`。无法识别的查询值不单独立规则，页面仍显示 All。
- 各货架的文档标题改为 `{展示名} - winstall`（如 `Browsers - winstall`）。All 的标题保持 `Apps by Category - winstall`。同一字符串继续交给现有 `MetaTags`。页面上仍不展示分类标题。
- 首页 Top Categories 与分类标签切换改为写入路径。主导航 Apps 仍指向 `/category`，停在任一货架路径时也为选中态。
- 不在 App 详情展示分类入口。不改分类列表 API，不改 `/apps`、`/packs` 的公开路径。

## Capabilities

### New Capabilities

- （无）

### Modified Capabilities

- `category-browse`：货架深链、首页入口、导航选中态与文档标题从查询参数改为路径；为旧的已知查询和 `/category/all` 提供重定向。

## Impact

- 前端：分类页路由与地址同步、`components/topCategories.js`、`components/Nav.js`、分类页传给 `MetaTags` 的 `title` 与 `path`。
- 请求：`proxy.js` 把已知的 `/category?category=` 永久重定向到路径，并去掉 `category` 参数。页面不再把 `?category=` 写回地址栏。
- 统计：分类切换后的页面路径为 `/category` 或 `/category/<slug>`。不改 `page_loaded` 的推送方式与 `page_title` 取值。
- API、`llms.txt` 中的 `/category` 入口、以及 `public-urls` 约束的四条路径不变。
