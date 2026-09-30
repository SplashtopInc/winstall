## Why

浏览、下载、点赞这些统计数字现在在货架、周榜、详情和加应用弹窗上默认都画出来。产品希望默认藏起来，只在部署配置打开时才展示，避免改代码或重新构建才能切换。

## What Changes

- 新增运行时开关 `WINSTALL_SHOW_STATS`，写入 `.env`。未设置、空、`0`、`false` 视为关；`1` 或 `true` 视为开。默认关。
- 开关关闭时，网站 MUST NOT 展示 App / Pack 的浏览、下载、点赞数字（含 `0`）。详情页因此也不请求对应的 stats 接口。Like 按钮仍在，且仍不显示点赞数。
- 开关打开时，各表面恢复当前展示规则：货架与 Pack 列表展示终身三项；Trending Apps 仍只展示大于或等于 `100` 的项；首页 Featured Packs 仍不展示计数。数字格式仍遵循 `engagement-count-format`。
- **BREAKING**：`detail-engagement` 不再要求详情计数始终展示，也不再禁止用客户端开关隐藏它们。

## Capabilities

### New Capabilities

- `stats-display-gate`: 用运行时环境变量决定是否展示互动计数，并把该开关交给浏览器，且不依赖构建期公开变量。

### Modified Capabilities

- `detail-engagement`: App / Pack 详情的浏览与下载计数仅在开关打开且 stats 读取成功时展示；关闭时不请求 stats。
- `app-card-engagement`: `SingleApp` 与 Trending Apps 的终身计数仅在开关打开时按原规则展示。
- `pack-card-engagement`: `/packs` 上 `PackCard` 的终身计数仅在开关打开时展示；Featured Packs 仍不展示。
- `home-trending`: 首页 Trending Apps 计数与轮播上的同一套计数受开关约束；Featured Packs 仍不展示计数。
- `pack-add-apps`: Add Apps 弹窗选择卡上的终身三项仅在开关打开时展示。
- `pack-list-browse`: Pack 列表卡片 footer 上的终身 views、downloads、likes 仅在开关打开时展示。

## Impact

- 配置：`.env` 增加 `WINSTALL_SHOW_STATS`。容器运行时注入即可，不必为改开关重新构建。
- 代码：`pages/_document.js` 把开关写入文档 meta；货架 `AppListCounts`、周榜 `TrendingCounts`、`PackCard`、Add Apps 选择卡、App 详情与 Pack 详情的计数行读取该开关。
- 规范：上述已有能力的「必须展示计数」改为受开关控制。Like、安装、列表数据请求不在此列。
