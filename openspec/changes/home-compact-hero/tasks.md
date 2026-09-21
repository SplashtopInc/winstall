## 1. 总量通道与 hint 文案

- [x] 1.1 新增 `utils/appsSearchHint.js`：实现 `formatAppsSearchHint(appsTotal)`（向下取整到 50、`en-US` 千分位、`Search N+ apps` / 回退 `Search apps...`）
- [x] 1.2 新增 `ctx/appsTotalContext.js`，并在 `pages/_app.js` 挂 Provider
- [x] 1.3 `components/Nav.js` 订阅总量并更新搜索 trigger 可见 hint

## 2. 首页压缩顶部

- [x] 2.1 `pages/index.js`：去掉可见 intro（标题/副文/总量行/插画）；写入 `appsTotal` 到 Context；保留视觉隐藏 `h1` 与 Meta
- [x] 2.2 调整加载态，避免 intro 英雄区闪现
- [x] 2.3 清理 `styles/home.module.scss` 中仅服务于已删 intro 的无用样式（若仍被他处引用则保留）

## 3. 核对

- [x] 3.1 人工核对：首页无 intro；有总量时顶栏 hint 含规模；轮播与周榜仍在；他页 hint 在进过首页后仍可用
