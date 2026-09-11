## 1. 读取终身字段

- [x] 1.1 新增 `utils/appListCounts.js`，导出 `readAppListCounts`：只映射 `viewCount` / `downloadCount` / `likeCount`，缺省为 0，不回退窗口 `views` / `downloads` / `likes`
- [x] 1.2 为该 helper 补单测（有数字、缺字段、字符串、窗口字段不得误读）

## 2. 计数行与 SingleApp

- [x] 2.1 新增 `components/appListCounts.js` 与 `styles/appListCounts.module.scss`：只读一行，顺序 views → downloads → likes，0 也显示，`aria-label` 不含 this week，数字用 `formatCount`
- [x] 2.2 在 `components/SingleApp.js` 把计数行插到 `Description` 之后、`metaData` 之前；`pack` 与 `large` 同样渲染；不调用 stats、不加 Like

## 3. 核对各表面

- [x] 3.1 在 `/category` 与 `/apps`（含搜索或发行商）确认货架卡显示终身三项，且无 `GET /apps/:id/stats`
- [x] 3.2 确认首页 Trending Apps / Packs 仍用窗口 `views` / `downloads` / `likes`，文案未改成货架终身数
- [x] 3.3 确认 Pack 编辑列表的 `SingleApp` 在快照无字段时显示 0 0 0，且未改 `PackDetailAppCard`
