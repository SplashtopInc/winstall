## MODIFIED Requirements

### Requirement: 周榜卡片展示窗口互动计数

已渲染的 Trending Apps 卡与 Trending Packs 卡片 MUST 展示该条目周榜 payload 上的窗口 `likes`、`downloads`、`views`。MUST NOT 用终身 `likeCount` 或 `downloadCount` 替代这三项。缺省值 MUST 按 0 展示。每项可见数字 MUST 遵循 `engagement-count-format` 的紧凑单位（小于 1000 为精确整数，大于或等于 1000 为一位小数的 `K` / `M` / `B`，不加 `+`）。首页顶部轮播若展示同一套窗口计数，MUST 使用同一格式。

#### Scenario: 周榜条目展示 like、download、view
- **WHEN** 用户看到已渲染的 Trending Apps 或 Trending Packs
- **THEN** 每条 MUST 可见该条目的 like、download 与 view 数字
