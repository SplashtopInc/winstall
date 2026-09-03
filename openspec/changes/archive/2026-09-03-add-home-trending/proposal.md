## Why

winstall-api 已提供 `GET /apps/trending` 与 `GET /packs/trending`，首页 Discover 仍只有 curated Popular Apps，没有周榜。Featured Packs 依赖官方 creator 过滤，现网经常为空，板块等于未展示。`.demo/discover.html` 已给出周榜 + 顶部轮播的 Discover 形态，可以接到真接口上。

## What Changes

- 首页增加 **Trending Apps** 与 **Trending Packs**：分别读上述两个公开接口；`data` 为空或请求失败时 **整块不渲染**。
- 首页增加 **轮播**：有周榜 App 时第一张为 `#1 this week`；广告沿用现有 `data/ads.json` 与首页广告规则作为幻灯片。独立首页 `DonateCard` 拿掉，避免广告出现两次。无任何幻灯片时轮播也不渲染。
- **删除 Featured Packs**：去掉首页推荐合集接入、官方 creator 拉包与 `NEXT_OFFICIAL_PACKS_CREATOR` 过滤；不再为首页推荐合集做 SSR 拼装。
- **不展示 Popular Apps**；首页不再为精选宫格拉取或渲染 `popularApps.json`。Pack 周榜用与 `.demo/discover.html` 一致的渐变头卡片。App 周榜用目录 `icon` + 名次行卡。每条 App / Pack 卡片展示该条目窗口 `likes`、`downloads`、`views`。
- 详情页仍不展示 Trending 标记。不做独立 `/trending` 页、不改 API 生成脚本与榜算法。
- 本 change 新增源码文件、变量与函数遵循 `AGENTS.md`：lowerCamelCase；常量 `UPPER_SNAKE_CASE`；API 路径 kebab-case 小写复数。

## Capabilities

### New Capabilities

- `home-trending`: 首页周榜两块、空则藏、demo 式 Pack 卡、顶部轮播（#1 + 广告）、去掉首页独立广告卡。

### Modified Capabilities

- `detail-engagement`: 「Trending is absent」收窄为详情页仍无 Trending 标记；首页周榜不在本能力范围内。
- `pack-api-client`: 首页不再读取或展示 recommended / official Featured Packs；sitemap 等其它 SSR Pack 读仍走 API。

## Impact

- **Web**：`pages/index.js` ISR 增加 trending 读取、去掉 recommended 拉包；新增 lowerCamelCase 组件（如 `homeCarousel.js`、`trendingApps.js`）；删除仅服务首页的 Featured Packs 组件。
- **API**：只消费已有 `GET /apps/trending`、`GET /packs/trending`；匿名、无 JWT。不改 winstall-api。
- **文档**：归档后将该能力的架构落到 `openspec/specs/home-trending/design.md`（`AGENTS.md`）；change 期间以本 change 的 `design.md` 为工作稿。
- **外部**：周榜依赖 API 侧手动生成脚本；未生成时首页没有这两块。
- **非目标**：详情角标、Essentials 信息架构、横滑 3×N 的像素级 demo、周榜专页、重命名既有 PascalCase 组件。
