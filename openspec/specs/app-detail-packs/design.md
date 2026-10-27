## Context

需求见同目录 `spec.md`。

`GET /apps/:id/packs` 已由 winstall-api 提供。匿名，无登录中间件。成功体为 `{ total, offset, limit, data }`。每条只有 `_id`、`name`、`description`、`appCount`。过滤为 `apps.appId` 命中且 `visibility` 为 `public`。顺序为 `sortBoost`、`popularityScore`、`createdAt`，分数不出现在响应里。未传 `limit` 时默认 100。`sort` 被忽略。未知 App 返回 200 且 `data` 为空。

网站侧：`pages/apps/[id].js` 在正文下先挂同发行商，再挂相关应用，最后挂包含该应用的热门 Pack。同发行商与相关应用都在浏览器里请求，失败或为空则整块不留。`fetchWinstallAPI` 对 `GET /apps/:id/packs` 既不强制也不可选地附 session JWT。`PackCard` 在有快照时画图标条，footer 画相对时间，统计开关打开时把缺失计数画成 0。详情静态数据会裁字段，避免超过页面数据体积上限。

## Goals / Non-Goals

**Goals:**

- 在已找到应用的详情上，用一条匿名 `limit=4` 请求画出最多四张轻卡。
- 轻卡只复用合集身份和两行描述的外观，不复用 `PackCard` 的图标条、时间和计数。
- 失败、空列表与详情骨架互不影响。

**Non-Goals:**

- 不改 winstall-api，不补 `updatedAt` 或 app 快照。
- 不改 `/packs` 列表卡、首页 Featured Packs、Pack 详情。
- 不做查看全部，不新增列表路由。
- 不把这次读取放进 `getStaticProps`。

## Decisions

### 1. 浏览器在应用就绪后请求

区块组件在 `pages/apps/[id].js` 里放在 `RelatedApps` 之后，且只在非骨架且应用已找到时挂上。组件内 `useEffect` 调用 `fetchWinstallAPI('/apps/${id}/packs?limit=4')`。不传 `sort`，不传 `offset`。不把该路径加入 `requiresUserJwt` 或 `prefersOptionalUserJwt`。

路径段使用应用 `_id`。需要编码时用 `encodeURIComponent`，让 API 收到解码后的公开标识。

**理由：** 成员关系比目录变得勤，失败不能让详情静态生成失败。现有相关区块已经是这条挂法。默认 `limit` 为 100，调用处必须写上 4。

**备选：** 放进 `getStaticProps`。体积、失败和更新频率都不合适。

### 2. 新轻卡，不渲染 PackCard

新增 `components/appDetailPacks.js` 与 `components/appDetailPackCard.js`。样式放在 `styles/appDetailPacks.module.scss`。身份区沿用合集符号、单行名称和 `{n} app` / `{n} apps`。描述固定两行高度。整卡是指向 `/packs/:id` 的链接。不渲染图标条、时钟、计数、作者和可见性。

网格与详情相关区一致：桌面 4 列，窄屏 2 列。标题为 `Packs with this app`。加载中可以只留标题。`data` 为空或请求失败时组件返回 `null`。`data` 超过 4 条时只取前 4 条，不排序。

**理由：** 这份响应没有 `apps[]`、`updatedAt` 和三项计数。套进 `PackCard` 会在开关打开时画出 0，没有时间时画出破折号。

**备选：** 给 `PackCard` 加隐藏图标和时间的开关。会把列表卡的规格和这次轻卡绑在一起。

### 3. 用纯函数锁住条数和数量文案

`utils/appDetailPacks.js` 从信封取出 `data`，截到 4 条，并给出 `1 app` 或 `{n} apps`。组件只负责请求和渲染。`test/appDetailPacks.test.js` 覆盖截断、保持原序、单复数和缺 `data`。

**理由：** 页面没有现成的组件测试。条数和文案是这次最容易写错的行为。

**备选：** 只在组件里截断。回归时看不到。

## Risks / Trade-offs

- **[Risk] 忘记 `limit=4` 会拉回默认 100 条。** 缓解：请求字符串和纯函数都截到 4，测试锁住截断。
- **[Risk] 四列里描述长短不一。** 缓解：描述固定两行高度，与列表卡同一做法。
- **[Trade-off] 卡片没有图标条和时间，比 `/packs` 列表卡少一块内容。** 接受。响应里没有这些字段，产品也明确不要。
- **[Risk] 登录态下误把路径当成 `GET /packs/:id` 而附上 JWT。** 缓解：不改 `fetchWinstallAPI` 的路径判断；规格要求匿名。可用现有路径测试确认 `/apps/:id/packs` 不落在强制或可选 JWT 上。

## Migration Plan

只发网站。回滚时去掉详情页上的区块和新增组件，`/packs` 列表不受影响。
