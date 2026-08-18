## Why

App / Pack 的 view、download 已写入 `POST /analytics/track`，但详情页不读、不展示终身量；Like 只剩 Pack 内 App 卡上的死字段，没有按钮、没有登录、没有 API。v2.4 需求 1 要先把「可查询的数据」露给用户，并把 Like 做成需认证的可选能力（本 change 先做上、默认露出；Trending 不做）。

## What Changes

- App 详情、Pack 详情展示终身 **views** 与 **installs**（download 计数）。只上详情，不上列表/卡片。
- 两端都提供 **Like**（计数 + 已赞态）。点心需登录：未登录打开现有 `LoginPanel`，回来后自动补赞；已登录直接打 API。
- 实现前在 `.demo` 用假数据铺详情上的数字与 Like，不先做交互与真接口。
- Pack 详情用已有 `GET /packs/:id/stats`（`fetchPackStats`）；App 详情对接对等的 stats 读接口（本仓尚无 helper）。
- Like / unlike 走 API（路径与 API 仓对齐后再钉），带 session API JWT。
- **不做** Trending（badge、rail、排序都不做）。
- **不做** 列表/卡片上的 counts 或 Like。
- **不做** Like 功能开关（本 change 默认露出；文档里的「可开关」留后续）。
- **不做** 需求 2–7（搜索分页、Generate、Next 16、分类等）。

## Capabilities

### New Capabilities

- `detail-engagement`: App / Pack 详情展示终身 view/download，以及需登录的 Like（含未登录弹登录、回跳后续赞）。

### Modified Capabilities

- `pack-api-client`: Pack 详情必须读取并展示 `GET /packs/:id/stats`，不得依赖文档内嵌 `stats`；Pack Like 走 API，不恢复本地 PackLike。

## Impact

- **代码**：`AppDetailView`、`pages/packs/[id].js`；`fetchPackStats` 接上；新增 App stats helper；Like 客户端；复用 `useRequireAuth` / `LoginPanel`。`.demo` 静态稿先于页面改动。
- **API**：读 stats（Pack 已有；App 需确认 `GET /apps/:id/stats` 或等价）；写 like/unlike（App 与 Pack 同一套 target 模型）。形状未定时本仓不猜死路径。
- **外部**：Like 依赖登录用户的 session JWT；匿名只看计数、不能赞。CORS / JWT 与现有直连一致。
- **不做的仓**：不改 winstall-api 的 AuthKey 分支；不产品化 Trending。
