## Why

站点需要在用户同意分析之后，用 GTM 看清搜索需求、软件安装、Pack 安装、分享和广告点击。软件安装和 Pack 安装分成两条事件。分享用同一条事件，类型区分软件和 Pack。

## What Changes

- 使用 `utils/gtm.js` 的推送函数，在动作成功后写入 `dataLayer`：`ws_search`、`ws_app_install`、`ws_pack_install`、`ws_share`、`ws_ad_click`。`ws_share` 用 `share_type` 区分 `app` 和 `pack`。生成页的安装记为 `ws_pack_install`，`pack_id` 固定为 `generate`。
- 未取得分析同意时不推送这些事件，也不推送已有的 `ws_page_loaded`。同意未知或被撤回都视为未同意。
- 每条记录只带该事件的字段。搜索第一页失败时仍推搜索词，不带结果数；零结果的 `result_count` 为 0。
- 不改广告链接上的 `utm_*`，也不改其它统计管道。
- GTM 容器里的触发器、GA4 标签和报表不在本变更中定义。更换容器只改容器 ID。

## Capabilities

### New Capabilities

- `gtm-event-tracking`: 分析同意之后的 GTM 事件字段，以及搜索、软件安装、Pack 安装、分享、点击广告这些接入点。

### Modified Capabilities

无。

## Impact

- **推送函数**：`utils/gtm.js`。同意与否看 `Osano.cm.analytics`。
- **搜索**：`pages/apps.js`，在一次新的合格全局搜索的第一页结束后推送。
- **软件安装**：`components/AppDetailView.js` 复制命令或下载安装包。事件为 `ws_app_install`。
- **Pack 安装**：`components/InstallDrawer.js` 与 `pages/generate.js` 上的复制和下载。事件为 `ws_pack_install`。生成页的 `pack_id` 固定为 `generate`。
- **分享**：`components/PackShareCard.js`、`components/AppDetailView.js`、`components/SingleApp.js`。同一条 `ws_share`，`share_type` 为 `pack` 或 `app`。
- **广告**：`components/homeCarousel.js` 与 `components/DonateCard.js`。
