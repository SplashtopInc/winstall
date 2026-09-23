## 1. 分类网格插入广告

- [x] 1.1 在 `pages/category.js` 增加 `SHELF_AD_INTERVAL`（值为 15），并用 `useRandomAd("apps-list")` 决定是否插入广告格
- [x] 1.2 在已展示应用网格中，于 `index % SHELF_AD_INTERVAL === 0` 的应用外层 `<li>` 之后渲染广告 `<li>`，格内用 `DonateCard`（`addMargin=""`，`placement="apps-list"`）；无广告、骨架、空态、错误态不占格

## 2. 广告格样式

- [x] 2.1 在 `styles/categoryPage.module.scss` 让广告格与应用格同为网格项并拉满单元格，不横跨整行

## 3. 核对货架节奏

- [x] 3.1 确认满批 56 个应用时广告跟在第 1、16、31、46 个应用之后共 60 格；Load more 按下标续插；换分类后第一张广告跟在新列表第 1 个应用之后
