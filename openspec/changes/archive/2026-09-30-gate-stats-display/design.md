## Context

见 `proposal.md` 的 Why。现状：货架终身三项经 `components/appListCounts.js`，周榜经 `components/trendingCounts.js`，`/packs` 的 `PackCard` 与 Add Apps 的 `AddAppPickerCard` 复用货架计数。App 详情 `components/AppDetailView.js` 与 Pack 详情 `pages/packs/[id].js` 用 `hooks/useResourceEngagement.js` 请求 stats，再画出浏览与下载次数。Like 走同一 hook 里的 `GET …/like`，与 stats 分开。`pages/_document.js` 已把运行时 `WINSTALL_API_BASE` 写进 meta，浏览器不读 `NEXT_PUBLIC_*`。旧开关 `WINSTALL_SHOW_VIEWS_INSTALLS` 已删除。首页 Featured Packs 当前不画计数。

## Goals / Non-Goals

**Goals:**

- 一个运行时布尔开关，默认关，控制所有已展示的浏览 / 下载 / 点赞数字。
- 关时详情页不请求 stats；Like 请求与按钮保留。
- 开时各表面保持现有阈值、缺省 0 与紧凑格式。

**Non-Goals:**

- 不让 Featured Packs 在开关打开后开始展示计数。
- 不改计数格式、不改 track 上报、不改 Like 交互。
- 不把开关做成用户可点的界面控件。

## Decisions

### 1. 变量名与取值

**选择：** `WINSTALL_SHOW_STATS`。`1` 与 `true`（忽略大小写）为开。未设置、空白、`0`、`false` 以及其它值均为关。

**理由：** 与现有 `WINSTALL_*` 运行时变量一致，默认关满足「未配置即不展示」。

**备选：** 恢复 `WINSTALL_SHOW_VIEWS_INSTALLS`。否决：旧名只覆盖详情的浏览与安装，且规范已要求不再使用它。

### 2. 经文档 meta 交给浏览器

**选择：** 服务端在 `pages/_document.js` 写入 meta（例如 `winstall-show-stats`），内容为 `1` 或 `0`。浏览器经一个小 helper 读该 meta。MUST NOT 使用 `NEXT_PUBLIC_WINSTALL_SHOW_STATS`。

**理由：** 与 `WINSTALL_API_BASE` 相同，容器启动时改 `.env` 即可，不必为开关重新构建。ISR / SSR 生成 HTML 时 meta 带上当时的运行时值。

**备选：** 每个页面 `getStaticProps` 传 prop。否决：计数出现在多页与弹窗，漏传一处就会在默认关时仍画出数字。

### 3. 在展示入口挡掉，而不是改接口

**选择：** `AppListCounts` 与 `TrendingCounts` 在开关关闭时返回 `null`。`PackCard` footer 只留相对时间。详情页在开关关闭时不调用 `loadStats` / `fetchAppStats` / `fetchPackStats`，也不渲染浏览·下载文案。`loadLike` 保持不变。

**理由：** 货架与周榜的数字已在列表 payload 里，不需要额外请求，不画即可。详情的数字只来自 stats 请求，关掉展示就不应再打 `GET /apps/:id/stats` 与 `GET /packs/:id/stats`。

**备选：** 开关关闭时仍请求 stats 但隐藏。否决：多一次无用请求，也和 spec 不符。

### 4. 打开后不改各表面的既有规则

**选择：** 开关打开时，货架与 Pack 列表仍展示三项且缺省为 0；Trending Apps 仍只展示大于或等于 `100` 的项；Featured Packs 与首页轮播若无计数则继续不画。格式仍走 `formatCount`。

**理由：** 本 change 只加总闸，不重开已经关掉的 Featured Packs 计数，也不放宽周榜阈值。

## Risks / Trade-offs

- **[Risk] 静态页在构建时没有该变量，meta 冻成关。** → Mitigation：与 API origin 相同，依赖 ISR / 运行时再验证；部署后第一次再验证才会带上新值。在 `.env.example` 写明默认关。
- **[Risk] 某处直接画了 `viewCount` 而没走上述入口。** → Mitigation：实现时搜 `viewCount`、`formatCount(stats` 与 `AppListCounts`，把展示都收进开关。
- **[Trade-off] 关时货架仍下载带计数字段的列表。** 接受。字段本来就在列表响应里，不为开关拆接口。

## Migration Plan

在 `.env.example` 增加注释掉的 `WINSTALL_SHOW_STATS=0`。已有环境不改 `.env` 即保持关闭。要展示时设为 `1` 并让相关页面再验证。回滚：去掉 meta 与展示判断，恢复始终绘制。

## Open Questions

无。
