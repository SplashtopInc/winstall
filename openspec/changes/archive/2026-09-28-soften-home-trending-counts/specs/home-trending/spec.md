## MODIFIED Requirements

### Requirement: 周榜卡片展示终身互动计数

已渲染的 Trending Apps 卡 MUST 从该条目周榜 payload 读取终身 `viewCount`、`downloadCount`、`likeCount`。MUST NOT 用短名 `views`、`downloads`、`likes` 替代这三项。对每一项，仅当精确数值大于或等于 `100` 时 MUST 展示该指标；小于 `100`、缺省、非数字或缺失 MUST NOT 展示该指标（含 `0`）。三项皆不足阈值时，该卡 MUST NOT 渲染计数行。凡展示出的数字 MUST 遵循 `engagement-count-format` 的紧凑单位（小于 1000 为精确整数，大于或等于 1000 为一位小数的 `K` / `M` / `B`，不加 `+`）。已渲染的 Featured Packs 卡片 MUST NOT 展示上述三项计数或计数行。首页顶部轮播若展示同一套计数，MUST 使用同一格式与同一阈值规则。

#### Scenario: 周榜条目展示 like、download、view

- **WHEN** 用户看到已渲染的 Trending Apps，且某条目的 `viewCount`、`downloadCount`、`likeCount` 均大于或等于 `100`
- **THEN** 该条 MUST 可见这三项数字，且 MUST NOT 使用短名 `views`、`downloads`、`likes`

#### Scenario: Trending Apps 低于阈值不展示单项

- **WHEN** 用户看到已渲染的 Trending Apps，且某条目 `viewCount` 为 `240`、`downloadCount` 为 `80`、`likeCount` 为 `0`
- **THEN** 该条 MUST 展示 views 为 `240`，MUST NOT 展示 downloads 或 likes

#### Scenario: Trending Apps 三项皆低于阈值则无计数行

- **WHEN** 用户看到已渲染的 Trending Apps，且某条目三项终身计数均小于 `100`
- **THEN** 该卡 MUST NOT 渲染计数行

#### Scenario: Featured Packs 不展示互动计数

- **WHEN** 用户看到已渲染的 Featured Packs
- **THEN** 每张卡 MUST NOT 展示 `viewCount`、`downloadCount`、`likeCount` 或等价计数行

### Requirement: Featured Packs 使用与 App 卡同底的合集卡

Featured Packs MUST 用卡片渲染每条：标题、描述、内含应用列表。整卡背景 MUST 使用与首页 Trending Apps 卡相同的 `var(--card-bg)`，MUST NOT 使用彩色渐变头。板块 MUST 按 API 的 `rank` 顺序展示，最多 8 条。整张卡 MUST 可激活并进入 Pack 详情，MUST NOT 再单独展示 View Pack 文案。卡片 MUST 使用当前 Pack 的 `name` / `description`，MUST NOT 写死 pack id 列表。卡片 MUST NOT 展示 `#N this week`、`this week` 或其它周次名次。卡片 MUST NOT 展示终身 `viewCount`、`downloadCount`、`likeCount` 或计数行。已渲染板块的标题 MUST 为 `Featured Packs`，副标题 MUST 为 `Collections you can install as a set.` MUST NOT 使用 `Trending Packs` 作为板块标题。

#### Scenario: Pack 卡打开详情

- **WHEN** 用户激活一张 Featured Pack 卡
- **THEN** 必须进入该 Pack 的详情页

#### Scenario: Pack 板块不使用精选 id

- **WHEN** Featured Packs 渲染
- **THEN** 合集集合 MUST 来自 `GET /packs/trending` 的 `data`，MUST NOT 来自固定官方 pack id 列表

#### Scenario: Pack 板块展示精选文案

- **WHEN** Pack trending 的 `data` 有条目且板块已渲染
- **THEN** 板块 MUST 展示标题 `Featured Packs` 与副标题 `Collections you can install as a set.`，MUST NOT 展示 `Trending Packs`

#### Scenario: Pack 卡使用 App 卡同底且不展示周次名次

- **WHEN** 用户看到已渲染的 Featured Packs
- **THEN** 每张卡 MUST 含标题，背景 MUST 与 Trending Apps 卡同为 `var(--card-bg)`，MUST NOT 展示彩色渐变头，MUST NOT 展示 `#N this week` 或 `this week`，MUST NOT 展示 View Pack 文案，且 MUST NOT 展示终身互动计数行

#### Scenario: Pack 板块最多展示 8 条

- **WHEN** Pack trending 的 `data` 超过 8 条
- **THEN** 该板块 MUST 只按 `rank` 展示前 8 条
