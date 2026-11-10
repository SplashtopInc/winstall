## Why

创建弹窗和分享勾选为了判断公开名额，会拉取完整的 `GET /packs/me`，并在网站上用 `PACK_TRENDING_OWNER_USER_ID` 自己区分 10 和 200。API 已提供只含 `publicCount` 与 `maxPublic` 的 `GET /packs/me/quota`。网站应改读这个接口，不再为勾选下载整份「我的 Pack」，也不再在网站进程保存运营账号 id。

## What Changes

- 创建 Pack 弹窗，以及主人把尚未 public 的 Pack 设为 public 的分享勾选，改为请求 `GET /packs/me/quota`，用响应的 `publicCount` 与 `maxPublic` 决定勾选是否可用和提示中的数字。
- 该请求必须携带 session 签发的 API JWT。未带 JWT 的名额请求不得发出。
- 这两处不再为名额判断调用 `GET /packs/me`。列表页和「我的 Pack」缓存仍使用 `GET /packs/me`。
- 网站不再读取 `PACK_TRENDING_OWNER_USER_ID`，不再把运营账号 id 写入页面 meta。
- 不改 `POST /packs` 与 `PATCH /packs/:id` 的请求体。已经是 public 的 Pack 仍不受名额拦截。名额未满时的提示原句保持不变。

## Capabilities

### New Capabilities

### Modified Capabilities

- `public-pack-limit`：公开勾选改为消费 `GET /packs/me/quota` 的 `publicCount` 与 `maxPublic`，网站不再用运营账号环境变量自行计算 10 或 200，创建与分享不再为这项判断调用 `GET /packs/me`。
- `pack-api-client`：浏览器访问 `GET /packs/me/quota` 时必须附带 session API JWT。

## Impact

- 前端：`components/CreatePackModal.js`、`components/PackShareCard.js`、`utils/fetchPackAPI.js`、`utils/fetchWinstallAPI.js`、`utils/packLimits.js`、`utils/packTrendingOwner.js`、`pages/_document.js`、`.env.example`，以及对应测试。
- API：不改 winstall-api。网站只消费已有的 `GET /packs/me/quota`。
- 环境：网站进程不再需要 `PACK_TRENDING_OWNER_USER_ID`。该变量仍只属于 API。
