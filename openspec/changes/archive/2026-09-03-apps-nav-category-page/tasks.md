## 1. 导航

- [x] 1.1 在既有 `components/Nav.js` 的 Discover App 之后增加主链 Apps，`href="/category"`，`pathname === "/category"` 时 selected
- [x] 1.2 侧栏 Apps（`FiPackage`）保持 `href="/apps"`

## 2. 分类页与取数

- [x] 2.1 新增 `utils/fetchCategoryApps.js`：`fetchCategoryApps` 请求 `GET /apps/categories/:id`（`offset`/`limit`，无 `sort`），按信封读 `data`/`total`
- [x] 2.2 新增 `pages/category.js`：14 个 slug 与展示名常量 `CATEGORY_SLUGS` / `CATEGORY_LABELS`；默认 `browser`；与 `?category=` 同步（非法则纠正为 `browser`）
- [x] 2.3 新增 `components/categoryTabs.js`：前 `VISIBLE_TAB_COUNT`（6）个加 More/Less，可换行；Less 会藏当前项时切回 `browser`
- [x] 2.4 新增 `styles/categoryPage.module.scss`：四列网格对齐目录列表；Load more 为浅蓝胶囊按钮（对齐 demo）
- [x] 2.5 用既有 `SingleApp`（`showSelectCheckbox`）渲染 `data`；无标题、计数、页内搜索；`PAGE_SIZE` 为 8；Load more 用响应 `offset`/`limit`/`total` 追加；换分类重置；错误与 `total === 0` 空态

## 3. 验收

- [x] 3.1 对 `GET /apps/categories/browser` 抽检有命中；若生产标签不是 slug，只在 `fetchCategoryApps` 内映射
- [x] 3.2 核对 `/category` 标签、Load more、勾选、主链 Apps 与侧栏 Apps 目标不同，且 `/apps` 搜索仍可用
- [x] 3.3 不改 Express，不改 `pages/apps.js` 的目录/搜索行为；本 change 新文件均为 lowerCamelCase
