## 1. 共享判定与详情数据

- [x] 1.1 增加 `deletedAt != null` 的共享判定（如 `utils/isAppRemoved.js`），并补单测
- [x] 1.2 在 `pages/apps/[id].js` 的 `slimAppForDetailPage` 保留 `deletedAt`，供墓碑分支使用

## 2. 详情墓碑页

- [x] 2.1 新增墓碑视图组件与样式，对齐 `.demo/app-removed.html`（Removed、下架说明、描述、Information；无命令区 / Download / Add to list；可保留 Like）
- [x] 2.2 在 `pages/apps/[id].js`：`deletedAt` 非空渲染墓碑；真正未找到仍用 `components/AppNotFound.js`
- [x] 2.3 墓碑文档标题为 `{name} | winstall`，meta description 说明已下架；为墓碑增加 `noindex`（扩展 `components/MetaTags.js` 或等价）
- [x] 2.4 软删除详情 MUST NOT 渲染 `components/appJsonLd.js`；确认 breadcrumb 行为与规格一致

## 3. 收藏 Removed

- [x] 3.1 在 `components/SingleApp.js`（或 `pages/my/favorites.js` 包装）对软删除应用显示 Removed，隐藏勾选，仍链到 `/apps/:id`
- [x] 3.2 确认未下架收藏卡行为与勾选不变

## 4. Pack Removed 与安装过滤

- [x] 4.1 在 `utils/packHelpers.js` 的 `normalizePackDetailApps` 区分 `unavailable`（`available === false`）与软删除（`deletedAt` 非空）
- [x] 4.2 更新 `components/PackDetailAppCard.js`：Removed 可进详情；Unavailable 保持现有不可点态
- [x] 4.3 在 `pages/packs/[id].js` 将软删除与 Unavailable 一并排除出 `installableApps`

## 5. 验证

- [x] 5.1 为判定辅助函数与关键渲染分支补/改 Node 测试
- [x] 5.2 对照 `.demo/app-removed.html`、`.demo/liked.html`、`.demo/pack-detail.html` 做一次视觉与交互核对（墓碑、收藏标记、Pack Removed vs Unavailable、安装按钮禁用）
