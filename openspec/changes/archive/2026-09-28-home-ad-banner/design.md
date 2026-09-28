## Context

见 `proposal.md` 的 Why。现状：`components/homeCarousel.js` 拼 `topApp` + Featured pack + `useRandomAd("home")` 一张。`pickAd` 用 `sessionStorage` 键 `winstall_ad_id`，货架 `DonateCard` 共用。`data/ads.json` 已有 `name`。幻灯片高度桌面 260px。广告幻灯片仍是深蓝渐变、无左图栏。

归档后本节决定并入 `openspec/specs/home-trending/design.md`（替换「轮播替换首页独立广告卡」）。

## Goals / Non-Goals

**Goals:**

- Banner 只播最多两张广告，构图对齐产品稿（左图栏 + 三层文案 + 描边 CTA + 科技叠色底）。
- Banner 抽签与货架抽签隔离。

**Non-Goals:**

- 不新增图片文件；左栏使用 `data/ads.json` 已有的 `image` 路径。
- 不改 Trending Apps / Featured Packs 板块。
- 不改货架 `pickAd`、`DonateCard`，也不改 `data/ads.json` 的启用集合。Banner 额外读取已有 `image` 与 `banner-bg`。
- 不改 API。

## Decisions

### 1. 幻灯片只剩广告

**选择：** `homeCarousel` 不再接收/渲染 `topApp` 与 pack。`pages/index.js` 继续把 trending 交给下方板块。无启用广告则 `return null`。

**理由：** Banner 是运营主视觉；周榜已有独立货架。

**备选：** 保留 App/Pack 再叠两张广告。否决。

### 2. 独立无放回抽 2 条

**选择：** 在 `utils/pickAd.js` 增加 `pickHomeBannerAds(ads)`（或同文件并列导出）。键如 `winstall_home_banner_ad_ids`，存两个 id。服务端 / 无 window 返回 `[]`。池不足 2 条则返回能抽到的。`buildAdHref(ad, "home")` 后把 `utm_content` 写成 `home-a` / `home-b`（按抽中顺序）。货架仍走 `pickAd` + `winstall_ad_id` + `home-a` 以外的 placement。

**理由：** 产品指定独立抽签；无放回避免两张同一创意。

**备选：** 复用 `winstall_ad_id` 再抽第二条。否决：会和货架钉死同一条。

### 3. 构图与装饰

**选择：** 固定高 260px。底色用 `start-color` / `end-color`。背景装饰用该条 `banner-bg`，路径规则与 `image` 相同（`assets/ads/banner_bg_purple.svg` → `/assets/ads/banner_bg_purple.svg`）。缺省或空白则不渲染装饰图。左栏 `image` 固定 280×180、圆角 14px；左缘距 banner 48px，右缘距文字区 40px（图片列宽等于图片宽，间距不再被更宽的列吃掉）。图片与文字区在 banner 内垂直居中，文字区高 180px：标题顶对齐图片顶，按钮底对齐图片底。文字区 `max-width` 750px。`name` 26px、字重 700、`#1A1A2E`；`headline` 17px、字重 400、`#1A1A2E`；`body` 14px、字重 400、`#5C5C70`。路径非空时加上站点根前缀（`assets/ads/ad_stb.png` → `/assets/ads/ad_stb.png`）。`image` 缺省或空白则保留空占位。箭头与自动播放可保留。

**理由：** 产品图已经写在 `ads.json` 的 `image`，banner 只负责展示。

**备选：** 继续深蓝 `adSlide`。否决。

## Risks / Trade-offs

- **[启用不足 2 条]** → 展示 1 张或隐藏；不编造第二条。
- **[首屏无广告再出现]** → 与今日相同：客户端 `sessionStorage` 后才有幻灯片。
- **[Purpose 仍写「轮播含第 1 名」]** → 归档时改 `openspec/specs/home-trending/spec.md` 的 Purpose。
- **[某条没有 image]** → 左栏留空占位，不编造图。

## Migration Plan

只发 Web。回滚：恢复 App/Pack 幻灯片与单条 `useRandomAd("home")`。
