## Context

约束见仓库根目录 `AGENTS.md` 与 `openspec/config.yaml`。动机见 `proposal.md`。行为见 `specs/app-card-engagement/spec.md` 与 `specs/detail-engagement/spec.md`。

货架列表（`GET /apps`、`GET /apps/categories/:id`、`GET /apps/search`、`GET /publishers/:id`）已在 `data[]` 平铺终身 `viewCount` / `downloadCount` / `likeCount`。首页周榜用窗口 `views` / `downloads` / `likes`，由 `components/trendingCounts.js` 渲染。`SingleApp` 被分类页、`/apps`、`Search.js`、`PackAppsList` 共用。Pack 详情走 `PackDetailAppCard` + `GET /apps/:id`，不在本设计改造。

## Goals / Non-Goals

**Goals:**

- 在既有 `SingleApp` 上贴一行只读终身计数，所有现有调用点自动带上。
- 字段映射与周榜 helper 分开，避免窗口字段和「this week」文案漏进货架。
- 新增文件 lowerCamelCase；不重命名 `SingleApp.js`。

**Non-Goals:**

- 改 winstall-api、清 Redis 页缓存、新增 `GET /apps?ids=`。
- Pack 详情卡、`RelatedAppCard`、Like 写路径。
- 按 0 隐藏计数项。

## Decisions

### 1. 从列表 item 读终身字段，不读窗口字段

**选择：** `utils/appListCounts.js` 导出 `readAppListCounts(app)`，只认 `viewCount` / `downloadCount` / `likeCount`，缺省为 0。MUST NOT 回退到 `views` / `downloads` / `likes`。

**理由：** 周榜 payload 同时带窗口三项和部分终身字段；混读会把首页语义带进货架，或把窗口数当成终身。

**备选：** 复用 `readTrendingCounts` — 否决，key 不同且语义是窗口。

### 2. 新计数行组件，不复用 `trendingCounts`

**选择：** `components/appListCounts.js` + `styles/appListCounts.module.scss`。图标可同 Feather（`FiEye` / `FiDownload` / `FiThumbsUp`），顺序 views → downloads → likes。`aria-label` 用终身含义（例如 views, downloads, and likes），MUST NOT 写 this week。数字用既有 `formatCount`。

**理由：** `trendingCounts` 的无障碍文案和 `onHead` 样式绑在周榜上。货架卡密度不同，分开改更安全。

**备选：** 给 `TrendingCounts` 加 `variant` — 能少一个文件，但容易把周榜文案改漏。

### 3. 紧凑卡对齐 trending，描述最多两行

**选择：** 非 `large` 的 `SingleApp` 用 trending 式身份区（48px 图标瓷片、名称、发行商），描述 CSS 限制两行，不展示 version，计数行放在描述之后（`inline` 分隔）。`pack={true}` 时没有描述，行仍出现。`large` 仍保留完整 meta（含 version），计数不替代详情页 stats。

**理由：** 货架卡要对齐周榜密度；version 对浏览帮助小，长描述会把格子撑高。

**备选：** 只藏 version、保留旧标题/meta — 密度仍明显高于 trending。

### 4. 不为卡片补打 stats 或批量详情

**选择：** 只渲染当前 `app` 对象上的字段。Pack 快照没有这三项时显示 0。

**理由：** 分类页一页可到 56 张卡；`GET /apps/:id` 也不带这三项。批量详情本 change 不做。

**备选：** 逐卡 `GET /apps/:id/stats` — 否决。

## Risks / Trade-offs

- **[Risk] `GET /apps?offset=0&limit=…` 命中重启前的 Redis 页缓存，All / `/apps` 首页暂时没有字段。** 缓解：Web 缺省当 0；缓存过期后自动正确。不在本 change 清 Redis。
- **[Risk] Pack 编辑列表长期全 0。** 接受；与规范「缺字段当 0」一致。
- **[Risk] 同一应用在首页周榜与货架数字不同。** 接受；一个是窗口，一个是终身。
- **[新增 lowerCamelCase 与旧 PascalCase 并存]** 仅约束本能力新文件。

## Migration Plan

- 只发 Web。回滚：撤 `SingleApp` 计数行及相关新文件。
- 不改 API，不迁数据。

## Open Questions

无。
