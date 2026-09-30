# app-card-engagement Specification

## Purpose

让目录、搜索与首页 Trending Apps 只读展示各自响应条目上的终身浏览、下载与点赞数，不为这些卡片再读详情 stats。

## Requirements

### Requirement: SingleApp 展示货架终身计数

当统计展示开关打开时，凡渲染为 `SingleApp` 的应用卡 MUST 展示该应用对象上的终身 `viewCount`、`downloadCount`、`likeCount`。三项 MUST 按 views、downloads、likes 的顺序排成一行，放在描述之后，且均为只读。缺省、非数字或缺失字段 MUST 按 0 展示，MUST NOT 隐藏为 0 的项。开关关闭时，这些卡片 MUST NOT 展示上述三项或计数行。紧凑货架卡 MUST 贴近首页 Trending Apps 的身份区（图标瓷片、名称、发行商），MUST NOT 展示 version，描述 MUST 最多两行。系统 MUST NOT 为该行请求 `GET /apps/:id/stats`，MUST NOT 读取短名 `views`、`downloads`、`likes`，MUST NOT 在卡片上提供点赞或取消点赞。`large` 详情型 `SingleApp` 若出现，仍 MUST 遵守本计数开关，且 MUST NOT 因此改写详情页的 stats 读取。

#### Scenario: 紧凑货架卡不展示 version，描述最多两行

- **WHEN** 用户在 `/category` 或 `/apps` 查看紧凑 `SingleApp`
- **THEN** 卡片 MUST NOT 展示 version，描述 MUST 最多显示两行

#### Scenario: 分类货架卡片显示终身三项

- **WHEN** 统计展示开关打开，且用户在 `/category` 查看由 `GET /apps` 或 `GET /apps/categories/:id` 返回的应用卡
- **THEN** 每张 `SingleApp` MUST 显示该条 `viewCount`、`downloadCount`、`likeCount`，顺序为 views、downloads、likes

#### Scenario: 目录与搜索卡片同样显示

- **WHEN** 统计展示开关打开，且用户在 `/apps` 或搜索结果中查看由 `GET /apps`、`GET /apps/search` 或 `GET /publishers/:id` 返回的应用卡
- **THEN** 每张 `SingleApp` MUST 以同样规则显示终身三项

#### Scenario: 缺字段当 0

- **WHEN** 统计展示开关打开，且某条应用没有 `viewCount`、`downloadCount` 或 `likeCount`（例如 Pack 编辑列表仍是快照）
- **THEN** 对应项 MUST 显示 0，且三个数都仍可见

#### Scenario: 不打详情 stats

- **WHEN** 页面正在渲染一组 `SingleApp`
- **THEN** 系统 MUST NOT 为这些卡片调用 `GET /apps/:id/stats`

#### Scenario: 开关关闭时货架不展示计数

- **WHEN** 统计展示开关关闭，且用户查看 `SingleApp`
- **THEN** 卡片 MUST NOT 展示 `viewCount`、`downloadCount`、`likeCount` 或计数行

### Requirement: 周榜与货架都读终身计数字段

当统计展示开关打开时，首页已渲染的 Trending Apps 卡片 MUST 从 trending 响应条目读取终身 `viewCount`、`downloadCount`、`likeCount`。MUST NOT 读取 `views`、`downloads`、`likes`。MUST NOT 为这些卡片请求 `GET /apps/:id/stats`。对每一项，仅当精确数值大于或等于 `100` 时 MUST 展示；小于 `100`、缺省、非数字或缺失 MUST NOT 展示该指标。三项皆不足阈值时 MUST NOT 渲染计数行。开关关闭时，这些卡片 MUST NOT 渲染计数行。首页 Featured Packs 的计数展示不在本要求范围内（见 `home-trending` / `pack-card-engagement`）。货架 `SingleApp` 上的终身三项展示规则受同一开关约束，且计数行 MUST NOT 使用「this week」把这些数字说成窗口计数。

#### Scenario: 首页周榜使用终身字段

- **WHEN** 统计展示开关打开，且用户查看首页 Trending Apps
- **THEN** 卡片计数（若有展示）MUST 来自该条目的 `viewCount`、`downloadCount`、`likeCount`，MUST NOT 读取 `views`、`downloads`、`likes`

#### Scenario: 货架卡不写 this week

- **WHEN** 统计展示开关打开，且用户查看 `/category` 或 `/apps` 上的 `SingleApp` 计数行
- **THEN** 该行 MUST NOT 呈现 this week 或等价的周热度含义
