## 1. 共用导航与样式

- [x] 1.1 抽出 `components/compareTabs.js`，tab 顺序为 Wingetly → Ninite → UniGetUI → Chocolatey，接收 `active` 路径
- [x] 1.2 在 `pages/compare-ninite.js`、`pages/compare-unigetui.js`、`pages/compare-chocolatey.js` 改用共用组件并删除内联 tabs
- [x] 1.3 在 `styles/compareDetail.module.scss`（及单元格组件）支持对照表中性态，供共有能力行使用

## 2. 入口页

- [x] 2.1 在 `pages/compare.js` 的 `COMPARISON_CARDS` 首位加入 Wingetly（链到 `/compare-wingetly`），并更新 meta、英雄区与 CTA 文案以包含 Wingetly
- [x] 2.2 调整 `styles/compare.module.scss` 的 `cardsGrid` 为桌面最多两列、窄屏单列

## 3. Wingetly 详情页

- [x] 3.1 新增 `pages/compare-wingetly.js`：hero（含共用 tabs）、公开 Pack 示意 vs 本地列表、功能对照表、FAQ、CTA，使用 `getDocumentShellStaticProps`
- [x] 3.2 对照表覆盖开源、公开 Pack、上手路径；共有能力用中性态；不以包数量或刷新频率定胜负

## 4. 发现性与导览

- [x] 4.1 在 `pages/sitemap-static.xml.js` 加入 `compare-wingetly`
- [x] 4.2 更新 `public/llms.txt`：Comparisons 总述纳入 Wingetly，并增加 `/compare-wingetly` 链接与英文说明
- [x] 4.3 更新 `test/llmsTxt.test.js` 期望 URL 列表以包含 `https://winstall.app/compare-wingetly`
