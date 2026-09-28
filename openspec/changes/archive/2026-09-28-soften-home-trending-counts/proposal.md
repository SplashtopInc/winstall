## Why

首页 Featured Packs 与 Trending Apps 上展示的终身互动数整体偏小，满屏小值与 `0` 会给人「站点冷清」的观感。冷启动阶段应弱化不可信的社会证明，只在数字有说服力时露出。

## What Changes

- Featured Packs（`GET /packs/trending` 首页卡）不再展示 `viewCount` / `downloadCount` / `likeCount` 计数行。
- Trending Apps 卡对三项终身计数按项过滤：数值小于 `100`（含 `0`、缺省）的单项 MUST NOT 展示；仅 `>= 100` 的项按既有紧凑格式显示；三项皆不足时整行不渲染。
- `/packs` 的 `PackCard`、货架 `SingleApp`、App/Pack 详情页的计数展示与 track / stats API **不变**。

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `home-trending`: 周榜互动计数展示规则；Featured Packs 卡组成去掉终身计数
- `pack-card-engagement`: 首页 Featured Packs 不再要求展示终身三项
- `app-card-engagement`: 首页 Trending Apps 改为阈值展示；与 Featured Packs 解耦

## Impact

- 组件：`components/trendingPackCard.js`、`components/trendingCounts.js`（及可能的阈值 helper）、`components/trendingApps.js` 消费方式
- 规格：上述三个 capability 的展示要求
- 不改 winstall-api、analytics track、列表/详情计数行为
