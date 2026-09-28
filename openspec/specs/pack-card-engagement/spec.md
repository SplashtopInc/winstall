# pack-card-engagement Specification

## Purpose

让 Pack 列表只读展示响应条目上的终身浏览、下载与点赞数，不为这些卡片再读详情 stats；首页 Featured Packs 不展示互动计数。

## Requirements

### Requirement: PackCard 展示列表终身计数

凡渲染为 `PackCard` 的合集卡 MUST 展示该 Pack 对象上的终身 `viewCount`、`downloadCount`、`likeCount`。三项 MUST 按 views、downloads、likes 的顺序排成一行，放在 app 图标排之后、「Last updated」之前，且均为只读。缺省、非数字或缺失字段 MUST 按 0 展示，MUST NOT 隐藏为 0 的项。系统 MUST NOT 为该行请求 `GET /packs/:id/stats`，MUST NOT 读取短名 `views`、`downloads`、`likes`，MUST NOT 在卡片上提供点赞或取消点赞。卡片 MUST 仍展示名称、描述、app 图标排与 Last updated。

#### Scenario: 公开列表卡片显示终身三项
- **WHEN** 用户在 `/packs` 的公开列表查看由 `GET /packs` 返回的合集卡
- **THEN** 每张 `PackCard` MUST 显示该条 `viewCount`、`downloadCount`、`likeCount`，顺序为 views、downloads、likes

#### Scenario: 我的列表同样显示
- **WHEN** 用户在 `/packs` 的 Mine 查看由 `GET /packs/me` 返回的合集卡
- **THEN** 每张 `PackCard` MUST 以同样规则显示终身三项

#### Scenario: 缺字段当 0
- **WHEN** 某条 Pack 没有 `viewCount`、`downloadCount` 或 `likeCount`
- **THEN** 对应项 MUST 显示 0，且三个数都仍可见

#### Scenario: 不打详情 stats
- **WHEN** 页面正在渲染一组 `PackCard`
- **THEN** 系统 MUST NOT 为这些卡片调用 `GET /packs/:id/stats`

### Requirement: 周榜与列表都读终身计数字段

首页已渲染的 Featured Packs 卡片 MUST NOT 展示 `GET /packs/trending` 条目上的 `viewCount`、`downloadCount`、`likeCount`，也 MUST NOT 为此请求 `GET /packs/:id/stats`。`/packs` 上 `PackCard` 的终身三项展示规则不变，仍读列表响应上的终身字段，且 MUST NOT 读取短名 `views`、`downloads`、`likes`。`PackCard` 上的计数行 MUST NOT 使用「this week」把这些数字说成窗口计数。

#### Scenario: 首页周榜使用终身字段

- **WHEN** 用户查看首页 Featured Packs
- **THEN** 卡片 MUST NOT 展示该条目的 `viewCount`、`downloadCount`、`likeCount`，MUST NOT 读取短名 `views`、`downloads`、`likes`，且 MUST NOT 请求 `GET /packs/:id/stats`

#### Scenario: 列表卡不写 this week

- **WHEN** 用户查看 `/packs` 上 `PackCard` 的计数行
- **THEN** 该行 MUST NOT 呈现 this week 或等价的周热度含义
