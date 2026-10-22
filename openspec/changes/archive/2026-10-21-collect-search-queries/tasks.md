## 1. 一次性标记

- [x] 1.1 新增 `utils/searchQueryRecord.js`：目标路径与当前路径不同时写入 `winstall.pendingSearchRecord`，值为 trim 后的词和 30 秒后的 `expiresAt`；同一路径不写。读取时删除该键，仅未过期且与页面 `q` 一致时返回需要记录
- [x] 1.2 在同文件提供纯函数，供 `recordSearch: true` 生成 `X-Search-Record: 1`；session API JWT 未过期时再加 `Authorization: Bearer`，过期或缺失则省略
- [x] 1.3 在 `test/searchQueryRecord.test.js` 覆盖：不同路径才写入、同一路径不写入、匹配且未过期只消费一次、过期或不匹配的 `q` 不记录且键已删除、头与 JWT 的三种情况

## 2. 只给那一次结果请求带头

- [x] 2.1 `utils/fetchWinstallAPI.js` 识别 `recordSearch: true`，用上一节的纯函数设置头，且不把该选项放进 URL。不因此对 `/apps/search` 做 401 重试，也不让其它搜索附带 JWT
- [x] 2.2 `components/SearchDialog.js` 在无高亮建议的回车和 “View all results” 上，于跳转前按路径差异写入标记。高亮建议仍进入应用详情。建议请求与本地 Recent 保持原样
- [x] 2.3 `pages/apps.js` 在任何 await 之前同步消费标记。仅第一页且解析为 search 时把 `recordSearch: true` 传给该次请求。Load more 与 `publisher:` 不传；`publisher:` 仍会清掉匹配标记

## 3. 其它搜索保持无头

- [x] 3.1 确认 `utils/parsePublisherQuery.js` 的 `appsListPath`、`components/AddAppsDialog.js`、`components/Search.js` 的预览搜索不传 `recordSearch`，查询参数形状不变
