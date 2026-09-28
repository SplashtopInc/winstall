## MODIFIED Requirements

### Requirement: 周榜与列表都读终身计数字段

首页已渲染的 Featured Packs 卡片 MUST NOT 展示 `GET /packs/trending` 条目上的 `viewCount`、`downloadCount`、`likeCount`，也 MUST NOT 为此请求 `GET /packs/:id/stats`。`/packs` 上 `PackCard` 的终身三项展示规则不变，仍读列表响应上的终身字段，且 MUST NOT 读取短名 `views`、`downloads`、`likes`。`PackCard` 上的计数行 MUST NOT 使用「this week」把这些数字说成窗口计数。

#### Scenario: 首页周榜使用终身字段

- **WHEN** 用户查看首页 Featured Packs
- **THEN** 卡片 MUST NOT 展示该条目的 `viewCount`、`downloadCount`、`likeCount`，MUST NOT 读取短名 `views`、`downloads`、`likes`，且 MUST NOT 请求 `GET /packs/:id/stats`

#### Scenario: 列表卡不写 this week

- **WHEN** 用户查看 `/packs` 上 `PackCard` 的计数行
- **THEN** 该行 MUST NOT 呈现 this week 或等价的周热度含义
