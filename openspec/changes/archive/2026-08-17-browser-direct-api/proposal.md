## Why

`remove-auth-key` 之后 BFF 不再藏钥匙，只剩把 session 换成短 JWT 再转发。公开 catalog / track 在 API 上已匿名可打，继续经 `/api/winstall` 多一跳、还制造同源 304。AuthKey 已停发，可以让浏览器直连 API，并把用户票放进现有 NextAuth session，不必再开一条发牌接口。

## What Changes

- **先**把需要 API 地址的整页入口改成 ISR（build 无 env 时 `revalidate: 1`），让 `_document` 能在运行时把 `WINSTALL_API_BASE` 写进 meta。**再**做浏览器直连。不新增 `/api/config`，不用 `NEXT_PUBLIC_*`。
- 浏览器用该 runtime meta 拿 API origin。客户端 catalog、Pack、analytics track 直连 winstall-api。登录写 / 我的 / owner 读 private 带 session 里的短 API JWT（`{ userId }` = publicId，约 5 分钟，经 jwt 回调续签）。
- **BREAKING**（第二步）：删除 `/api/winstall` catch-all 与 `/api/apps/:id/stats`。仍打这些路径的客户端会失败。
- 不新增发牌 HTTP 接口。不把 NextAuth cookie JWT 或 OAuth token 当 API Bearer。浏览器不发 `X-User-Id`。
- `/packs/[id]` 保持按请求 SSR；sitemap / 删号级联继续服务端直连。
- **不做** winstall-api 删 AuthKey 分支、不改 NextAuth 登录本身、不把客户端 Pack/catalog 拉数搬进 `getStaticProps`。

## Capabilities

### New Capabilities

- （无）

### Modified Capabilities

- `api-client-credentials`: 需要 API 地址的入口页为 ISR/SSR，以便 runtime meta 带上 origin；浏览器从 meta 直连；用户态 JWT 来自 session 而非 BFF 代签；不再提供 `/api/winstall` 转发。
- `pack-api-client`: 浏览器 Pack CRUD / 列表 / track 直连 API 路径，不再经 BFF；认证改为 session 短 JWT。

## Impact

- **代码**：先改需 origin 的静态页为 ISR（`/packs`、`/generate`、about/privacy/eli5/compare*、`/404`）；再改 `pages/_document.js`、`utils/runtimeConfig.js`、`utils/fetchWinstallAPI.js`、`utils/fetchPackAPI.js`、`utils/trackPackStats.js`、`utils/trackAppStats.js`、`pages/api/auth/[...nextauth].js`（jwt/session 回调）；删除 `pages/api/winstall/[...path].js`、`pages/api/apps/[id]/stats.js`。
- **环境**：继续要运行时 `WINSTALL_API_BASE`（写入 meta）。build 仍然可以没有该变量。`NEXT_PUBLIC_WINSTALL_API_BASE` 不是本 change 的地址来源。
- **外部**：登录写路径依赖 API 在非 production 也解析 Bearer 填 `userId`（否则本地只有票没有身份）。API CORS 已覆盖 localhost 与 `winstall.app`；预发域名若缺失需在 API 仓补。API AuthKey 分支可继续存在，本仓不调用。
