## 1. URL 与路径辅助

- [x] 1.1 改 `utils/parsePublisherQuery.js`：`appsPagePath` 不再接受或输出 `page`
- [x] 1.2 更新 `test/parsePublisherQuery.test.js`：去掉 `page=2` 断言，覆盖仅 `q` 的 URL

## 2. `/apps` Load more

- [x] 2.1 `pages/apps.js` 用常量 `PAGE_SIZE` 56；三路列表首屏 `offset=0` 替换，Load more 按已展示条数追加；换 scope 重置
- [x] 2.2 `getStaticProps` 的 `GET /apps` 改为 `limit=56`
- [x] 2.3 去掉 Pagination、顶栏小翻页、左右键监听、`scrollTo` 翻页、Showing 范围文案；有 `total` 时保留 All apps 标题计数
- [x] 2.4 `router` 就绪后剥除地址栏 `page`（及误带的 `offset`），加载不根据旧 `page` 算切片；`q` 仍可保留

## 3. 骨架与样式

- [x] 3.1 空列表加载中用 `components/shelfListSkeleton.js`（`variant="app"`，网格 class 为本页 storeList）；ISR 已有第一批时不闪骨架
- [x] 3.2 在 `styles/apps.module.scss` 增加 Load more 样式（对齐 `styles/categoryPage.module.scss`），删除旧翻页样式

## 4. 回归

- [x] 4.1 确认广告仍按应用下标 `index % 15 === 0` 插入；OpenSearch 与搜索 More / View All 仍进 `/apps?q=` 且不带 `page`
