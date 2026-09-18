## 1. 骨架组件

- [x] 1.1 新增 `components/shelfListSkeleton.js`：`variant` 为 `app` 或 `pack`，默认 8 张，复用调用方网格 class
- [x] 1.2 纯 CSS 脉动块（卡片背景、圆角、慢透明度）；`prefers-reduced-motion` 时停动画；不新增依赖

## 2. 接到三处货架

- [x] 2.1 `/category` 首屏空列表改用 `app` 骨架，替换 `Loading apps…`
- [x] 2.2 `/packs` Public 与已登录 My 首屏空列表改用 `pack` 骨架；未登录 My 仍为登录说明
- [x] 2.3 Add Apps 弹窗空网格改用 `app` 骨架；Load more 仍只改按钮态
