## 1. 名额请求与 JWT

- [x] 1.1 在 `utils/fetchPackAPI.js` 增加读取 `GET /packs/me/quota` 的函数，返回 `{ publicCount, maxPublic }` 所在的现有响应形状。
- [x] 1.2 在 `utils/fetchWinstallAPI.js` 让 `GET /packs/me/quota` 与 `GET /packs/me` 一样强制附带 session API JWT。用两条精确路径，不用 `/packs/me` 前缀。没有可用 JWT 时不匿名发出该请求。

## 2. 创建与分享改读名额

- [x] 2.1 修改 `components/CreatePackModal.js`：公开勾选只使用名额接口的 `publicCount` 与 `maxPublic`。已是 public 的当前 Pack 不拦截。未满时提示仍为 `Appears in the public App Packs directory for anyone to discover.`。已满时提示为 `Public pack limit reached (N).`，`N` 为 `maxPublic`。请求失败或缺少这两个整数时不猜测 10 或 200，勾选保持可用。不为这项判断调用 `GET /packs/me`。不改 `POST /packs` 与 `PATCH /packs/:id` 的请求体。
- [x] 2.2 修改 `components/PackShareCard.js`：主人把尚未 public 的 Pack 设为 public 时使用同一名额接口和同一比较。未满时提示仍为 `Anyone with the link will be able to view this pack.`。已是 public 时勾选保持可用。不为这项判断调用 `GET /packs/me`。

## 3. 去掉网站上的运营账号配置

- [x] 3.1 删除 `utils/packTrendingOwner.js`，并去掉 `pages/_document.js` 中的 `winstall-pack-trending-owner`。
- [x] 3.2 从 `utils/packLimits.js` 去掉按用户 id 选择 10 或 200 的函数，以及只为名额判断服务的公开计数函数。保留按传入数字生成提示的函数，以及名称和描述长度常量。
- [x] 3.3 从 `.env.example` 去掉 `PACK_TRENDING_OWNER_USER_ID` 说明。不提交 `.env`。

## 4. 测试

- [x] 4.1 更新 `test/packLimits.test.js`，删除 `test/packTrendingOwner.test.js`。为 JWT 判断补测试：`GET /packs/me` 与 `GET /packs/me/quota` 需要 JWT，`GET /packs/me/other` 不因前缀被要求 JWT。运行 `node --test` 覆盖这些测试文件。
