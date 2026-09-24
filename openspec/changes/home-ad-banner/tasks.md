## 1. Banner 独立抽签

- [x] 1.1 在 `utils/pickAd.js` 增加无放回抽最多 2 条的导出，会话键与 `winstall_ad_id` 分离；服务端返回空数组
- [x] 1.2 两条活动链接的 `utm_content` 分别为 `home-a` 与 `home-b`；货架 `pickAd` 行为不变

## 2. 轮播只播广告

- [x] 2.1 改 `components/homeCarousel.js`：去掉 App / Pack 幻灯片；用独立抽签结果渲染最多两张广告；字段为 `name`、`headline`、`body`、`cta`
- [x] 2.2 `pages/index.js` 不再为 banner 传入 `topApp` / pack；无启用广告时不渲染轮播

## 3. 构图

- [x] 3.1 改 `styles/homeCarousel.module.scss`：260px、浅暖底、半透明科技装饰叠色、左栏占位、描边 pill CTA；控件按浅底着色
