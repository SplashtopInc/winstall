## Context

见 archived change `add-compare-wingetly` 的 proposal Why。Compare 入口与详情页为静态营销页；Wingetly 与 winstall 同属浏览器内 winget 目录，对照须突出可核对差异，不把共有能力写成对方短板。

## Goals / Non-Goals

**Goals:**

- `/compare-wingetly` 与既有三页同一骨架，并接到入口与 tab。
- tab 列表单一来源。
- 入口四卡桌面两列可读；搜索示意与 AI 搜索优势一致。
- 同步 sitemap 与 llms 导览。

**Non-Goals:**

- 不重写 Ninite / UniGetUI / Chocolatey 正文。
- 不新增 API 或服务端对比数据。
- 不改公开 URL 硬约束路径。
- 不在对照中争包数量或刷新频率。
- FAQ 与对照表不罗列 Wingetly 长处。

## Decisions

### 1. 路径与命名

详情页 `/compare-wingetly`，文件 `pages/compare-wingetly.js`，与现有 `compare-<slug>` 一致。

### 2. 入口卡片顺序与布局

Wingetly 卡片排在 `COMPARISON_CARDS` 第一位。桌面最多两列网格，窄屏单列。入口 meta 与文案纳入 Wingetly。

### 3. 共用 CompareTabs

`components/compareTabs.js`，顺序 Wingetly → Ninite → UniGetUI → Chocolatey。

### 4. 对照表立场

只写 winstall 优势行（AI 搜索、收藏、创建/分享 Pack、上手、开源）。共有能力不进对照表。

### 5. 英雄区示意

自然语言搜索句对照关键词/字段过滤，突出搜索方式差异。

### 6. 发现性联动

`sitemap-static.xml.js`、`public/llms.txt`、`test/llmsTxt.test.js` 收录 `/compare-wingetly`。详情页用 `getDocumentShellStaticProps`。

## Risks / Trade-offs

- [同类对照易被指责不公] → 只写可核对差异；不争包数量。
- [四 tab 窄屏拥挤] → `flex-wrap` 折行。
