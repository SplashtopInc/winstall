## Why

winstall-api 已将上游下架从硬删除改为软删除：`GET /apps/:id` 对仍有文档的下架应用返回 200 与 `deletedAt`，`GET /apps/liked` 与 Pack 详情 hydrate 也会带上该字段。前端仍按「有响应即在架」渲染，详情会继续给出安装命令，收藏与 Pack 也无法区分下架与在架。

## What Changes

- 应用详情在 `deletedAt` 非空时渲染墓碑页：保留名称、图标、发行商、描述与资料，标明下架，收起安装 / 下载 / 加入列表与 winget 命令区；真正 404 仍走 `AppNotFound`
- 收藏页 Apps 卡片对 `deletedAt` 非空显示 **Removed** 标记，卡片仍可进入墓碑详情
- Pack 详情对软删除应用显示 **Removed**（可进详情），与目录缺失的 **Unavailable** 区分；软删除应用不进入安装列表
- 墓碑页文档标题与结构化数据不再按「可安装详情」输出
- 静态视觉稿已放在 `.demo/app-removed.html`、`.demo/liked.html`、`.demo/pack-detail.html`，实现以稿为准对齐

## Capabilities

### New Capabilities

- `soft-deleted-apps`: 详情墓碑页、收藏与 Pack 上的 Removed 标记，以及软删除与 Unavailable 的区分

### Modified Capabilities

- `app-detail-title`: 软删除详情不再使用 `{name} Download | winstall`
- `app-detail-structured-data`: 软删除详情 MUST NOT 输出 SoftwareApplication JSON-LD
- `my-likes`: Apps 列表展示并标记 API 返回的软删除应用
- `install-export`: 软删除详情不提供 Download installer、Add to list 与 winget 命令复制

## Impact

- 页面与组件：`pages/apps/[id].js`、`components/AppDetailView.js`（或新墓碑组件）、`pages/my/favorites.js`、`components/SingleApp.js`、`components/PackDetailAppCard.js`、`utils/packHelpers.js`、`pages/packs/[id].js`
- Meta / SEO：`components/MetaTags.js`（墓碑 `noindex`）、`utils/appJsonLd.js` 调用条件
- API 契约依赖：详情与 liked / Pack hydrate 的 `deletedAt`；发现类列表已排除软删除，本变更不改列表请求
- 不改公开路径 `/apps/:id`、`/packs/:id`、`/apps`、`/packs`
