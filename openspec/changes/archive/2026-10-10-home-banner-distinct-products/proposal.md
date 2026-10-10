## Why

首页 banner 从 `data/ads.json` 启用池无放回抽 2 条，但同一 `product` 可以有多条文案。现在的洗牌把它们当成互不相干的广告，一次结果里会出现两张同一产品（同名、同图），轮播看起来像重复投放。

## What Changes

- Banner 一次结果里，两条广告的 `product` 必须不同。先在不同产品中抽最多 2 个，再在每个产品的启用文案里抽 1 条。
- 不同产品不足 2 个时，只展示能抽到的张数（每个产品最多 1 条）；没有任何启用广告时仍不渲染轮播。
- 会话里已经记下的一对如果 `product` 相同，丢掉这次缓存并重新抽取。
- 货架 `pickAd`、banner 构图、`utm` 规则与 `data/ads.json` 条目本身不改。

## Capabilities

### New Capabilities

- （无）

### Modified Capabilities

- `home-trending`: 首页轮播抽出的两条广告必须来自不同 `product`；同产品文案不能同时出现。

## Impact

- `utils/pickAd.js` 的 `pickHomeBannerAds`：按 `product` 互斥抽取，并在恢复 `winstall_home_banner_ad_ids` 时拒绝同产品缓存。
- `hooks/useHomeBannerAds.js` 仍消费该结果；幻灯片数量可能因产品不足而只有 1 张。
- 不改货架 `DonateCard`、分类页广告、API 或广告素材。
