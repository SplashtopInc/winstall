## Why

运营账号需要公开远多于 10 个 Pack，但创建弹窗和分享卡在提交前用写死的 10 把「Public pack」勾选关掉。这个账号对上 `PACK_TRENDING_OWNER_USER_ID` 时，界面应放到 200 才拦截。

## What Changes

- 当前用户 id 与运行时 `PACK_TRENDING_OWNER_USER_ID`（去掉首尾空白后）相同时，公开 Pack 名额为 200。未配置、空白或 id 不一致时，名额仍为 10。
- 创建弹窗与分享卡上的「设为 public」勾选都用这一名额。已是 public 的当前 Pack 不占新名额，勾选保持可用。
- 名额已满时勾选不可用，提示中的数字与实际名额一致：普通用户为 10，运营账号为 200。
- 不改 API。`POST /packs` 与 `PATCH /packs/:id` 仍由 winstall-api 按每人 10 个 public 拒绝。本 change 只放宽网站上的提前拦截。
- 不改首页 Pack 榜容量，不改 `/packs/:id` 等公开路径。

## Capabilities

### New Capabilities

- `public-pack-limit`：按当前用户是否为 `PACK_TRENDING_OWNER_USER_ID` 决定公开 Pack 名额（200 或 10），并用于创建与分享两处勾选。

### Modified Capabilities

- （无）

## Impact

- 前端：`utils/packLimits.js`、`components/CreatePackModal.js`、`components/PackShareCard.js`。运行时读取 `PACK_TRENDING_OWNER_USER_ID`，沿用 `_document` 写入 meta、浏览器再读取的方式，不使用 `NEXT_PUBLIC_*`。
- 规格：`openspec/specs/pack-share` 里「名额已满则不能公开、徽章保持不可用」仍然成立。满的判定改由 `public-pack-limit` 给出，pack-share 的要求正文不变。
- API：无改动。运营账号在界面上超过 10 个之后再公开，仍会收到 API 的 400，直到 API 另行放宽同一账号的上限。
- 环境：网站进程需要与 API 相同的 `PACK_TRENDING_OWNER_USER_ID`。缺省时所有用户保持 10。
