## Why

主导航 Apps 已指向 `/category`，分类货架里没有广告。旧 `/apps` 目录仍按每 15 个应用插一张 `DonateCard`，但不再是用户逛应用的主入口，分类页这一侧的广告位等于空了。

## What Changes

- 在 `/category` 应用网格中，按与 `pages/apps.js` 相同的节奏插入广告：当前已展示列表里，应用下标 `index % 15 === 0` 时，在该应用卡片之后放一张单格广告。
- 广告复用现有 `DonateCard`、`data/ads.json` 与 session 粘性挑选；`placement` 为 `apps-list`。
- 一批 56 个应用因此插入 4 张广告，网格共 60 格，四列下为 15 整行。Load more 追加后下标继续沿用同一规则。
- 没有启用广告时不占位。骨架、空态、错误态不插入广告。
- 不改首页轮播、`/apps` 目录、Pack 列表、App 详情，也不改广告池。

## Capabilities

### New Capabilities

### Modified Capabilities

- `category-browse`: 分类应用网格按旧目录节奏插入 `apps-list` 广告卡。

## Impact

- `pages/category.js`：在分类网格里于对应应用之后渲染 `DonateCard`。
- `styles/categoryPage.module.scss`：广告作为网格一格，与 `SingleApp` 同占一列并拉满单元格。
- 无新 API、无新广告数据；`utm_content` 与 `/apps` 目录同为 `apps-list-a`。
