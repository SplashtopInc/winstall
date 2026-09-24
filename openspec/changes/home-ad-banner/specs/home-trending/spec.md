## MODIFIED Requirements

### Requirement: 首页轮播组合第 1 名与广告

首页 MUST 用轮播替代原先独立的首页 DonateCard。轮播 MUST 只展示来自启用广告池的广告幻灯片，MUST NOT 包含 App 周榜第 1 名（`#1 this week`）幻灯片，MUST NOT 包含 Featured pack 幻灯片。系统 MUST 从启用广告中无放回抽取最多 2 条；抽取结果 MUST 与货架列表广告的抽签相互独立，MUST NOT 共用货架会话所选的那一条。每张幻灯片 MUST 展示该条的 `name`（大标题）、`headline`（副标题）、`body` 与 `cta`，活动 URL MUST 遵循现有首页广告规则，且两条的 `utm_content` MUST 分别为 `home-a` 与 `home-b`。启用广告不足 2 条时 MUST 只展示抽到的张数。没有任何启用广告时，轮播 MUST NOT 渲染。首页 MUST NOT 在轮播之外再渲染一张独立 DonateCard。Trending Apps 与 Featured Packs 板块 MUST 仍按各自要求渲染，MUST NOT 因本要求进入轮播。

#### Scenario: 有 App 榜时出现第 1 名幻灯片
- **WHEN** App trending 的 `data` 至少有一条
- **THEN** 轮播 MUST NOT 包含该第一条的 `#1 this week` 幻灯片

#### Scenario: 广告幻灯片使用首页广告池
- **WHEN** 至少存在两条启用的首页广告
- **THEN** 轮播 MUST 包含恰好两张广告幻灯片，其名称、卖点、正文、CTA 与活动 URL 来自启用池中互不相同的两条，且抽签独立于货架广告

#### Scenario: 无幻灯片则隐藏轮播
- **WHEN** 无法展示任何启用的首页广告
- **THEN** 首页 MUST 省略轮播

#### Scenario: 首页广告不重复
- **WHEN** 轮播包含广告幻灯片
- **THEN** 首页 MUST NOT 同时展示原先的独立 DonateCard
