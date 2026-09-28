## MODIFIED Requirements

### Requirement: 周榜与货架都读终身计数字段

首页已渲染的 Trending Apps 卡片 MUST 从 trending 响应条目读取终身 `viewCount`、`downloadCount`、`likeCount`。MUST NOT 读取 `views`、`downloads`、`likes`。MUST NOT 为这些卡片请求 `GET /apps/:id/stats`。对每一项，仅当精确数值大于或等于 `100` 时 MUST 展示；小于 `100`、缺省、非数字或缺失 MUST NOT 展示该指标。三项皆不足阈值时 MUST NOT 渲染计数行。首页 Featured Packs 的计数展示不在本要求范围内（见 `home-trending` / `pack-card-engagement`）。货架 `SingleApp` 上的终身三项展示规则不变，且计数行 MUST NOT 使用「this week」把这些数字说成窗口计数。

#### Scenario: 首页周榜使用终身字段

- **WHEN** 用户查看首页 Trending Apps
- **THEN** 卡片计数（若有展示）MUST 来自该条目的 `viewCount`、`downloadCount`、`likeCount`，MUST NOT 读取 `views`、`downloads`、`likes`

#### Scenario: 货架卡不写 this week

- **WHEN** 用户查看 `/category` 或 `/apps` 上的 `SingleApp` 计数行
- **THEN** 该行 MUST NOT 呈现 this week 或等价的周热度含义
