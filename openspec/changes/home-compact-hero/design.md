## Context

见 `proposal.md` 的 Why。现状：`pages/index.js` 用 `styles/home.module.scss` 的 `.intro` + `.illu-box` 渲染大标题、副文、包总量与 `/assets/logo.svg`；`HomeCarousel` 紧随其后。顶栏 `components/Nav.js` 搜索 trigger 文案写死为 `Search apps...`。首页已通过 ISR / 客户端再取拿到 `appsTotal`。`.demo/home-compact-hero.html` 为对照布局。

约束见仓库根目录 `AGENTS.md` 与 `openspec/config.yaml`。相关行为见同变更下 `specs/home-compact-hero/spec.md` 与对 `home-trending` 的 delta。

## Goals / Non-Goals

**Goals:**

- 去掉首页可见 intro，轮播上移。
- 用已有 `appsTotal` 驱动顶栏搜索 hint，不新增为 hint 单独请求。
- 保留视觉隐藏 `h1` 与现有 Meta title。

**Non-Goals:**

- 不改轮播内容、广告池、周榜板块。
- 不改搜索对话框内部 placeholder。
- 不重做导航结构或全局搜索交互。

## Decisions

### 1. 轻量 Context 把 `appsTotal` 交给 Nav

在 `_app` 挂 `AppsTotalContext`（或等价 lowerCamelCase 模块，如 `ctx/appsTotalContext.js`）。首页在拿到 `appsTotal` 后写入；离开首页或卸载时清为 `0` / `null`，避免脏数据。Nav 订阅后格式化 hint。

**备选：** 仅首页再放一条大搜索框。否决：与顶栏重复，且用户已确认把总量放进现有顶栏 hint。  
**备选：** Nav 自己再请求 `/apps`。否决：重复流量，且首页已有总数。

### 2. 总量格式与现首页一致后改写 hint

继续 `Math.floor(appsTotal / 50) * 50`，再用 `toLocaleString("en-US")` 出千分位，拼 `Search ${n}+ apps`。总量缺失或 `≤ 0` 时用 `Search apps...`。抽小 helper（如 `utils/appsSearchHint.js` 的 `formatAppsSearchHint`）便于单测或复用。

### 3. 视觉隐藏 h1，删掉插画与可见文案

首页保留 `<h1 className={...}>Browse the winget repository.</h1>`（或同义文案）并用既有 / 新增的 sr-only 样式隐藏。加载态同样不渲染 `.intro` 英雄区，可只保留 Meta + 隐藏 h1 或极简 loading，避免 intro 闪现。

### 4. 不改 homeCarousel

轮播仍按 `home-trending`；本变更只腾出上方空间。

## Risks / Trade-offs

- [生客少了 slogan] → 顶栏品牌 + 搜索规模 + 轮播承接；Meta / 隐藏 h1 保留 SEO。
- [Context 未清导致他页仍显示总量] → 首页 effect cleanup 清零；或仅在 provider 持有「最近一次成功总数」并接受全站显示（规格允许全站 hint）——本设计选择**保留最近一次成功总量**更稳：首页写过一次后全站都有规模感，无需每页再取。若从未进过首页则为默认 hint。
- [窄屏搜索 trigger 截断长 hint] → 保持现有 `white-space: nowrap`；必要时 CSS `text-overflow: ellipsis`（Nav 已有窄屏缩成图标的行为可保留）。

## Migration Plan

只发 Web。回滚：恢复 intro 与写死 hint。无数据迁移。

## Open Questions

无。
