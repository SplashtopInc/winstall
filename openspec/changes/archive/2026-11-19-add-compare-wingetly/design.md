## Context

见 proposal.md 的 Why。现状：`pages/compare.js` 用 `COMPARISON_CARDS` 驱动三张入口卡；三份详情页各自内联一份 `CompareTabs`（Ninite / UniGetUI / Chocolatey）；样式为三列横排（`styles/compare.module.scss`）与勾/叉双态单元格（`styles/compareDetail.module.scss`）。发现性依赖 `pages/sitemap-static.xml.js`、`public/llms.txt` 与 `openspec/specs/llms-txt`。Wingetly 与 winstall 同属「浏览器内 winget 目录 + 命令 + pack」，对方站点已公开把 winstall 列入对比。

## Goals / Non-Goals

**Goals:**

- 用与既有三页相同的页面骨架落地 `/compare-wingetly`，并接到入口与 tab。
- 把 tab 列表抽成单一来源，避免四处漏改。
- 入口四卡在桌面可读；对照表能表达「两边都有」。
- 同步 sitemap 与 llms 导览。

**Non-Goals:**

- 不重写 Ninite / UniGetUI / Chocolatey 的正文与英雄区示意。
- 不新增 API、账户或服务端对比数据。
- 不改公开 URL 硬约束路径（`/apps`、`/packs` 等）。
- 不在对照中争包数量或刷新频率。

## Decisions

### 1. 路径与命名

**选择：** 详情页路由 `/compare-wingetly`，文件 `pages/compare-wingetly.js`，与现有 `compare-<slug>` 一致。

**备选：** `/compare/wingetly` 嵌套路由——拒绝，会打破现有扁平约定与 sitemap / llms 列表形态。

### 2. 入口卡片顺序与布局

**选择：** Wingetly 卡片排在 `COMPARISON_CARDS` 第一位（同类替代优先）。桌面入口由三列改为最多两列的网格（两行两列），窄屏继续单列。

**备选：** 追加在 Chocolatey 之后、维持三列挤四卡——拒绝，卡片过窄且同类对照被淹没。

**文案：** `/compare` 的 MetaTags `desc`、英雄区副文与底部 CTA 中「alternatives」列举同步加入 Wingetly。

### 3. 共用 CompareTabs

**选择：** 抽出共用组件（例如 `components/compareTabs.js`），四份详情页只传 `active`。tab 顺序与入口卡一致：Wingetly → Ninite → UniGetUI → Chocolatey。

**备选：** 继续四处复制数组——拒绝，本次必漏改。

### 4. 对照表单元格第三态

**选择：** 在 Wingetly 详情表（必要时扩展共用单元格）增加中性态：无中性图标或无文案表达「两边都有 / 程度不同」，禁止对共有能力使用 negative 叉。仅在开源、公开 Pack 可发现性、Express/分类上手等真实差异上使用正/负对比。

**备选：** 沿用全表勾对叉——拒绝，与事实不符，且易被对方对照页反证。

### 5. 英雄区示意

**选择：** 左侧展示一句自然语言搜索（例如 “a quiet music player”），右侧展示关键词加字段过滤（例如 `tags:music player`）；中间保留 VS。突出搜索方式的差异。

**备选：** 用公开 Pack 路径对照浏览器本地列表——已放弃，搜索才是这页要先让人看见的差异。复制 Ninite 页的命令 vs 勾选清单——拒绝，双方都出命令，信息量为零。

### 6. 文案立场

**选择：** 英文营销句式与现页一致（如 “Best Wingetly Alternative - Winstall.app”）。正文只写 winstall 的优势与可核对的差异。FAQ 与对照表 MUST NOT 罗列 Wingetly 的长处（例如静默安装说明、CVE 列表）。不编造我方没有的能力，也不把对方优点写成我们的对比内容。

**备选：** 全盘否定对方——拒绝。

### 7. 发现性联动

**选择：** `sitemap-static.xml.js` 数组追加 `compare-wingetly`；`public/llms.txt` Comparisons 段增加一条并改总述；`test/llmsTxt.test.js` 期望 URL 同步。详情页继续 `getDocumentShellStaticProps`，与既有 compare 页一致。

## Risks / Trade-offs

- [同类对照易被指责不公] → 对照表第三态 + 明确不争包数量；可核对的开源与 Pack 路径为主轴。
- [四 tab 在窄屏拥挤] → 既有 `flex-wrap` 可折行；顺序固定，不引入下拉。
- [对方产品演进导致文案过期] → 只写品类级差异，避免绑定具体 CVE 条数或小时级刷新承诺。
- [抽出 CompareTabs 触碰三页] → 改动面小且机械；任务中单独验收四处 tab 一致。

## Migration Plan

- 纯前端静态页，可随常规发布上线；无入口卡与 sitemap / llms 同发，避免死链。
- 回滚：移除新页文件与入口 / tab / sitemap / llms 中的引用即可。

## Open Questions

无。卡片首位与两列布局已在探索中选定，实现阶段按本设计执行。
