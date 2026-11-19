# compare-pages Specification

## Purpose

定义 Compare 入口与竞品详情页的公开路径、入口卡片与跨页导航，并规定 winstall 相对 Wingetly 的对照须突出真实差异、不得把双方共有能力写成对方短板。

## Requirements

### Requirement: Compare 入口列出含 Wingetly 在内的对照卡片

`/compare` MUST 为每位已收录竞品展示一张可点进详情页的卡片。卡片集合 MUST 至少包含 Ninite、UniGetUI、Chocolatey 与 Wingetly。Wingetly 卡片 MUST 链到 `/compare-wingetly`。入口页的标题区或 meta 描述 MUST 提及 Wingetly，不得只写前三家。

#### Scenario: 从入口进入 Wingetly 对照

- **WHEN** 访客打开 `/compare`
- **THEN** 页面出现指向 `/compare-wingetly` 的 Wingetly 卡片，且入口说明文字包含 Wingetly

### Requirement: 提供 winstall 与 Wingetly 对照详情页

系统 MUST 在 `/compare-wingetly` 提供静态可读的对照详情页。该页 MUST 包含功能对照表、FAQ 与回到产品主流程的行动号召。对照表 MUST 覆盖 AI 自然语言搜索、收藏、创建并分享 Pack、开源与否，以及 Express 或分类等上手路径。对照表中的搜索行 MUST 写明 winstall 支持用自然语言描述需求并由 AI 理解意图找应用，Wingetly 为传统关键词加字段过滤。对照表 MUST NOT 把免费、浏览器内使用、生成 winget 安装命令等共有能力列为对比行。页面 MUST NOT 以易过期的包数量或目录刷新频率作为胜负依据。

#### Scenario: 打开 Wingetly 详情页

- **WHEN** 访客打开 `/compare-wingetly`
- **THEN** 页面展示含 AI 自然语言搜索、收藏、创建并分享 Pack 的对照表，以及 FAQ 与行动号召

#### Scenario: 共有能力不进对照表

- **WHEN** 阅读 `/compare-wingetly` 的功能对照表
- **THEN** 表中没有免费、浏览器内使用或生成 winget 命令这类共有能力行

### Requirement: 竞品详情页共享含 Wingetly 的 tab 导航

`/compare-ninite`、`/compare-unigetui`、`/compare-chocolatey` 与 `/compare-wingetly` MUST 提供同一组 tab，且该组 MUST 包含链到 `/compare-wingetly` 的「vs Wingetly」项。当前页对应的 tab MUST 呈现为选中态。

#### Scenario: 从 Ninite 页切到 Wingetly

- **WHEN** 访客在 `/compare-ninite` 点击「vs Wingetly」tab
- **THEN** 导航到 `/compare-wingetly`

### Requirement: 静态 sitemap 收录 Wingetly 对照页

静态 sitemap MUST 包含 `compare-wingetly` 路径，与既有 compare 子页同一收录方式。

#### Scenario: 爬虫发现新对照页

- **WHEN** 读取静态 sitemap
- **THEN** 其中包含 `compare-wingetly` 对应的公开 URL
