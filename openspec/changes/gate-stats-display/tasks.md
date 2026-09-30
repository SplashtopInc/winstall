## 1. 运行时开关

- [x] 1.1 在 `utils/statsDisplay.js` 解析 `WINSTALL_SHOW_STATS`：`1` 与 `true` 为开，其余为关
- [x] 1.2 在 `pages/_document.js` 写入 meta `winstall-show-stats`，值为 `1` 或 `0`；不使用 `NEXT_PUBLIC_*`
- [x] 1.3 浏览器 helper 只读该 meta；在 `.env.example` 注释默认关的 `WINSTALL_SHOW_STATS=0`

## 2. 列表与周榜

- [x] 2.1 `components/appListCounts.js` 在开关关闭时不渲染计数行
- [x] 2.2 `components/trendingCounts.js` 在开关关闭时不渲染计数行；打开时仍只展示大于或等于 `100` 的项
- [x] 2.3 `components/PackCard.js` 在开关关闭时 footer 只留相对更新时间
- [x] 2.4 确认 `components/AddAppPickerCard.js` 经 `AppListCounts` 在关闭时不展示三项；Featured Packs 仍不展示计数

## 3. 详情

- [x] 3.1 `hooks/useResourceEngagement.js` 在开关关闭时不请求 app / pack stats；`loadLike` 保持不变
- [x] 3.2 `components/AppDetailView.js` 与 `pages/packs/[id].js` 在开关关闭时不渲染浏览与下载文案，Like 按钮仍在

## 4. 测试

- [x] 4.1 为开关解析补测试：未设置、`0`、`false`、`1`、`true` 与其它值
- [x] 4.2 确认周榜阈值测试在开关打开的前提下仍通过
