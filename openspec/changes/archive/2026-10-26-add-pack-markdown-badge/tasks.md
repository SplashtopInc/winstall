## 1. 徽章图与 Markdown

- [x] 1.1 按 `design.md` 中的文档，把 SVG 原样写入 `public/badge.svg`
- [x] 1.2 在 `utils/packBadgeMarkdown.js` 实现 `buildPackBadgeMarkdown(shareUrl)`：图片路径为同一源上的 `/badge.svg`，链接为传入的 Pack URL，替代文本为 `Open in winstall`，整行不换行、不含 Pack 名称
- [x] 1.3 在 `test/packBadgeMarkdown.test.js` 锁定 `https://winstall.app/packs/cJL66qrefbvuG1U7_fZ-h` 的样例字符串，以及图片源与链接源相同

## 2. 分享面板

- [x] 2.1 在 `components/PackShareCard.js` 于 Copy link 下方增加 Copy Markdown Badge。空闲文案 `Copy Markdown Badge`，成功 `Markdown copied`，失败 `Copy failed`，使用独立状态，重置时间与 Copy link 相同
- [x] 2.2 未公开时该按钮与另外四个渠道一起禁用，不写入剪贴板。复制内容调用 `buildPackBadgeMarkdown`，传入现有的 `shareUrl`

## 3. 把 Share 移出 More

- [x] 3.1 在 `pages/packs/[id].js` 中，主人操作行顺序为 Install、Add App、点赞、Share、More。Share 使用 `actionButton`、`FiShare2` 和文案 `Share`。`PackShareCard` 锚在 Share 按钮下方
- [x] 3.2 More 菜单只保留 Edit 和 Delete。打开 Share 时关闭 More，打开 More 时关闭分享面板。两套点外部关闭互不连带。非主人仍不渲染 Share 和 More
