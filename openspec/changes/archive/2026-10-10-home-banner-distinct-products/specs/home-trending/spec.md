## MODIFIED Requirements

### Requirement: 首页轮播组合第 1 名与广告

首页 MUST 用轮播替代原先独立的首页 DonateCard。轮播 MUST 只展示来自启用广告池的广告幻灯片，MUST NOT 包含 App 周榜第 1 名（`#1 this week`）幻灯片，MUST NOT 包含 Featured pack 幻灯片。系统 MUST 按 `product` 将启用广告分组，从不同产品中均匀无放回抽取最多 2 个产品，再在每个抽中产品的启用文案中均匀抽取 1 条；同一次结果中的广告 MUST 具有互不相同的 `product`。缺少或空白 `product` 的广告 MUST 各自视为独立产品。抽取结果 MUST 与货架列表广告的抽签相互独立，MUST NOT 共用货架会话所选的那一条。若本会话已记下的广告属于同一个 `product`，系统 MUST 丢弃该记录并重新抽取。每张幻灯片 MUST 展示该条的 `name`（大标题）、`headline`（副标题）、`body` 与 `cta`，以及 `data/ads.json` 里该条的 `image`（相对站点根的图片路径，左栏展示）和 `banner-bg`（同样的路径规则，作为幻灯片背景装饰）。`image` 缺省或空白时左栏 MUST NOT 请求其它图片接口，MAY 保留空占位。`banner-bg` 缺省或空白时 MUST NOT 再使用固定的装饰图。产品图 MUST 为 280px × 180px，圆角 14px。图片左缘距 banner 左缘 MUST 为 48px，图片右缘距文字区左缘 MUST 为 40px。图片与文字区 MUST 在 banner 内垂直居中，且文字区高度 MUST 与图片同为 180px：标题顶与图片顶对齐，按钮底与图片底对齐。文字区宽度 MUST NOT 超过 750px。`name` MUST 为 26px、字重 700、颜色 `#1A1A2E`。`headline` MUST 为 17px、字重 400、颜色 `#1A1A2E`。`body` MUST 为 14px、字重 400、颜色 `#5C5C70`。活动 URL MUST 遵循现有首页广告规则，且两条的 `utm_content` MUST 分别为 `home-a` 与 `home-b`。启用广告不足 2 条，或不同产品不足 2 个时，MUST 只展示抽到的张数，且每个产品最多 1 条。没有任何启用广告时，轮播 MUST NOT 渲染。首页 MUST NOT 在轮播之外再渲染一张独立 DonateCard。Trending Apps 与 Featured Packs 板块 MUST 仍按各自要求渲染，MUST NOT 因本要求进入轮播。

#### Scenario: 有 App 榜时出现第 1 名幻灯片
- **WHEN** App trending 的 `data` 至少有一条
- **THEN** 轮播 MUST NOT 包含该第一条的 `#1 this week` 幻灯片

#### Scenario: 广告幻灯片使用首页广告池
- **WHEN** 至少存在两个不同 `product` 的启用首页广告
- **THEN** 轮播 MUST 包含恰好两张广告幻灯片，其名称、卖点、正文、CTA 与活动 URL 来自这两个不同产品中各一条启用文案，两条的 `product` MUST 不同，且抽签独立于货架广告

#### Scenario: 同产品文案不同时出现
- **WHEN** 启用池中同一 `product` 有多条文案，且至少还有另一个不同 `product`
- **THEN** 同一次轮播结果 MUST NOT 同时包含该 `product` 的多条文案

#### Scenario: 不同产品不足两张
- **WHEN** 启用广告不少于 2 条，但它们只属于 1 个 `product`
- **THEN** 轮播 MUST 只展示 1 张广告幻灯片

#### Scenario: 同产品会话记录重新抽取
- **WHEN** 本会话记下的多条广告属于同一个 `product`
- **THEN** 系统 MUST 丢弃该记录并重新抽取，使结果中的 `product` 互不相同

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
