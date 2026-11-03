## 1. 徽章字符串

- [x] 1.1 在 `test/packBadgeMarkdown.test.js` 增加 `https://winstall.app/apps/Git.Git` 样例，期望为 `[![Open in winstall](https://winstall.app/badge.svg)](https://winstall.app/apps/Git.Git)`。不改 `utils/packBadgeMarkdown.js`

## 2. 分享菜单

- [x] 2.1 在 `components/AppDetailView.js` 于 Copy link 下方增加 Copy Markdown Badge，图标 `FiCode`，尺寸与菜单内其它图标一致，文案固定为 `Copy Markdown Badge`。点击后先关闭菜单，再把 `buildPackBadgeMarkdown(shareUrl)` 写入剪贴板。成功 toast 为 `Markdown copied`，失败为 `Copy failed`。不新增按钮状态，不改 Copy link 的 `copyStatus`
- [x] 2.2 在 `styles/appDetail.module.scss` 让 `.shareMenu` 贴着分享按钮右缘展开，加宽到能单行放下 `Copy Markdown Badge`，文案不换行
