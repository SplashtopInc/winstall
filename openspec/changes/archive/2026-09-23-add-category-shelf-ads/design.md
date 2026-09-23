## Context

见 `proposal.md` 的 Why。现状：`pages/category.js` 的 `.grid` 只渲染 `SingleApp`；`PAGE_SIZE` 为 56，四列（窄屏变为自适应列数）。`pages/apps.js` 在 `index % 15 === 0` 时于应用后插入 `DonateCard`（`placement="apps-list"`）。`pickAd` 依赖 `sessionStorage`，服务端与首屏得到 null。分类网格的单元格是外层 `<li>`，`SingleApp` 自身也是 `<li>`。

约束见仓库根目录 `AGENTS.md` 与 `openspec/config.yaml`。行为见同变更 `specs/category-browse/spec.md`。归档后本节决定并入 `openspec/specs/category-browse/design.md`。

## Goals / Non-Goals

**Goals:**

- 分类网格用与 `/apps` 相同的下标节奏插入单格广告。
- 没有广告时不留空格；Load more 与换分类不打乱下标定义。

**Non-Goals:**

- 不改 `data/ads.json`、`pickAd` 的会话粘性，或 `utm` 规则。
- 不改首页轮播、`/apps`、Pack 列表、App 详情。
- 不把广告改成横跨整行。

## Decisions

### 1. 下标沿用已展示应用数组

**选择：** 对 `apps.map` 的 `index` 判断 `index % 15 === 0`，广告渲染在该应用的外层 `<li>` 之后。Load more 只追加数组，下标自然延续。换分类替换数组，下标从 0 再计。间隔写成常量 `SHELF_AD_INTERVAL`（值为 15），与页面已有 `PAGE_SIZE` 放在一起。

**理由：** 与 `pages/apps.js` 同一条件。56 个应用命中下标 0、15、30、45，共 4 张；60 格可被 4、3、2 整除，桌面四列与 1280px 以下常见列数都能排满。

**备选：** 每批 Load more 从 0 重计。否决：第二批会紧挨着上一批末尾再插一张，节奏和满行都会断。

### 2. 没有广告就不挂格子

**选择：** 分类页用一次 `useRandomAd("apps-list")`。返回 null 时不渲染广告格。返回广告后，每个命中下标渲染一个 `<li>`，格内复用 `DonateCard` 的展示（`addMargin=""`，`placement="apps-list"`）。`DonateCard` 若仍内部再选一次，会话键相同，创意一致。

**理由：** `DonateCard` 在效果运行前返回 null。外层若无条件包 `<li>`，空 `<li>` 仍占一格，满批不再是 60 格。

**备选：** 无条件插入 `<li><DonateCard /></li>`。否决：首屏与无启用广告时会空出格子。

### 3. 广告格拉满一行高

**选择：** 在 `styles/categoryPage.module.scss` 让广告格与应用格一样成为网格项，内容宽高 100%。不新增广告组件文件。

**理由：** 分类网格靠 `> li` 拉伸子项；广告必须是并列的 `<li>`，而不是塞进应用卡内部。

## Risks / Trade-offs

- [广告在客户端选出后才插入，网格会后移] → 与 `/apps` 相同；不在服务端随机，以保住会话粘性。
- [同一会话四格是同一条创意] → 接受；用户要求沿用现有挑选。
- [不足 15 的倍数时最后一行不满] → 接受；只保证满批 56 条为 60 格。
- [分类页与 `/apps` 的 `utm_content` 都是 `apps-list-a`] → 按产品决定合并统计，不新增货位名。

## Migration Plan

只发 Web。回滚：去掉分类网格中的广告格。无数据迁移。
