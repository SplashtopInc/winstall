## Purpose

让 Pack 列表卡片只读展示公开列表与「我的列表」带回的终身浏览、下载与点赞数，并与首页周榜窗口计数、详情页 stats 读取分开。

## ADDED Requirements

### Requirement: PackCard 展示列表终身计数

凡渲染为 `PackCard` 的合集卡 MUST 展示该 Pack 对象上的终身 `viewCount`、`downloadCount`、`likeCount`。三项 MUST 按 views、downloads、likes 的顺序排成一行，放在 app 图标排之后、「Last updated」之前，且均为只读。缺省、非数字或缺失字段 MUST 按 0 展示，MUST NOT 隐藏为 0 的项。系统 MUST NOT 为该行请求 `GET /packs/:id/stats`，MUST NOT 用周榜窗口字段 `views`、`downloads`、`likes` 替代终身三项，MUST NOT 在卡片上提供点赞或取消点赞。卡片 MUST 仍展示名称、描述、app 图标排与 Last updated。

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

### Requirement: Pack 列表终身数与周榜窗口数分离

首页已渲染的 Featured Packs 卡片 MUST 继续展示周榜 payload 上的窗口 `views`、`downloads`、`likes`。那些卡片 MUST NOT 改用列表终身 `viewCount` / `downloadCount` / `likeCount` 替代窗口三项。`PackCard` 上的计数行 MUST NOT 使用「this week」或等价周窗口文案。

#### Scenario: 首页周榜仍用窗口字段
- **WHEN** 用户查看首页 Featured Packs
- **THEN** 卡片计数 MUST 来自该条目的窗口 `views` / `downloads` / `likes`，MUST NOT 改成只显示终身 `viewCount`

#### Scenario: 列表卡不写 this week
- **WHEN** 用户查看 `/packs` 上 `PackCard` 的计数行
- **THEN** 该行 MUST NOT 呈现 this week 或等价的周热度含义
