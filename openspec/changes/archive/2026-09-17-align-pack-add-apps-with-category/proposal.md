## Why

Pack 详情的 Add Apps 弹窗仍用旧 picker 卡、五列网格和 Prev/Next 翻页，默认列表也不是分类浏览，和 `/category` 已经统一的货架体验脱节。现在要把弹窗的默认展示对齐分类页，同时保留搜索框作为找应用的出口。

## What Changes

- Pack Add Apps 弹窗默认浏览改为与 `/category` 相同的分类选项、四列网格、Load more（每批 56）；分类以工具行右侧 outlined 下拉呈现（左搜索、右分类）；去掉分类标签条、翻页按钮、左右键翻页和「Showing page x」计数条。
- 弹窗继续使用独立的 `AddAppPickerCard`（不并入 `SingleApp`、不改点选 / Already added / 底部加 pack），但卡片皮对齐 compact `SingleApp`（身份区、两行描述、终身 views/downloads/likes）。
- 搜索框保留。空查询走分类浏览；已提交的关键词或 `publisher:` 查询盖过分类网格，走现有 search / publishers 信封，同样用 Load more 追加。从下拉选择分类则清空查询并加载该类。搜索不与当前分类求交。
- 复用 `fetchCategoryApps` 与 `categoryMeta`；新增 `categoryFilterSelect`。弹窗无 URL，关闭后重开默认 `all`。

## Capabilities

### New Capabilities

- `pack-add-apps`: Pack 详情 Add Apps 弹窗的分类浏览、搜索覆盖、picker 卡展示与加入 pack 的交互。

### Modified Capabilities

- `apps-list-pagination`: Add Apps 弹窗不再用页码翻页控件；用户仍须能通过信封的 `offset`/`limit`/`total` 看完分类、搜索与 publisher 列表，控件改为 Load more。`/apps` 页翻页不变。

## Impact

- 前端：`components/AddAppsDialog.js`、`components/AddAppPickerCard.js`、`components/categoryFilterSelect.js`、`styles/addAppsDialog.module.scss`、`styles/categoryFilterSelect.module.scss`；复用 `utils/fetchCategoryApps.js`、`utils/categoryMeta.js`、`components/appListCounts.js`。
- 规范：`apps-list-pagination` 中涉及 Add Apps 弹窗 pagination 的场景改为追加加载；`/apps` 与 `Search.js` 预览限额不在本 change。
- API：不新增接口。分类用 `GET /apps` 与 `GET /apps/categories/:id`；搜索仍 `GET /apps/search`；`publisher:` 仍 `GET /publishers/:id`。
