## Why

首页 banner 仍把周榜 App、Featured pack 和一条货架同源广告混在一起轮播，既占不住运营主视觉，也和「只播 Splashtop 产品广告」的构图对不上。现在要把 banner 收成独立抽签的两条广告位，并按产品稿铺科技底与左图右文结构。

## What Changes

- Banner **只展示广告**：去掉 `#1 this week` App 幻灯片和 Featured pack 幻灯片。Trending Apps / Featured Packs 板块仍在首页下方，不进 banner。
- 从 `data/ads.json` 启用池 **无放回抽 2 条**，会话单独记住这一对；**不**与货架 `DonateCard` 的 `pickAd` / `winstall_ad_id` 共用抽签。
- 文案：`name` 大标题、`headline` 副标题、`body` 正文、`cta` 描边 pill。`utm_content` 为 `home-a` / `home-b`。
- 视觉：高度 260px；浅暖底色上叠半透明科技装饰；左栏留给后续产品图（本 change **不**加图片资源）。启用不足 2 条则展示能抽到的张数；0 条则不渲染 banner。
- 首页仍不得在 banner 外再挂独立 DonateCard。

## Capabilities

### New Capabilities

- （无）

### Modified Capabilities

- `home-trending`: 首页轮播不再组合第 1 名 App；改为最多两张独立抽签的广告 banner。

## Impact

- `components/homeCarousel.js`、`styles/homeCarousel.module.scss`：幻灯片与构图。
- `utils/pickAd.js` 或并列 helper：banner 独立抽 2 条；货架 `pickAd` 不变。
- `data/ads.json` 已含 `name`；本 change 消费该字段，不为产品图扩字段。
- `pages/index.js` 仍可把 trending 传给下方板块；不必再为 banner 传 `topApp`。
- 不改 API、不改分类/目录货架广告。
