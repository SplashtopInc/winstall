## Why

访客在选择 winget 网页目录时会直接对比 winstall 与 Wingetly。现有 `/compare` 只覆盖 Ninite、UniGetUI、Chocolatey 三类「不同品类」替代品，缺少同类产品对照，不利于说明公开 Pack、开源与上手路径上的真实差异。

## What Changes

- 新增对比详情页 `/compare-wingetly`，结构与现有三页一致（hero、功能对照表、FAQ、CTA、详情页 tab）。
- `/compare` 入口增加 Wingetly 卡片；入口区文案与 meta 描述同步纳入第四家。
- 三张既有详情页与新页的 tab 导航统一加入「vs Wingetly」。
- 静态 sitemap、`public/llms.txt` 与 `llms-txt` 规范补上新 URL。
- 对照表对「两边都有」的能力使用中性表述，不把重叠能力写成对方短板。

## Capabilities

### New Capabilities

- `compare-pages`: Compare 入口页与竞品详情页的公开路径、入口卡片、跨页 tab，以及 winstall vs Wingetly 详情页须呈现的对照重点。

### Modified Capabilities

- `llms-txt`: 必选链接清单增加 `https://winstall.app/compare-wingetly`，Comparisons 说明纳入 Wingetly。

## Impact

- 页面：`pages/compare.js`、新建 `pages/compare-wingetly.js`，以及 `pages/compare-ninite.js` / `compare-unigetui.js` / `compare-chocolatey.js` 的 tab。
- 样式：`styles/compare.module.scss`（四卡布局）、`styles/compareDetail.module.scss`（若需第三态单元格）。
- 发现性：`pages/sitemap-static.xml.js`、`public/llms.txt`、`test/llmsTxt.test.js`。
- 规范：新增 `openspec/specs/compare-pages/`（归档后），并更新 `openspec/specs/llms-txt/`。
- 无 API、认证或公开 URL 硬约束路径变更；`/compare-wingetly` 与现有 compare 子路径同级。
