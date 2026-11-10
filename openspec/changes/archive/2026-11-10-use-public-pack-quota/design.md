## Context

见 `proposal.md` 的 Why。创建弹窗和分享勾选目前调用 `GET /packs/me`，在本地数 `visibility` 为 `public` 的条数，再用页面 meta 里的运营账号 id 与 `user.id` 比较，得到 10 或 200。`utils/fetchWinstallAPI.js` 只在路径恰好是 `/packs/me` 时为 GET 强制附带 session API JWT。API 已提供 `GET /packs/me/quota`，成功体为 `{ publicCount, maxPublic }`。列表页和本地「我的 Pack」缓存仍需要完整的 `GET /packs/me`。

## Goals / Non-Goals

**Goals:**

- 两处公开勾选只读名额接口的两个整数。
- 该 GET 与 `GET /packs/me` 一样强制带 JWT，且不用路径前缀把其它路径卷进来。
- 网站去掉运营账号 id 的环境变量、meta 和本地 10/200 比较。

**Non-Goals:**

- 不改 winstall-api，不改 `GET /packs/me` 的数组契约。
- 不改列表页、账号删除或 `loadOwnPacks` 对 `GET /packs/me` 的使用。
- 不改创建和更新的请求体，不把写接口的 400 移到前端。

## Decisions

### 名额请求走现有 Pack 客户端

**选择：** 在 `utils/fetchPackAPI.js` 增加读取 `/me/quota` 的函数，使最终路径为 `/packs/me/quota`。创建弹窗和分享勾选只在需要判断公开勾选时调用它。比较改为 `publicCount >= maxPublic`，提示数字用 `maxPublic`。已经是 public 的 Pack 仍跳过拦截。

**备选：** 继续拉 `GET /packs/me` 再只读其中的名额字段。该接口没有这两个字段，而且会下载整份列表。

### JWT 用两条精确路径

**选择：** `requiresUserJwt` 对 `GET /packs/me` 与 `GET /packs/me/quota` 都返回 true。不用「以 `/packs/me` 开头」的前缀，避免把其它路径当成必须带 JWT。没有可用 JWT 时沿用现有「必须带 JWT 的请求不匿名发出」的行为。

**备选：** 只改调用点手动塞 header。其它强制 JWT 的 Pack 请求都走 `requiresUserJwt`，名额请求应同一处判断，401 后的一次重试才会跟上。

### 删掉网站上的运营账号配置

**选择：** 删除 `utils/packTrendingOwner.js`、`pages/_document.js` 中的 `winstall-pack-trending-owner`，以及 `.env.example` 里的 `PACK_TRENDING_OWNER_USER_ID` 说明。`utils/packLimits.js` 去掉按用户 id 选择 10 或 200 的函数，以及只为这次判断服务的公开计数函数。提示函数保留，参数改为接口返回的 `maxPublic`。名称和描述长度常量不动。

**备选：** 保留环境变量作为名额接口失败时的本地兜底。失败时猜 10 或 200 会再次和 API 分叉，规格要求失败时不猜测，勾选保持可用。

## Risks / Trade-offs

- [名额路径漏进 JWT 判断] → 请求变成匿名 401，勾选会一直可点。用精确路径测试锁住 `/packs/me/quota` 必须带 JWT，而相邻的其它路径不必。
- [名额返回前用户已经勾选公开] → 与现在拉完整列表的窗口相同，提交仍由 API 的 400 拒绝。
- [网站环境里还留着 `PACK_TRENDING_OWNER_USER_ID`] → 网站不再读取它，多留无效果。API 进程仍使用自己的该变量。

## Migration Plan

先部署已包含 `GET /packs/me/quota` 的 API，再发布网站。网站发布时不必再配置 `PACK_TRENDING_OWNER_USER_ID`。回滚网站提交后，勾选恢复为本地计数加 meta；此时 API 的名额接口可以继续留着。不迁移数据。
