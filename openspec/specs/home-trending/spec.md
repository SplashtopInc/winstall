# home-trending Specification

## Purpose

首页 Discover 从公开 API 展示 App 与 Pack 周热度榜；某一侧 `data` 为空则不渲染该块；顶部轮播在有周榜时展示第 1 名 App，并沿用现有首页广告。

## Requirements

### Requirement: 首页读取周热度榜

首页生成或再验证时，系统 MUST 向运行时 API origin 请求 `GET /apps/trending` 与 `GET /packs/trending`。这些请求 MUST 省略 `Authorization`、`AuthKey` 和 `AuthSecret`。首页 MUST NOT 用 analytics track 或日桶聚合自行算名次。某一侧读取失败 MUST 视为该侧 `data` 为空数组，且 MUST NOT 因此让整页失败。

#### Scenario: 首页读取两个 trending 接口
- **WHEN** 首页正在生成或再验证，且已配置 API origin
- **THEN** 系统 MUST 在该 origin 上调用 `GET /apps/trending` 与 `GET /packs/trending`，且不带用户或服务凭证

#### Scenario: trending 失败不导致首页空白
- **WHEN** 任一 trending 请求失败
- **THEN** 首页 MUST 仍渲染介绍区及其余可用区块，并将失败的那一侧视为无条目

### Requirement: 空榜不展示对应板块

仅当 App 榜成功读到至少一条 `data` 时，首页 MUST 渲染 Trending Apps。仅当 Pack 榜成功读到至少一条 `data` 时，首页 MUST 渲染 Trending Packs。两块 MUST 独立隐藏。

#### Scenario: App 空榜只隐藏 App 板块
- **WHEN** App trending 的 `data` 为空或读取失败，且 Pack trending 的 `data` 有条目
- **THEN** 首页 MUST 省略 Trending Apps，且 MUST 仍展示 Trending Packs

#### Scenario: Pack 空榜只隐藏 Pack 板块
- **WHEN** Pack trending 的 `data` 为空或读取失败，且 App trending 的 `data` 有条目
- **THEN** 首页 MUST 省略 Trending Packs，且 MUST 仍展示 Trending Apps

#### Scenario: 两侧皆空则两块都不出现
- **WHEN** 两次 trending 读取均为空或失败
- **THEN** 首页 MUST 省略这两个周榜板块

### Requirement: 周榜卡片展示窗口互动计数

已渲染的 Trending Apps 卡与 Trending Packs 卡片 MUST 展示该条目周榜 payload 上的窗口 `likes`、`downloads`、`views`。MUST NOT 用终身 `likeCount` 或 `downloadCount` 替代这三项。缺省值 MUST 按 0 展示。

#### Scenario: 周榜条目展示 like、download、view
- **WHEN** 用户看到已渲染的 Trending Apps 或 Trending Packs
- **THEN** 每条 MUST 可见该条目的 like、download 与 view 数字

### Requirement: Trending Apps 为可勾选的扁平卡

Trending Apps MUST 按 API 的 `rank` 顺序展示，最多 20 条，桌面为每行 4 卡的网格。每张卡 MUST 展示名次、名称和目录图标（MUST NOT 使用精选 Popular Apps 的 `img` 资源）。选中控件 MUST 默认隐藏，在卡片 hover（或触控设备上始终）可见，风格与现有 PrettyApp 勾选一致；激活 MUST 把该 App 加入或移出首页现有安装脚本选择集。激活应用身份 MUST 进入该 App 详情页。首页 MUST NOT 渲染 Popular Apps 板块。

#### Scenario: 按接口名次展示卡
- **WHEN** App trending 的 `data` 含多条
- **THEN** 该板块 MUST 按 `rank` 顺序展示，且名次与名称可见

#### Scenario: 用户可将周榜 App 加入安装选择
- **WHEN** 用户激活某张周榜 App 的勾选控件
- **THEN** 该 App MUST 进入首页现有的安装脚本选择集

#### Scenario: 首页不展示 Popular Apps
- **WHEN** 用户打开首页
- **THEN** 页面 MUST NOT 渲染 Popular Apps 板块

### Requirement: Trending Packs 使用 demo 式卡片

Trending Packs MUST 用与 `.demo/discover.html` 一致的卡片渲染每条：渐变头（名次、标题、描述、窗口计数）、内含应用列表。整张卡 MUST 可激活并进入 Pack 详情，MUST NOT 再单独展示 View Pack 文案。卡片 MUST 使用当前 Pack 的 `name` / `description`，MUST NOT 写死 pack id 列表。渐变色可按名次轮换，MUST NOT 依赖 API 返回主题字段。

#### Scenario: Pack 卡打开详情
- **WHEN** 用户激活一张周榜 pack 卡
- **THEN** 必须进入该 Pack 的详情页

#### Scenario: Pack 板块不使用精选 id
- **WHEN** Trending Packs 渲染
- **THEN** 合集集合 MUST 来自 `GET /packs/trending` 的 `data`，MUST NOT 来自固定官方 pack id 列表

#### Scenario: Pack 卡呈现 demo 结构
- **WHEN** 用户看到已渲染的 Trending Packs
- **THEN** 每张卡 MUST 含渐变头、`#N this week` 名次、标题，且 MUST NOT 展示 View Pack 文案

### Requirement: 首页轮播组合第 1 名与广告

首页 MUST 用轮播替代原先独立的首页 DonateCard。当 App trending 的 `data` 至少有一条时，轮播 MUST 包含该第 1 名的 `#1 this week` 幻灯片，且含将该 App 加入或移出安装选择集的控件。轮播 MUST 包含现有首页广告内容（与今日首页 DonateCard 相同的启用广告池与活动 URL 规则）。若没有任何幻灯片（无第 1 名且无广告），轮播 MUST NOT 渲染。首页 MUST NOT 在轮播广告幻灯片之外再渲染一张独立 DonateCard。

#### Scenario: 有 App 榜时出现第 1 名幻灯片
- **WHEN** App trending 的 `data` 至少有一条
- **THEN** 轮播 MUST 包含该第一条的 `#1 this week` 幻灯片

#### Scenario: 广告幻灯片使用首页广告池
- **WHEN** 至少存在一条启用的首页广告
- **THEN** 轮播 MUST 包含一张广告幻灯片，其标题、正文、CTA 与活动 URL 遵循现有首页广告规则

#### Scenario: 无幻灯片则隐藏轮播
- **WHEN** App trending 的 `data` 为空或失败，且无法展示启用的首页广告
- **THEN** 首页 MUST 省略轮播

#### Scenario: 首页广告不重复
- **WHEN** 轮播包含广告幻灯片
- **THEN** 首页 MUST NOT 同时展示原先的独立 DonateCard
