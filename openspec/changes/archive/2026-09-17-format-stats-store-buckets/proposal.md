## Why

App 与 Pack 的互动计数已是精确整数，现有 `formatCount` 只做 `K`、百万会变成 `1500K`。同时详情 views / installs 仍被 `WINSTALL_SHOW_VIEWS_INSTALLS` 挡住，后续不再需要这个开关。现在补上 `M`/`B`、保留一位小数且不加 `+`，并让 stats 在读成功时始终可见。

## What Changes

- 所有已走 `formatCount` 的 views / downloads / likes（含 App/Pack 详情 stats、Like 数字、货架终身三项、周榜窗口三项、首页 carousel）改为紧凑单位：`K` / `M` / `B`，一位小数，整数去掉 `.0`，**不加 `+`**。
- 小于 1000 仍显示精确整数（含 `0`）。`12400` → `12.4K`，`1500000` → `1.5M`，`1000` → `1K`。
- `AddAppPickerCard` 去掉重复的 `formatLikeCount`，与同一套规则对齐。
- 删除 `WINSTALL_SHOW_VIEWS_INSTALLS` 及其 meta / `isShowViewsInstalls`；详情在 stats 读成功时 MUST 显示 views 与 downloads，无法再用环境变量关掉。
- 不改 API 字段与 track；分页「of N apps」等目录总数不在范围。
- 不要求 `title` 精确值 tooltip。

## Capabilities

### New Capabilities

- `engagement-count-format`: 规定互动计数在 UI 上的紧凑展示（何时原样、何时带一位小数的 `K`/`M`/`B`），并约束所有已展示这些数字的表面共用同一规则。

### Modified Capabilities

- `detail-engagement`: 详情终身 views / downloads 与 Like 计数改用紧凑单位；stats 读成功时不再被环境开关隐藏。
- `home-trending`: 周榜卡与首页 carousel 上的窗口 likes / downloads / views 使用同一套紧凑格式。

## Impact

- 前端：`utils/engagementStats.js` 的 `formatCount`、`test/engagementApi.test.js`、`components/AddAppPickerCard.js`。
- 删除开关：`utils/runtimeConfig.js` 的 `isShowViewsInstalls` / `SHOW_VIEWS_INSTALLS_META`（若 `parseOnOffEnv` 无其他调用方则一并删除）、`pages/_document.js` 对应 meta、`AppDetailView` 与 Pack 详情上的条件渲染；相关测试。
- 调用方无需改数据源：`AppDetailView`、`pages/packs/[id].js`、`LikeButton`、`appListCounts`、`trendingCounts`、`homeCarousel` 已消费 `formatCount`。
- API、stats 接口、列表 payload 字段名不变。
