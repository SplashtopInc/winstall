## Why

`/packs` 的 Public 列表仍用 Prev/Next 整页替换，卡片固定高度、中间塞一排 app 图标，扫描路径乱、和分类页的逛货架节奏不一致。现在只把公共列表改成 Load more，并把列表卡收成 Hub 式轻卡。

## What Changes

- Public Packs 用 Load more 追加（`GET /packs` 的 `offset`/`limit`/`total`），每批仍 24。去掉 Prev/Next、顶栏小翻页、左右键翻页。
- 公共搜索仍为页内状态：满 3 字符才把 `q` 发给 `GET /packs`；换搜索从 offset 0 重载。MUST NOT 把 `q`/`page`/`tab` 写成列表来源；继续忽略或剥除地址栏里的 `q`/`page`。
- `PackCard` 改为 Hub 轻卡：左上 pack/stack 身份、标题、次行应用数、最多两行描述（无则不占位）；描述下展示最多 6 个 app 图标预览（有溢出则 `+N`）；footer 为相对时间 + 终身 views/downloads/likes 三连（同一行小灰 meta）。高度随内容。My 用文字可见性徽章；Public 不展示可见性。列表已有作者展示名时才显示，不额外请求用户目录。
- **不改** 默认 My tab、登录回跳 URL、页头大标题、Pack 详情、首页 trending 卡、Add Apps 弹窗。不为 My Packs 做分页。不新增 API。

## Capabilities

### New Capabilities

- `pack-list-browse`：`/packs` Public 的 Load more 浏览，以及列表 `PackCard` 的轻卡信息结构。

### Modified Capabilities

- （无）`pack-api-client` 的请求路径不变；`category-browse` 与 `/apps` 翻页不变。

## Impact

- 前端：`pages/packs/index.js`、`components/PackCard.js`、`components/PublicPacksList.js`、`components/PublicPacksSearch.js`、`styles/packsIndex.module.scss`。
- API：仍 `GET /packs`（`offset`、`limit`、`q`）与 `GET /packs/me`。
- 无 URL breaking：默认仍 My；Public 搜索与分页不进地址栏。
