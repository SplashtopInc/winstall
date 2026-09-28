# home-trending Specification

## Purpose

首页 Discover 从公开 API 展示 App 周热度榜，以及来自 `GET /packs/trending` 的 Featured Packs；某一侧 `data` 为空则不渲染该块；顶部轮播只展示独立抽签的广告幻灯片，不包含周榜 App 或 Featured pack。

## Requirements

### Requirement: 首页读取周热度榜

首页生成或再验证时，系统 MUST 向运行时 API origin 请求 `GET /apps/trending` 与 `GET /packs/trending`。这些请求 MUST 省略 `Authorization`、`AuthKey` 和 `AuthSecret`。首页 MUST NOT 用 analytics track 或日桶聚合自行算名次。某一侧读取失败 MUST 视为该侧 `data` 为空数组，且 MUST NOT 因此让整页失败。

#### Scenario: 首页读取两个 trending 接口

- **WHEN** 首页正在生成或再验证，且已配置 API origin
- **THEN** 系统 MUST 在该 origin 上调用 `GET /apps/trending` 与 `GET /packs/trending`，且不带用户或服务凭证

#### Scenario: trending 失败不导致首页空白

- **WHEN** 任一 trending 请求失败
- **THEN** 首页 MUST 仍渲染导航、轮播（若有幻灯片）及其余可用区块，并将失败的那一侧视为无条目

### Requirement: 空榜不展示对应板块

仅当 App 榜成功读到至少一条 `data` 时，首页 MUST 渲染 Trending Apps。仅当 Pack 榜成功读到至少一条 `data` 时，首页 MUST 渲染 Featured Packs。两块 MUST 独立隐藏。

#### Scenario: App 空榜只隐藏 App 板块
- **WHEN** App trending 的 `data` 为空或读取失败，且 Pack trending 的 `data` 有条目
- **THEN** 首页 MUST 省略 Trending Apps，且 MUST 仍展示 Featured Packs

#### Scenario: Pack 空榜只隐藏 Pack 板块
- **WHEN** Pack trending 的 `data` 为空或读取失败，且 App trending 的 `data` 有条目
- **THEN** 首页 MUST 省略 Featured Packs，且 MUST 仍展示 Trending Apps

#### Scenario: 两侧皆空则两块都不出现
- **WHEN** 两次 trending 读取均为空或失败
- **THEN** 首页 MUST 省略这两个周榜板块

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

### Requirement: Trending Apps 为可勾选的扁平卡

Trending Apps MUST 按 API 的 `rank` 顺序展示，最多 16 条，桌面为每行 4 卡的网格。每张卡 MUST 展示名称和目录图标（MUST NOT 使用精选 Popular Apps 的 `img` 资源）。卡片 MUST NOT 展示 `#N` 或其它可见名次。选中控件 MUST 默认隐藏，在卡片 hover（或触控设备上始终）可见，风格与现有 PrettyApp 勾选一致；激活 MUST 把该 App 加入或移出首页现有安装脚本选择集。激活应用身份 MUST 进入该 App 详情页。首页 MUST NOT 渲染 Popular Apps 板块。

#### Scenario: 按接口名次展示卡
- **WHEN** App trending 的 `data` 含多条
- **THEN** 该板块 MUST 按 `rank` 顺序展示，且名称可见，MUST NOT 在卡片上展示 `#N`

#### Scenario: App 板块最多展示 16 条
- **WHEN** App trending 的 `data` 超过 16 条
- **THEN** 该板块 MUST 只按 `rank` 展示前 16 条

#### Scenario: 用户可将周榜 App 加入安装选择
- **WHEN** 用户激活某张周榜 App 的勾选控件
- **THEN** 该 App MUST 进入首页现有的安装脚本选择集

#### Scenario: 首页不展示 Popular Apps
- **WHEN** 用户打开首页
- **THEN** 页面 MUST NOT 渲染 Popular Apps 板块

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

### Requirement: 首页轮播组合第 1 名与广告

