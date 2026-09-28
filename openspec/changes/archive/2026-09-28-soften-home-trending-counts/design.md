## Context

见 `proposal.md` 的 Why。现状：首页 `trendingApps.js` / `trendingPackCard.js` 都挂 `TrendingCounts`，三项始终渲染（`0` 用 `statZero` 淡化）。货架 `SingleApp`、`/packs` 的 `PackCard`、详情 stats 不在本 change。约束见 `AGENTS.md` 与 `openspec/config.yaml`。

## Goals / Non-Goals

**Goals:**

- Featured Packs 卡去掉计数行。
- Trending Apps 按项阈值（`>= 100`）显示终身三项；全不足则无行。
- 可见数字仍走 `engagement-count-format` / `formatCount`。

**Non-Goals:**

- 改 analytics track、stats API、周榜排序或 bootscore。
- 改货架 `SingleApp`、`PackCard`、详情页计数。
- 造数、seed、展示偏移。

## Decisions

### 1. 阈值常量只作用于首页 Trending Apps 的计数组件

**选择：** 在 `TrendingCounts`（或紧邻的 lowerCamelCase helper，如 `utils/trendingCountVisibility.js`）对单项做 `Number(count) >= 100` 过滤；无可见项时返回 `null` 不渲染 `<ul>`。`trendingApps` 继续传 `readTrendingCounts(app)`。

**备选：** 阈值下沉到 `formatCount` — 否决，会误伤详情/货架。

### 2. Featured Packs 直接不挂计数

**选择：** `trendingPackCard.js` 删除 `TrendingCounts` 引用与相关 import；不传空 counts 伪装。

**备选：** 给 `TrendingCounts` 加 `hidden` prop — 否决，首页 Pack 侧永久不需要该行。

### 3. 按项过滤，保留中点分隔

**选择：** 只渲染达标项；现有 `.inline .stat + .stat::before` 分隔在过滤后仍正确。三项皆藏 → 不渲染整行，避免空 `<ul>`。

**备选：** 「任一项 `<100` 则整行隐藏」— 否决，与「有说服力的数字仍可露」不符。

### 4. 阈值值 `100`（含）

**选择：** `>= 100` 显示。缺省/非数字按不足阈值（与展示 `0` 同等隐藏）。

## Risks / Trade-offs

- [周榜前列多项仍 `<100`，整板几乎无数字] → 可接受；板块仍靠名与勾选存在；阈值日后可调常量。
- [规格曾要求 Featured Packs 必示三项，列表 PackCard 仍示] → delta 已拆开；验收时勿误改 `PackCard.js`。
- [`statZero` 样式闲置] → 可留可删；不影响行为。

## Migration Plan

只发 Web。回滚：恢复两处 `TrendingCounts` 挂载与「始终三项」逻辑。
