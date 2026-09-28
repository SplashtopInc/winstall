## Why

首页顶部介绍区（大标题、副文、包总量、右侧插画）占用首屏过高，与运营轮播叠成双英雄区，回访用户几乎无收益。包总量更适合作为搜索入口的规模提示，以便顶部让位给轮播与货架。

## What Changes

- 去掉首页可见的 intro：大标题、副文、`packages and growing` 文案、右侧 logo 插画。
- 顶栏搜索 trigger 的 hint 在拿到应用总量时展示规模（如 `Search 14,850+ apps`）；未拿到总量时回退为现有 `Search apps...`。
- 首页保留对读屏 / SEO 可用的页面标题（视觉可隐藏的 `h1`），Meta title 不变。
- 首页轮播与周榜 / 分类货架行为不变。

## Capabilities

### New Capabilities

- `home-compact-hero`: 首页压缩顶部介绍、搜索 hint 展示包总量、保留无障碍标题。

### Modified Capabilities

- `home-trending`: 失败兜底与布局叙述中的「介绍区」改为与压缩后的首页顶部一致（不再依赖可见 intro 文案块）。

## Impact

- `pages/index.js`、`styles/home.module.scss`：移除 / 收缩 intro 布局。
- `components/Nav.js`、`styles/nav.module.scss`：搜索 hint 文案。
- 需把首页 `appsTotal`（或等价格式化后的总量）传到 Nav：优先轻量上下文或 props 通道，避免为文案再打 API。
- 无 API / 数据模型变更；轮播与 trending 接口不变。
