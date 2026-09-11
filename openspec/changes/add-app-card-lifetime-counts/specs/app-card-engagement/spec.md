## Purpose

让目录与搜索中的应用卡片只读展示货架列表带回的终身浏览、下载与点赞数，并与首页周榜窗口计数分开。

## ADDED Requirements

### Requirement: SingleApp 展示货架终身计数

凡渲染为 `SingleApp` 的应用卡 MUST 展示该应用对象上的终身 `viewCount`、`downloadCount`、`likeCount`。三项 MUST 按 views、downloads、likes 的顺序排成一行，放在描述之后，且均为只读。紧凑货架卡 MUST 贴近首页 Trending Apps 的身份区（图标瓷片、名称、发行商），MUST NOT 展示 version，描述 MUST 最多两行。缺省、非数字或缺失字段 MUST 按 0 展示，MUST NOT 隐藏为 0 的项。系统 MUST NOT 为该行请求 `GET /apps/:id/stats`，MUST NOT 用周榜窗口字段 `views`、`downloads`、`likes` 替代终身三项，MUST NOT 在卡片上提供点赞或取消点赞。`large` 详情型 `SingleApp` 若出现，仍 MUST 遵守计数要求，且 MUST NOT 因此改写详情页的 stats 读取。

#### Scenario: 紧凑货架卡不展示 version，描述最多两行

- **WHEN** 用户在 `/category` 或 `/apps` 查看紧凑 `SingleApp`
- **THEN** 卡片 MUST NOT 展示 version，描述 MUST 最多显示两行

#### Scenario: 分类货架卡片显示终身三项

- **WHEN** 用户在 `/category` 查看由 `GET /apps` 或 `GET /apps/categories/:id` 返回的应用卡
- **THEN** 每张 `SingleApp` MUST 显示该条 `viewCount`、`downloadCount`、`likeCount`，顺序为 views、downloads、likes

#### Scenario: 目录与搜索卡片同样显示

- **WHEN** 用户在 `/apps` 或搜索结果中查看由 `GET /apps`、`GET /apps/search` 或 `GET /publishers/:id` 返回的应用卡
- **THEN** 每张 `SingleApp` MUST 以同样规则显示终身三项

#### Scenario: 缺字段当 0

- **WHEN** 某条应用没有 `viewCount`、`downloadCount` 或 `likeCount`（例如 Pack 编辑列表仍是快照）
- **THEN** 对应项 MUST 显示 0，且三个数都仍可见

#### Scenario: 不打详情 stats

- **WHEN** 页面正在渲染一组 `SingleApp`
- **THEN** 系统 MUST NOT 为这些卡片调用 `GET /apps/:id/stats`

### Requirement: 货架终身数与周榜窗口数分离

首页已渲染的 Trending Apps 与 Trending Packs 卡片 MUST 继续展示周榜 payload 上的窗口 `views`、`downloads`、`likes`。那些卡片 MUST NOT 改用货架终身 `viewCount` / `downloadCount` / `likeCount` 替代窗口三项。货架 `SingleApp` 上的计数行 MUST NOT 使用「this week」或等价周窗口文案。

#### Scenario: 首页周榜仍用窗口字段

- **WHEN** 用户查看首页 Trending Apps
- **THEN** 卡片计数 MUST 来自该条目的窗口 `views`、`downloads`、`likes`，MUST NOT 改成只显示终身 `viewCount`

#### Scenario: 货架卡不写 this week

- **WHEN** 用户查看 `/category` 或 `/apps` 上的 `SingleApp` 计数行
- **THEN** 该行 MUST NOT 呈现 this week 或等价的周热度含义
