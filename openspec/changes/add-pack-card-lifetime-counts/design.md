## Context

约束见仓库根目录 `AGENTS.md` 与 `openspec/config.yaml`。动机见 `proposal.md`。行为见 `specs/pack-card-engagement/spec.md` 与 `specs/detail-engagement/spec.md`。

`GET /packs` 与 `GET /packs/me` 已平铺终身 `viewCount` / `downloadCount` / `likeCount`；`GET /packs/:id` 与 `GET /packs/trending` 不含这三项。`PackCard`（250px 高、四列）结构为：标题 → 描述（flex 吃剩余高度）→ app 图标排 → 底栏 Last updated。货架 App 卡已用 `readAppListCounts` + `AppListCounts`（`inline` 中点分隔）。首页 Featured Packs 把窗口计数铺在彩色头图上。

## Goals / Non-Goals

**Goals:**

- 在既有 `PackCard` 底部元信息区贴一行只读终身计数，Explore 与 Mine 自动带上。
- 视觉对齐货架卡，不做成周榜头图指标。
- 复用已有终身字段读取与计数行，不新造窗口语义。

**Non-Goals:**

- 改 winstall-api、改 trending、改 Pack 详情 stats。
- 在卡片上点赞或为列表打 `GET /packs/:id/stats`。
- 按 0 隐藏计数项。
- 本 change 不强制重命名 `AppListCounts`（可把 `pack` 当同一 shape 传入）。

## Decisions

### 1. 计数放在图标排与日期之间，当「事实」而不是「卖点」

**选择：** 卡片叙事保持「这是什么 → 里面有谁」。计数进底栏：图标排之下、Last updated 之上，作为次级元数据。卡片仍保留日期。描述区 `flex: 1` 会略收，固定高度 250px 不必改。

**理由：** 浏览合集时先认身份再看热度。周榜卡把计数放头图，因为那一页的主题就是「这周火」；列表卡主题是「有哪些 pack」，热度不该压过标题和描述。货架 `SingleApp` 也是描述之后再出计数行。

**备选：** 计数替代日期 — 否决，新鲜度对 Mine/公开浏览仍有用。计数与日期挤同一行 — 四列卡太窄。计数进标题旁 — 会和可见性图标抢身份区。

### 2. 视觉复用货架 `AppListCounts` 的 inline 行，不复用 `trendingCounts`

**选择：** 顺序 views → downloads → likes；Feather 眼 / 下载 / 赞；12px、低对比；项间中点。`aria-label` 用终身含义（views, downloads, and likes），MUST NOT 写 this week。数字用既有 `formatCount`。`readAppListCounts(pack)` 即可，字段名相同。

**理由：** 同一产品里「列表终身数」应长得一样，用户才不会把 Pack 列表理解成「本周热度」。`trendingCounts` 绑了 this week 文案和头图样式。

**备选：** 新做一套 Pack 专用大号计数 — 否决，会和周榜抢语义。只显示 downloads — 否决，接口三项齐了，货架已教过用户三件套。

### 3. 只读 payload，缺省为 0

**选择：** 不打 stats。Mine 的 `ownPacks` 缓存若缺字段，显示 0，下次 `GET /packs/me` 后恢复。MUST NOT 为保数字去 merge 旧缓存与新回包（本 change 不做缓存策略）。

**理由：** 与 App 货架一致；写路径回包本来就没有这三项。

## Risks / Trade-offs

- **[Risk] 四列卡底栏变高，描述被挤到两行。** 缓解：计数行约一行 12px；描述本就 clamp。若过挤再减描述行数，不抬卡片高度。
- **[Risk] Mine 缓存短暂全 0。** 接受；与缺字段当 0 一致。
- **[Risk] 与未归档的 `add-app-card-lifetime-counts` 同时改 `detail-engagement` 列表场景。** 两边都是「列表不得用 stats 接口灌数」；归档时按后写入的全文合并，语义兼容。

## Migration Plan

- 只发 Web。回滚：撤 `PackCard` 计数行。
- 不改 API，不迁数据。

## Open Questions

无。展示位置按 Decision 1；实现前若设计要改到「与日期同一行」，只动样式，不改字段与范围。