首页 MUST 用轮播替代原先独立的首页 DonateCard。轮播 MUST 只展示来自启用广告池的广告幻灯片，MUST NOT 包含 App 周榜第 1 名（`#1 this week`）幻灯片，MUST NOT 包含 Featured pack 幻灯片。系统 MUST 从启用广告中无放回抽取最多 2 条；抽取结果 MUST 与货架列表广告的抽签相互独立，MUST NOT 共用货架会话所选的那一条。每张幻灯片 MUST 展示该条的 `name`（大标题）、`headline`（副标题）、`body` 与 `cta`，以及 `data/ads.json` 里该条的 `image`（相对站点根的图片路径，左栏展示）和 `banner-bg`（同样的路径规则，作为幻灯片背景装饰）。`image` 缺省或空白时左栏 MUST NOT 请求其它图片接口，MAY 保留空占位。`banner-bg` 缺省或空白时 MUST NOT 再使用固定的装饰图。产品图 MUST 为 280px × 180px，圆角 14px。图片左缘距 banner 左缘 MUST 为 48px，图片右缘距文字区左缘 MUST 为 40px。图片与文字区 MUST 在 banner 内垂直居中，且文字区高度 MUST 与图片同为 180px：标题顶与图片顶对齐，按钮底与图片底对齐。文字区宽度 MUST NOT 超过 750px。`name` MUST 为 26px、字重 700、颜色 `#1A1A2E`。`headline` MUST 为 17px、字重 400、颜色 `#1A1A2E`。`body` MUST 为 14px、字重 400、颜色 `#5C5C70`。活动 URL MUST 遵循现有首页广告规则，且两条的 `utm_content` MUST 分别为 `home-a` 与 `home-b`。启用广告不足 2 条时 MUST 只展示抽到的张数。没有任何启用广告时，轮播 MUST NOT 渲染。首页 MUST NOT 在轮播之外再渲染一张独立 DonateCard。Trending Apps 与 Featured Packs 板块 MUST 仍按各自要求渲染，MUST NOT 因本要求进入轮播。

#### Scenario: 有 App 榜时出现第 1 名幻灯片
- **WHEN** App trending 的 `data` 至少有一条
- **THEN** 轮播 MUST NOT 包含该第一条的 `#1 this week` 幻灯片

#### Scenario: 广告幻灯片使用首页广告池
- **WHEN** 至少存在两条启用的首页广告
- **THEN** 轮播 MUST 包含恰好两张广告幻灯片，其名称、卖点、正文、CTA 与活动 URL 来自启用池中互不相同的两条，且抽签独立于货架广告

#### Scenario: 广告幻灯片展示 image
- **WHEN** 抽中的广告 `image` 为 `assets/ads/ad_stb.png`
- **THEN** 该幻灯片左栏 MUST 展示 `/assets/ads/ad_stb.png`

#### Scenario: 广告幻灯片展示 banner-bg
- **WHEN** 抽中的广告 `banner-bg` 为 `assets/ads/banner_bg_purple.svg`
- **THEN** 该幻灯片背景装饰 MUST 展示 `/assets/ads/banner_bg_purple.svg`，MUST NOT 使用固定的 `icon_banner.svg`

#### Scenario: 广告幻灯片左图右文对齐
- **WHEN** 用户查看一张带 `image` 的广告幻灯片
- **THEN** 产品图 MUST 为 280px × 180px、圆角 14px，左缘距 banner 左缘 48px，右缘距文字区 40px；文字区 MUST 与图片顶底对齐且高度为 180px，宽度 MUST NOT 超过 750px

#### Scenario: 无幻灯片则隐藏轮播
- **WHEN** 无法展示任何启用的首页广告
- **THEN** 首页 MUST 省略轮播

#### Scenario: 首页广告不重复
- **WHEN** 轮播包含广告幻灯片
- **THEN** 首页 MUST NOT 同时展示原先的独立 DonateCard
