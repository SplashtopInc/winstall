## Why

分类目录接口 `GET /apps/categories/:id` 已上线，Web 仍只有 Express 精选名单和 `/apps` 全量/搜索，没有按分类逛目录的入口。需要把 `.demo/category.html` 接到真接口，且不拆掉现有 `/apps` 搜索。

## What Changes

- 新增 `pages/category.js` 路由 `/category`：分类标签、当前分类的目录卡片网格、Load more。交互对齐 `.demo/category.html`（无分类标题与数量、无页内搜索）。
- 主导航在 Discover App 之后增加文案为 **Apps** 的项，链到 `/category`，**不**链到 `/apps`。
- `pages/apps.js`、`/apps?q=`、发行商浏览、OpenSearch、侧栏 Apps（`FiPackage` → `/apps`）、Express **均不改职责**。
- 列表只请求 `GET /apps/categories/:id?offset=&limit=`，不传 `sort`。分类词表固定 14 个 slug（无 `social_media`、`all`、`others`）。默认 `browser`；换分类重置已加载切片；Load more 追加下一页信封。
- 本 change **新增**源码文件、变量与函数遵循 `AGENTS.md`：lowerCamelCase；常量 `UPPER_SNAKE_CASE`；调用的 API 路径 kebab-case 小写复数（`/apps/categories/:id`）。不重命名既有 PascalCase 组件（如 `SingleApp`、`Nav`）。

## Capabilities

### New Capabilities

- `category-browse`: 主导航 Apps 进入 `/category`，按固定分类拉取信封分页列表，交互对齐分类 demo。

### Modified Capabilities

- （无）不修改 `apps-list-pagination`；`/apps` 目录与搜索契约不变。

## Impact

- **Web**：既有 `components/Nav.js` 只加链接（不重命名）；新增 `pages/category.js`、`styles/categoryPage.module.scss`，以及 lowerCamelCase 的分类 helper/组件（如 `utils/fetchCategoryApps.js`、`components/categoryTabs.js`）。复用既有 `SingleApp`。
- **API**：只消费已有 `GET /apps/categories/:id`（`{ total, offset, limit, data }`）。不改 winstall-api。
- **文档**：归档后架构落到 `openspec/specs/category-browse/design.md`（`AGENTS.md`）；change 期间以本 change 的 `design.md` 为工作稿。
- **文案**：主链 Apps → `/category`，侧栏 Apps → `/apps`，两处同名不同目标，本 change 接受、不改侧栏文案。
- **非目标**：Express、`others`、从分类器拉词表、占用 `pages/apps.js`、为符合 AGENTS 而重命名旧 PascalCase 文件。
