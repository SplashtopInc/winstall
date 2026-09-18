## Context

约束见仓库根目录 `AGENTS.md` 与 `openspec/config.yaml`。需求见同目录 `spec.md`。

`pages/packs/index.js` 无 `tab` 时 `activeTab` 为 `mine`。Public 用 `PACKS_PER_PAGE = 24` 信封追加。`PackCard` 为 Hub 轻卡：stack 身份、可选描述、最多 6 个 app 图标预览、相对时间与终身三连 counts。

## Goals / Non-Goals

**Goals:**

- Public 追加加载与 `/category` 同一心智，不新增 list API。
- 列表卡扫描路径对齐 Hub / SingleApp：身份 → 说明 → 精简 meta。

**Non-Goals:**

- 改默认 tab、shallow 写 `tab`/`q`、加页头标题。
- Pack 详情、首页 `trendingPackCard`、Add Apps 弹窗。
- My Packs 分页、虚拟列表、客户端排序。
- 新的作者目录接口。

## Decisions

### 1. Public 用信封追加，每批仍 24

**选择：** 首屏 `offset=0&limit=24`。Load more 用已展示 `length` 作下一 offset，`concat` 到列表。`shown.length >= total` 时隐藏按钮。去掉 `PublicPacksList` 的 Pagination、apps 分页样式、以及 `document` 左右键监听。搜索 debounce 仍约 300ms。

**理由：** 与 `/category`、Add Apps 一致。Pack 卡仍比 app 卡高，24 比 56 更合适。不改 `GET /packs` 契约。

**备选：** 保留 Prev/Next——与分类货架相反。改 limit 为 56——一屏过密。

### 2. 搜索 `q` 只在页内

**选择：** 搜索 `q` 只存在 React state。满 3 字符才打 `GET /packs?q=`。1–2 字符只提示、不发请求。保留对地址栏 `q`/`page` 的忽略或剥除。空命中提供清空。默认 tab 仍为 My。进入时可读 `tab=mine` / `tab=public`；点击切换只改页内状态，MUST NOT shallow 写 `tab` 或 `q`。

**理由：** 把 `q`/`tab` 当可分享路由不适合本页。`/apps?q=` 才是目录级搜索。

**备选：** 把 `q` 写入 URL——刷新能恢复搜索，但污染历史、和现网剥 query 相反。

### 3. Hub 轻卡：stack 身份 + 短图标预览

**选择：** 左上用固定 pack/stack 符号（Feather `FiPackage`），不用首个 app 图标当 avatar。描述与 footer 之间保留最多 6 个 app 图标预览；溢出用 `+N`。无 app 时不渲染该行。应用数用 `apps.length` 或列表上的 `appCount`。作者读取条目上已有字段（`creator`/`user`/`author` 展示名）；没有就省略。

**理由：** 纯文字轻卡信息层级正确但视觉偏空；图标条补「合集」内容感，同时身份区仍用 stack 符号，避免误读成单个 app。

**备选：** 完全去掉图标条——扫描干净但单调。用首 app 当 avatar——省事但语义错。

### 4. Footer：相对时间 + 三连 counts

**选择：** 相对时间复用现有 `timeAgo`。去掉 “Last updated {日历日期}”。`AppListCounts` 与时钟同一行、同一级小灰 meta。计数仍终身三项，格式走 `engagement-count-format`。

**理由：** 时间与三连都留。相对时间对齐 Hub 参考，三连保持站内互动语言。

**备选：** 只留 downloads——丢 views/likes。日历日期——行宽浪费、不像 Hub。

### 5. My 文字徽章；Public 不展示可见性

**选择：** `showVisibility` 为 true 时用 private/public 文字徽章，不用锁/地球塞进标题。Public 继续 `showVisibility={false}`。

**理由：** 参考图没有状态图标抢标题。Public 列表全是公开合集，徽章多余。

## Risks / Trade-offs

- **[Risk] 图标条与次行应用数信息重叠。** → Mitigation：图标作视觉预览，数字作精确规模；可接受。
- **[Risk] 列表无作者字段导致无作者行。** → Mitigation：有则示、无则省略。
- **[Risk] Load more 后滚动跳动。** → Mitigation：只 concat，不 `scrollTo(0,0)`。
- **[Trade-off] `/apps` 仍翻页、Packs Public 改追加。** → 与分类页一致。

## Migration Plan

只发 Web。回滚：恢复 Prev/Next 与旧固定高度卡。
