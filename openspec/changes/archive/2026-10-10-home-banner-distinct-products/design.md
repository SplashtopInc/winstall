## Context

见 `proposal.md` 的 Why。现状：`utils/pickAd.js` 的 `pickHomeBannerAds` 对启用池做 Fisher-Yates，取前 2 条，会话键 `winstall_home_banner_ad_ids`。`data/ads.json` 已有 `product`：SBA 与 SRS 各有两条文案，其余产品各一条。货架仍走 `pickAd`，只抽 1 条。

归档后本节决定并入 `openspec/specs/home-trending/design.md`，替换「轮播只播独立抽签的广告」里「无放回最多抽 2 条」的抽法。

## Goals / Non-Goals

**Goals:**

- 一次 banner 结果里每个 `product` 最多一条。
- 各产品入选机会均等；产品内部的文案再均等抽取。
- 同产品的会话缓存作废并重抽。

**Non-Goals:**

- 不改货架 `pickAd`、`DonateCard`、分类页广告。
- 不改 banner 构图、`utm_content`（仍按抽中顺序为 `home-a` / `home-b`）或 `data/ads.json` 的条目。
- 不要求 banner 与货架避开同一产品。两次抽签保持独立。

## Decisions

### 1. 先抽产品，再抽文案

**选择：** 分组键为 `product` 去首尾空白后的字符串。空白或缺失时用该条 `id`，使未填写的广告各自成组。打乱产品键，取前 `min(2, 产品数)` 个；每个产品内再打乱启用文案，取 1 条。产品键的打乱顺序就是幻灯片顺序。

**理由：** 互斥单位是产品。先抽产品让 SBA 与只有一条文案的 AEM 机会相同；组内再抽，两条卖点都还能出现，只是不会同时出现。

**备选：** 在全部合法广告对里均匀抽。否决：多文案产品会比单文案产品更常出现，和「按产品互斥」的曝光单位不一致。

### 2. 同产品缓存丢弃

**选择：** 恢复 `winstall_home_banner_ad_ids` 时，解析出的广告若有两条及以上共享分组键，忽略该缓存并按决策 1 重抽，再写回新的 id 列表。产品互不相同的缓存仍沿用。解析失败、id 已不在启用池、或只剩 1 条时，保持现有行为：能对上的照用，对不上的丢掉，不因此强制凑满 2 条。

**理由：** 只改抽签的话，已经抽到 SBA+SBA 的标签页会一直看到重复，直到会话结束。

**备选：** 等会话自然过期。否决：碰撞会继续被看到。

### 3. 纯函数与会话分开

**选择：** 分组与抽取放在不读 `window` 的纯函数里，随机源可注入。`pickHomeBannerAds` 仍负责 `sessionStorage` 与服务端返回 `[]`。`hooks/useHomeBannerAds.js` 继续调用 `pickHomeBannerAds`。

**理由：** `node --test` 可以不模拟浏览器就覆盖互斥、单产品只出 1 条、空白 `product` 各自成组。

## Risks / Trade-offs

- **[多文案产品的单条曝光下降]** → 接受。产品整体与单文案产品机会相同，文案在组内平分。
- **[已有会话 banner 会变一次]** → 仅当缓存里的 `product` 相同时重抽；合法的一对保持不动。
- **[启用广告很多但只有一个产品]** → 轮播只出 1 张，不编造第二条。

## Migration Plan

只发 Web。已缓存同产品一对的会话，在下次打开首页时重抽。回滚：恢复按广告 id 洗牌并取前 2 条。
