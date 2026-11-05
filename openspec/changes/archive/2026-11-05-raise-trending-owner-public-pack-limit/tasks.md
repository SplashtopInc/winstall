## 1. 运营账号 id

- [x] 1.1 新增 `utils/packTrendingOwner.js`。从 `process.env.PACK_TRENDING_OWNER_USER_ID` 去掉首尾空白，供 meta 内容使用；浏览器读取 meta `winstall-pack-trending-owner`，找不到或空白时返回空字符串。不使用 `NEXT_PUBLIC_*`。
- [x] 1.2 在 `pages/_document.js` 写入该 meta。未配置时 content 为空。
- [x] 1.3 在 `.env.example` 说明 `PACK_TRENDING_OWNER_USER_ID` 必须与 API 使用同一个用户公开 id，未设置时界面名额保持 10。不提交 `.env`。

## 2. 名额与勾选

- [x] 2.1 修改 `utils/packLimits.js`：普通名额保持 10，运营名额为 200。给定当前用户公开 id 与运营账号 id 时，运营 id 为空一律返回 10，二者全等返回 200，否则返回 10。提示按名额拼成 `Public pack limit reached (N). Unpublish or delete a pack to continue.`。
- [x] 2.2 修改 `components/CreatePackModal.js`：用 `user.id` 与上一函数比较 `countPublicPacksInList` 的结果。已是 public 的当前 Pack 不拦截。名额未满时提示仍为 `Appears in the public App Packs directory for anyone to discover.`。不改 `POST /packs` 与 `PATCH /packs/:id` 的请求体。
- [x] 2.3 修改 `components/PackShareCard.js`：同一名额与提示。尚未 public 且名额已满时勾选不可用。已经 public 时勾选保持可用。名额未满时提示仍为 `Anyone with the link will be able to view this pack.`。

## 3. 验证

- [x] 3.1 新增 `test/packLimits.test.js` 与 `test/packTrendingOwner.test.js`。覆盖运营 id 全等为 200、两侧空白仍为 200、其他用户为 10、未配置或空白为 10、空运营 id 不与空用户 id 匹配、两条提示文案，以及 meta 缺失时读到空字符串。运行 `node --test test/packLimits.test.js test/packTrendingOwner.test.js`。
- [x] 3.2 运行 `npm test`。
