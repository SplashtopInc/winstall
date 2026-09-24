## 1. Like 控件

- [x] 1.1 改 `components/LikeButton.js`：去掉可见 like 数字与 `formatCount`；保留心形与 Like/Unlike `aria-label`；`likeCount` prop 可不渲染
- [x] 1.2 检查 `styles/appDetail.module.scss` 与 `styles/packDetail.module.scss` 的 `.likeBtn`，图标单独时仍居中

## 2. 调用方与验证

- [x] 2.1 确认 `components/AppDetailView.js` 与 `pages/packs/[id].js` 仍只把 LikeButton 用于详情，且页面不再另外渲染 `likeCount`
- [x] 2.2 确认货架 `appListCounts`、周榜 `trendingCounts`、`PackCard` 仍展示 like 数字
- [x] 2.3 在 App 详情与 Pack 详情核对：未登录/已赞/未赞均无 like 数字，views/downloads 仍在，点赞流程不变
