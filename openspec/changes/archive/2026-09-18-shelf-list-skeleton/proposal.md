## Why

`/category`、`/packs` 与 Add Apps 弹窗的货架首屏仍用一行 `Loading...`，网格高度塌掉再撑开。列表形状已知，该用同结构的轻骨架占位，而不是转圈或新依赖。

## What Changes

- 上述三处**网格为空的首次加载**改为纯 CSS 骨架卡：与真卡同圆角、同背景、同列网格，约两行占位，缓慢透明度脉动。
- Pack 骨架对齐 Hub 轻卡剪影（左方块 + 标题条 + 短 meta）；App 骨架对齐 compact `SingleApp`（左方块 + 两行字）。
- Load more 仍只改按钮态（禁用 / `Loading…`），MUST NOT 清空已展示卡片，MUST NOT 在按钮下方堆骨架。
- MUST NOT 新增 npm 依赖，MUST NOT 把详情页的 `react-loading-skeleton` 扩到货架。
- 不改 `/apps` 目录翻页、首页 Discover、详情页、搜索下拉。

## Capabilities

### New Capabilities

- `shelf-list-skeleton`：货架网格首屏用 CSS 骨架代替纯文字 Loading。

### Modified Capabilities

- （无）`category-browse`、`pack-list-browse`、`pack-add-apps` 的列表契约不变，只补加载呈现。

## Impact

- 前端：`pages/category.js`、`pages/packs/index.js`、`components/PublicPacksList.js`、`components/AddAppsDialog.js`；新增 lowerCamelCase 占位组件（如 `shelfListSkeleton.js`）及少量 SCSS。
- 无 API 与 URL 变化。无 breaking。
