## 1. 格式化

- [x] 1.1 在 `utils/engagementStats.js` 把 `formatCount` 改为千以下原样，千以上一位小数的 `K`/`M`/`B`（去 `.0`、系数 1000 升档、无 `+`）
- [x] 1.2 更新 `test/engagementApi.test.js`：覆盖整数、`1K`/`12.4K`/`1.5M`/`1B`、升档与 `null`

## 2. 去掉 views/installs 开关

- [x] 2.1 从 `utils/runtimeConfig.js` 删除 `isShowViewsInstalls` 与 `SHOW_VIEWS_INSTALLS_META`；无其他调用方时删除 `parseOnOffEnv` 及其测试
- [x] 2.2 从 `pages/_document.js` 去掉 `winstall-show-views-installs` meta
- [x] 2.3 在 `components/AppDetailView.js` 与 `pages/packs/[id].js` 于 stats 成功时始终渲染 views / downloads，不再调用 `isShowViewsInstalls`

## 3. 去重与核对

- [x] 3.1 让 `components/AddAppPickerCard.js` 使用 `formatCount`，删除本地 `formatLikeCount`
- [x] 3.2 抽查详情、Like、货架、周榜与 carousel 共用 `formatCount`；分页总数未改；仓库中无 `WINSTALL_SHOW_VIEWS_INSTALLS` 引用
