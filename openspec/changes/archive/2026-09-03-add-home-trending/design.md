## Context

动机见 proposal.md。约束见仓库根目录 `AGENTS.md` 与 `openspec/config.yaml`。

首页 ISR 加载 `/apps` 总数以及两侧周榜。广告只能在客户端挑选：`pickAd` 依赖 `sessionStorage`，服务端返回 null。

公开周榜已存在：`GET /apps/trending`、`GET /packs/trending`（匿名、物化周榜、无榜时 `data` 为空）。视觉参考 `.demo/discover.html`。本 change 跟其结构：**不渲染 Popular Apps**，Pack 卡对齐 demo 渐变头布局，不像素复刻 3 列 rail。`data/popularApps.json` 仍供 `AppIcon` 本地精选图使用，首页不再读取或补全该列表。

本仓 **OpenSpec schema** 要求 change 根目录有 `design.md`。`AGENTS.md` 规定归档后架构落在 `openspec/specs/**/design.md`。归档本 change 时，将本文件复制为 `openspec/specs/home-trending/design.md`（kebab-case 能力目录，符合手册文件约定）。change 期间不在主 `openspec/specs/` 预建该文件，以免未落地能力出现空壳。

本仓现有 React 组件多为 PascalCase（如 `PackPreview.js`）。**本 change 新增文件**按 `AGENTS.md` 使用 lowerCamelCase，不重命名旧文件。

## Goals / Non-Goals

**Goals:**

- ISR 接入两个 trending GET，不与生成脚本耦合。
- 混合轮播：SSR 第 1 名来自 App 榜 `[0]`；广告幻灯片客户端从现有池挑选。
- 删除 Featured Packs 拉取与仅首页使用的推荐组件。
- 首页不渲染 Popular Apps，也不再为该块做 ISR 补全。
- 新增标识符符合 lowerCamelCase / `UPPER_SNAKE_CASE` / API kebab-case。

**Non-Goals:**

- 改 winstall-api、cron 或排序口径。
- 详情页 Trending 标记（见 `detail-engagement` delta）。
- 新路由 `/trending`。
- 为符合 AGENTS 而重命名既有 PascalCase 组件。

## Decisions

### 1. ISR 拉两侧榜，失败当空数组

`getStaticProps` 与现有 `/apps` 并行请求 `fetchWinstallAPI('/apps/trending')` 与 `fetchWinstallAPI('/packs/trending')`。无 `apiBase`、非 OK、或没有 `data` 数组 → 该侧为 `[]`。trending 失败 MUST NOT 写入首页 `error`（`/apps` 失败仍会整页错误，行为保持原样）。

**备选：** 首屏后再客户端拉。否决：周快照适合 ISR，与其它首页数据一致。

### 2. 匿名 helper，无 JWT

新增 `fetchAppTrending` / `fetchPackTrending`（lowerCamelCase），放在现有 API helper 旁（v1 不传 `limit`；接口默认返回过滤后全榜，最多 20）。路径保持公开；`fetchWinstallAPI` 已不会为它们附加 Bearer。

### 3. 卡片映射到现有 UI，新文件 lowerCamelCase

- **Apps：** 不用 `PrettyApp`（依赖精选 `img`）。新组件 `components/trendingApps.js`：对齐 `.demo/discover.html` 扁平卡——4 列网格（最多 20）、hover 显示勾选（同 PrettyApp）、`#N` 名次、图标 + 名称/发布者、窗口计数中点分隔。`AppIcon` hydrate；加入/移除走选择上下文；身份链到详情。样式 `styles/trendingApps.module.scss`。计数用窗口 `likes` / `downloads` / `views`（`components/trendingCounts.js`），不用终身 `likeCount` / `downloadCount`。
- **Packs：** 新组件 `components/trendingPackCard.js`（由 `trendingPacks.js` 渲染），对齐 `.demo/discover.html`：渐变头（`#N this week`、标题、描述、窗口计数）、内含 App 行；整卡链接到 Pack 详情（无单独 View Pack）。`name` / `description` 映射为标题与描述。渐变按 `rank` 轮换固定色板，不依赖 API 主题字段。缺图标时用 `FiPackage` / `AppIcon` 占位。不做 Featured 那种逐个 `/apps/:id` 补全。

**备选：** 复用现有 `PackPreview` / 横滑名次行。否决：用户要求与 discover demo 卡片一致。

### 4. 轮播替换首页独立广告卡

保留介绍区。轮播放在今日首页 `DonateCard` 的位置。新组件 `components/homeCarousel.js`，样式 `styles/homeCarousel.module.scss`。幻灯片：

1. 若存在 `trendingApps[0]`，第 1 名（文案对齐 demo：`#1 this week`，GET/ADDED 绑定选择集）。
2. 挂载后一张广告：`pickAd` + `buildAdHref(..., "home")`（与今日相同的 session 粘性 id）。

两张都没有则不渲染轮播。允许只有一张。点、箭头、自动播放可参考 demo，不写入 spec。

其它 `placement` 仍可用现有广告卡组件；首页 MUST NOT 再挂独立首页广告卡。

### 5. 删除 Featured Packs 与首页 Popular Apps

去掉 `recommended` props、首页上的公开 packs 全量拉取、`NEXT_OFFICIAL_PACKS_CREATOR` 在首页的使用，以及仅被首页引用的推荐组件及其 module SCSS。Pack sitemap 与 `/packs` 不变。首页 MUST NOT 挂 `PopularApps`；`getStaticProps` MUST NOT 再 shuffle / 逐个补全 `popularApps.json`。

### 6. 文案

不要在前端用「今天往前 6 个日历日」拼窗口。副标题可用 `generatedAt` 或静态「this week」。不要写 most added。

## Risks / Trade-offs

- [未跑 `trending:generate` 则空榜] → 藏周榜板块；介绍区仍可用。
- [预览卡弱于 demo pack 卡] → 已改为 demo 式渐变头卡。
- [广告幻灯片晚于 SSR 第 1 名] → 可能先一张再两张；优于服务端随机广告（会丢掉 session 粘性）。
- [Pack snapshot 图标稀疏] → 预览可能走占位图标；v1 不再打目录。
- [新增 lowerCamelCase 组件与旧 PascalCase 并存] → 仅约束本 change 新文件；归档说明里写清。

## Migration Plan

只发 Web。若旧 API 对 trending 返回 404，两块保持隐藏。回滚：回退 Web；Featured Packs 除非一并回退，否则保持删除（本来就未展示）。归档时把本 `design.md` 放到 `openspec/specs/home-trending/design.md`。
