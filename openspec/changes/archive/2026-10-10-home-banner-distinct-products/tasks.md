## 1. 按产品互斥抽取

- [x] 1.1 在 `utils/pickAd.js` 增加不读 `window` 的纯函数：按 `product`（去空白；空白或缺失则用该条 `id`）分组，先均匀抽取最多 2 个产品，再在每个产品内均匀抽取 1 条；随机源可注入
- [x] 1.2 `pickHomeBannerAds` 改用该函数。`winstall_home_banner_ad_ids` 里若有共享分组键的多条，丢弃并重抽后写回；产品不同的缓存仍沿用。服务端仍返回空数组。货架 `pickAd` 不变

## 2. 测试

- [x] 2.1 新增 `test/pickAd.test.js`：同一 `product` 的多条文案不会同时入选；启用广告不少于 2 条但只有 1 个产品时只返回 1 条；空白 `product` 各自成组；同产品会话缓存会被丢弃并重抽
