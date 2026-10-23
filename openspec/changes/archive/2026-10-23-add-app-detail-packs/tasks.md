## 1. 列表数据

- [x] 1.1 在 `utils/appDetailPacks.js` 从 `{ data }` 取出条目，保持原序并截到 4 条；`appCount` 为 1 时文案为 `1 app`，其它非负整数为 `{n} apps`
- [x] 1.2 在 `test/appDetailPacks.test.js` 覆盖截断、原序、单复数，以及缺 `data` 时得到空列表

## 2. 轻卡区块

- [x] 2.1 新增 `components/appDetailPackCard.js` 与 `styles/appDetailPacks.module.scss`：合集符号、单行名称、应用数量、两行描述高度；整卡进入 `/packs/:id`。不画应用图标条、时间、作者、可见性或计数
- [x] 2.2 新增 `components/appDetailPacks.js`：应用标识就绪后请求 `GET /apps/:id/packs?limit=4`，不传 `sort` 与 `offset`。加载中可以只留标题 `Packs with this app`。空 `data` 或失败时返回空。桌面 4 列，窄屏 2 列，不用空卡补齐
- [x] 2.3 不修改 `utils/fetchWinstallAPI.js` 的 JWT 判断，使该 GET 保持匿名。不请求 `GET /packs/:id` 或 `GET /packs/:id/stats`

## 3. 挂到 App 详情

- [x] 3.1 在 `pages/apps/[id].js` 中，仅当应用已找到且不在骨架时，把区块放在正文之后、同发行商之前。不写入 `getStaticProps`
- [x] 3.2 不改 `components/PackCard.js`、`/packs` 列表和首页 Featured Packs。不新增查看全部，不改 `/apps/:id` 与 `/packs/:id`
