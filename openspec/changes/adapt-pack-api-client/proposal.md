## Why

`winstall-api` 已具备 Pack schema 与 CRUD（权威数据将迁出 Web 本地 Mongo），而本仓前端与 SSR 仍经同源 `/api/packs/*` + `packService` 读写本地库，且 stats 仍本地 `$inc`。需要在本仓把调用面切到 API，否则 API 侧能力无法落地、生产双库会继续分裂。JWT 浏览器直连本期不做，先经现有 BFF 适配完成切换。

## What Changes

- 将 `fetchPackAPI`（及同类客户端入口）从 `/api/packs/*` 改为经 `/api/winstall` 调用 API Pack 路由，并做**路径/方法映射**（API 风格 ≠ 旧 BFF 形状）。
- 扩展 `/api/winstall` 的鉴权代签规则，覆盖新路径（如 `GET /packs/me`、`POST /packs`、`POST /packs/:id/copy` 等写/本人读）。
- 详情页 / 列表等对 stats 的写入从本地 `POST /api/packs/:id/stats`（`$inc`）改为走 API `POST /analytics/track`（及读 `GET /packs/:id/stats`）；展示侧不再依赖 Pack 文档内嵌 `stats`。
- SSR / 构建期读路径（首页官方推荐 Pack、`sitemap-packs` 等）改为经服务端凭据调 API，不再 `Pack.find` 本地权威库。
- 用户删号时的 Pack 级联改为调 API（经 BFF 或服务端 AuthKey），避免孤儿 Pack。
- **不删除**本期本地 `pages/api/packs/*`、`service/packService`、`dbModel/Pack*`（切流稳定后再拆；可保留作回滚面）。
- **不做** JWT 下发到浏览器与直连 API（需求 4 另排）。
- **不做** 生产异库迁数脚本（属 `winstall-api` `migrate-pack-to-api`）；本仓约定切流前依赖 API 迁数/对账完成。

路径映射约定（对齐 API）：

| 现网（本地） | 目标（经 BFF → API） |
|--------------|----------------------|
| `GET /api/packs` | `GET /packs/me` |
| `GET /api/packs/public` | `GET /packs` |
| `POST /api/packs/create` | `POST /packs` |
| `GET/PATCH/DELETE /api/packs/:id` | 同形 `/packs/:id` |
| `POST /api/packs/:id/copy` | `POST /packs/:id/copy` |
| `POST /api/packs/:id/stats` | `POST /analytics/track`（读用 `GET /packs/:id/stats`） |

## Capabilities

### New Capabilities

- `pack-api-client`: Web 经 BFF 消费 API Pack（CRUD / 我的 / 公开列表 / 复制）、stats 读与 track 写、SSR 与删号级联改走 API；明确本期保留本地 Pack API 作回滚、不做 JWT 直连。

### Modified Capabilities

- （无）`openspec/specs/` 下尚无既有能力基线。

## Impact

- **代码**：`utils/fetchPackAPI.js`、`pages/api/winstall/[...path].js`（`requiresAuth`）、Pack 相关页面/组件、首页 ISR、`sitemap-packs`、`service/userService` 删号路径、stats 调用点。
- **依赖**：`WINSTALL_API_*`、BFF 代签 JWT（`userId` = publicId）与 API 契约一致；依赖 API 仓 Pack 接口与（生产）迁数就绪。
- **数据**：切流后本仓不再作为 Pack 权威写入口；测试同库可较早切读/写，生产须迁数对账后再切。
- **非目标**：JWT 直连、删除本地 Pack 模型/路由、API 迁数实现、PackLike 产品化露出。
