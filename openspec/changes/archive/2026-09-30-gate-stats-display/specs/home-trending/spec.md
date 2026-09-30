## MODIFIED Requirements

### Requirement: 周榜卡片展示终身互动计数

当统计展示开关打开时，已渲染的 Trending Apps 卡 MUST 从该条目周榜 payload 读取终身 `viewCount`、`downloadCount`、`likeCount`。MUST NOT 用短名 `views`、`downloads`、`likes` 替代这三项。对每一项，仅当精确数值大于或等于 `100` 时 MUST 展示该指标；小于 `100`、缺省、非数字或缺失 MUST NOT 展示该指标（含 `0`）。三项皆不足阈值时，该卡 MUST NOT 渲染计数行。开关关闭时，该卡 MUST NOT 渲染计数行。凡展示出的数字 MUST 遵循 `engagement-count-format` 的紧凑单位（小于 1000 为精确整数，大于或等于 1000 为一位小数的 `K` / `M` / `B`，不加 `+`）。已渲染的 Featured Packs 卡片 MUST NOT 展示上述三项计数或计数行，且不因开关打开而展示。首页顶部轮播若展示同一套计数，MUST 使用同一格式、同一阈值，且同样受该开关约束。

#### Scenario: 周榜条目展示 like、download、view

- **WHEN** 统计展示开关打开，且用户看到已渲染的 Trending Apps，且某条目的 `viewCount`、`downloadCount`、`likeCount` 均大于或等于 `100`
- **THEN** 该条 MUST 可见这三项数字，且 MUST NOT 使用短名 `views`、`downloads`、`likes`

#### Scenario: Trending Apps 低于阈值不展示单项

- **WHEN** 统计展示开关打开，且用户看到已渲染的 Trending Apps，且某条目 `viewCount` 为 `240`、`downloadCount` 为 `80`、`likeCount` 为 `0`
- **THEN** 该条 MUST 展示 views 为 `240`，MUST NOT 展示 downloads 或 likes

#### Scenario: Trending Apps 三项皆低于阈值则无计数行

- **WHEN** 用户看到已渲染的 Trending Apps，且某条目三项终身计数均小于 `100`
- **THEN** 该卡 MUST NOT 渲染计数行

#### Scenario: Featured Packs 不展示互动计数

- **WHEN** 用户看到已渲染的 Featured Packs
- **THEN** 每张卡 MUST NOT 展示 `viewCount`、`downloadCount`、`likeCount` 或等价计数行

#### Scenario: 开关关闭时周榜不展示计数

- **WHEN** 统计展示开关关闭，且用户看到已渲染的 Trending Apps
- **THEN** 每张卡 MUST NOT 渲染计数行
