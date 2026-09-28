## 1. PackCard 计数行

- [x] 1.1 在 `components/PackCard.js` 用 `readAppListCounts(pack)` 读终身三项，在 `iconRow` 与 `packFooter` 之间插入 `AppListCounts`（`compact` / `inline`），`aria-label` 不含 this week；不调用 `GET /packs/:id/stats`、不加 Like
- [x] 1.2 按需微调 `styles/packsIndex.module.scss`：计数行贴底栏、描述仍 `flex: 1`，卡片高度不必抬到 250px 以上

## 2. 核对各表面

- [x] 2.1 在 `/packs` Explore 与 Mine 确认 `PackCard` 显示 views → downloads → likes，缺字段为 0，且无 `GET /packs/:id/stats`
- [x] 2.2 确认首页 Featured Packs 读 `viewCount` / `downloadCount` / `likeCount`，不读短名 `views` / `downloads` / `likes`
