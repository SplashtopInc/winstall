# app-detail-packs Specification

## Purpose

在已找到应用的详情页展示最多四个包含该应用的热门公开 Pack，让用户从应用进入可整组安装的合集。

## Requirements

### Requirement: 已找到的 App 详情读取包含它的热门 Pack

当已找到应用的详情页展示该应用后，浏览器 MUST 向运行时 API origin 请求 `GET /apps/:id/packs`。`:id` MUST 为该应用的公开标识，与详情路径 `/apps/:id` 使用的标识一致。请求 MUST 带 `limit=4`。`offset` MUST 省略或为 `0`。请求 MUST NOT 带 `sort`。请求 MUST 省略 `Authorization`、`AuthKey` 和 `AuthSecret`。已登录与未登录 MUST 发出同一条匿名请求。系统 MUST NOT 把这次读取放进会让整页失败的静态数据里。应用不存在的页面 MUST NOT 发出该请求。详情尚在骨架、应用标识未知时 MUST NOT 发出该请求。

#### Scenario: 打开已找到的应用时匿名请求四条

- **WHEN** 用户打开一个已找到应用的详情页
- **THEN** 浏览器 MUST 请求 `GET /apps/:id/packs`，`limit` 为 `4`，且 MUST NOT 带 `Authorization`、`AuthKey`、`AuthSecret` 或 `sort`

#### Scenario: 登录用户也不附带身份

- **WHEN** 已登录用户打开一个已找到应用的详情页
- **THEN** 该次 `GET /apps/:id/packs` MUST 仍省略 `Authorization`

#### Scenario: 应用不存在时不请求

- **WHEN** 详情页判定该应用不存在
- **THEN** 系统 MUST NOT 请求 `GET /apps/:id/packs`

### Requirement: 最多四张并保持接口顺序

系统 MUST 用成功响应 `{ total, offset, limit, data }` 中的 `data` 渲染。顺序 MUST 为 `data` 的返回顺序。系统 MUST NOT 在客户端按名称、应用数量、时间或计数重排。当 `data` 多于 4 条时 MUST 只展示前 4 条。`total` 大于已展示条数时 MUST NOT 展示查看全部，MUST NOT 打开另一个 Pack 列表。系统 MUST NOT 把 `GET /packs/me` 或其它 Pack 列表并进这组卡片。

#### Scenario: 按返回顺序展示

- **WHEN** `GET /apps/:id/packs` 成功且 `data` 含多条
- **THEN** 页面 MUST 按 `data` 的顺序展示这些 Pack，且 MUST NOT 改序

#### Scenario: 多于四条只留前四条

- **WHEN** `data` 含 5 条或更多
- **THEN** 页面 MUST 只展示前 4 条，且 MUST NOT 提供查看其余条目的入口

### Requirement: 轻卡只展示合集身份与描述

每张卡 MUST 展示合集身份符号（pack/stack）、名称和应用数量。名称 MUST 最多一行，超出 MUST 不换行并以省略号截断。应用数量 MUST 来自该条的 `appCount`：数值为 1 时文案为 `1 app`，其它非负整数为 `{n} apps`。描述 MUST 固定占两行，超出 MUST 以省略号截断；无描述或短于两行时仍保留两行高度。身份符号 MUST NOT 使用该 Pack 内某个 App 的图标。整张卡 MUST 可激活并进入 `/packs/:id`。卡片 MUST NOT 展示应用图标条、相对或绝对更新时间、作者、可见性徽章、浏览、下载、点赞或点赞控件。统计展示开关打开时这些卡片仍 MUST NOT 展示计数，且 MUST NOT 为此请求 `GET /packs/:id` 或 `GET /packs/:id/stats`。桌面 MUST 以每行最多 4 张的网格展示；窄屏 MUST 为每行 2 张。不足 4 张时 MUST NOT 用空卡补齐。

#### Scenario: 卡片内容与入口

- **WHEN** 用户看到一张已渲染的热门 Pack 卡，且该条 `name` 为 `The Essential`、`appCount` 为 `46`
- **THEN** 该卡 MUST 可见合集身份符号、名称 `The Essential`、文案 `46 apps` 和描述，激活后 MUST 进入该 Pack 的 `/packs/:id`

#### Scenario: 不展示图标条、时间与计数

- **WHEN** 统计展示开关打开，且用户看到已渲染的热门 Pack 卡
- **THEN** 该卡 MUST NOT 展示应用图标条、更新时间、`viewCount`、`downloadCount`、`likeCount` 或等价计数，且 MUST NOT 请求 `GET /packs/:id` 或 `GET /packs/:id/stats`

#### Scenario: 单数应用数量

- **WHEN** 某条 `appCount` 为 `1`
- **THEN** 该卡的数量文案 MUST 为 `1 app`

### Requirement: 区块位置、空结果与失败

有卡片可展示时，该区块 MUST 出现在 App 正文之下。若同发行商区块也出现，热门 Pack 区块 MUST 在其之下。若相关应用区块也出现，热门 Pack 区块 MUST 在其之下。区块标题 MUST 为 `Packs with this app`。请求尚未返回时 MAY 只展示该标题。`data` 为空、`total` 为 0，或请求失败时，MUST NOT 留下该标题、空网格或错误文案，且 App 正文、同发行商区块与相关应用区块 MUST 仍按各自既有规则展示。

#### Scenario: 有结果时位于正文之下、其它推荐之后

- **WHEN** 热门 Pack、同发行商应用和相关应用都有可展示条目
- **THEN** 热门 Pack 区块 MUST 在 App 正文之下，且 MUST 在同发行商区块和相关应用区块之下

#### Scenario: 没有 Pack 时整块消失

- **WHEN** `GET /apps/:id/packs` 成功且 `data` 为空
- **THEN** 页面 MUST NOT 展示 `Packs with this app` 标题或空卡

#### Scenario: 请求失败不挡住详情

- **WHEN** `GET /apps/:id/packs` 失败
- **THEN** 页面 MUST NOT 展示该 Pack 区块，且 MUST 仍展示已找到应用的正文

### Requirement: 其它 Pack 表面保持不变

`/packs` 列表卡 MUST 继续按既有规则展示应用图标条、相对更新时间，并在统计展示开关打开时展示终身计数。首页 Featured Packs MUST 保持既有卡片与计数规则。本能力 MUST NOT 改变 `/apps/:id` 或 `/packs/:id` 的公开路径。

#### Scenario: 列表卡不被这次轻卡替换

- **WHEN** 用户查看 `/packs` 上的一张含有应用快照的合集卡
- **THEN** 该卡 MUST 仍可展示应用图标条与相对更新时间
