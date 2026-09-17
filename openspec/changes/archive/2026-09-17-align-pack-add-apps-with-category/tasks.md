## 1. Picker 卡皮对齐

- [x] 1.1 改 `components/AddAppPickerCard.js`：身份区为图标瓷片、名称、发行商；描述最多两行；用 `components/appListCounts.js` 展示终身三项；去掉 version / updated / 单独 likes 的 meta 列
- [x] 1.2 保持整卡 `onToggle`、`alreadyAdded` 禁选与 Added 标记；不引入 `SelectedContext`、checkbox 或进详情 Link
- [x] 1.3 更新 `styles/addAppsDialog.module.scss` 中 picker 卡样式，对齐 compact `SingleApp` 密度

## 2. 弹窗分类浏览与 Load more

- [x] 2.1 在 `components/AddAppsDialog.js` 工具行左搜索、右 `categoryFilterSelect`；slug 与 `CATEGORY_SLUGS` 一致；打开默认 `all`，关闭后状态丢弃
- [x] 2.2 无已提交查询时用 `fetchCategoryApps`（`limit` 56）拉首屏；Load more 追加；换分类重置列表不清本地选中
- [x] 2.3 去掉 Pagination、左右键翻页、「Showing page x」计数条；网格改为四列并拉满单元格

## 3. 搜索覆盖层

- [x] 3.1 已提交关键词走现有 `GET /apps/search` 路径并 Load more 追加，不把当前分类当过滤
- [x] 3.2 `publisher:` 走现有 publishers 信封并 Load more 追加
- [x] 3.3 搜索生效时分类下拉显示 All；从下拉选择则清空搜索并加载该类；清空搜索框回到清空前的 `activeSlug`

## 4. 加入 pack 回归

- [x] 4.1 确认底部选择条、清空、Add to Pack、Already added 行为与改前一致
