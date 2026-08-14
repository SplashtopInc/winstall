## Why

`adapt-pack-api-client` 已把 Pack 主路径切到 winstall-api（经 BFF）。本地 `/api/packs`、mongoose Pack 模型、切流开关只是回滚面，现在会分叉行为、挡住删除。API 侧已就绪，可以硬切并拆掉这层。

## What Changes

- **BREAKING**：删除 `PACK_API_VIA_WINSTALL` / `NEXT_PUBLIC_PACK_API_VIA_WINSTALL`。Pack 读写、SSR、sitemap、stats/track、删号级联只走 API（经 BFF 或服务端凭据）。回滚改为 git revert，不再切回本地 Mongo。
- 删除本地 Pack HTTP 面：`pages/api/packs/*`、`service/packService`、`service/packLikeService`。
- 删除 `dbModel/Pack*`、`lib/mongoose.js` 与 `mongoose` 依赖（本仓 mongoose 只服务 Pack）。NextAuth 继续用 `lib/mongodb.js`。
- 收拢 `fetchPackAPI` / `trackPackStats` / 首页推荐 / sitemap / `deleteUserAccount` 为单一 API 路径；去掉 flag-off 分支与删号时的本地 Pack 双清。
- 去掉 Web 侧 Pack 内容审核（`utils/contentModeration` 及其测试）；审核只在 API。
- **BREAKING**：删除已废弃的 `pages/users/[id].js`。旧 URL 404，不做跳转。
- 一并清理该页卫星：`sitemap-packs` 不再输出 `/users/:id`、删除仅被该页使用的 `pages/api/twitter.js`（`TWITTER_BEARER`）、去掉 BFF 对 `packs/create` 与 `packs/profile/` 的遗留代签。
- **不做** 浏览器 JWT 直连、不拆 `/api/winstall` BFF。
- **不做** 产品化 PackLike；本地 like 模型随 Pack 栈删除，不迁 UI。
- **保留** `/api/users/me` 删号与 `fetchUserAPI`；NextAuth Twitter 登录（`TWITTER_CLIENT_*`）不动。

## Capabilities

### New Capabilities

- `pack-api-client`: Web 只经 BFF/服务端凭据消费 API Pack；无本地 Pack 路由/模型/切流开关；无 Web 侧 pack 审核。
- `user-pack-profile`: 不再提供按用户公开的 Pack 目录页（`/users/:id`）及其 sitemap / Twitter 查找依赖。

### Modified Capabilities

- （无）`openspec/specs/` 下尚无已同步的能力基线。归档的 `adapt-pack-api-client` 未合入主规格。

## Impact

- **代码**：`pages/api/packs/`、`service/packService.js`、`service/packLikeService.js`、`dbModel/`、`lib/mongoose.js`、`utils/packApiConfig.js`、`utils/fetchPackAPI.js`、`utils/trackPackStats.js`、`utils/packApiServer.js`、`service/userService.js`、`pages/index.js`、`pages/sitemap-packs.xml.js`、`pages/users/[id].js`、`pages/api/twitter.js`、`pages/api/winstall/[...path].js`、`utils/contentModeration/`、`test/contentModeration.test.js`、`package.json`。
- **环境**：删除 `PACK_API_VIA_WINSTALL`、`NEXT_PUBLIC_PACK_API_VIA_WINSTALL`；`TWITTER_BEARER` 不再被读取。`WINSTALL_API_*` 成为 Pack 的必需依赖。
- **依赖**：移除 `mongoose`。`mongodb` / NextAuth adapter 保留。
- **外部**：已索引的 `/users/:id` 与任何仍打 `/api/packs/*` 的客户端会失败。BFF 仍是浏览器 Pack 入口。
