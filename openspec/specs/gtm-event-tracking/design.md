## Context

站点已经加载 GTM，路由完成后推送 `ws_page_loaded`。Osano 在 GTM 片段之前加载。`utils/gtm.js` 用 `GTM_EVENT`、`GTM_FIELD`、`GTM_VALUE` 统一管理事件名、字段和枚举，并在 `Osano.cm.analytics` 不为 `true` 时不写 `dataLayer`。搜索、软件安装、Pack 安装、分享和广告点击在成功动作后调用对应推送函数。

事件字段和排除场景以 `openspec/specs/gtm-event-tracking/spec.md` 为准。

## Goals / Non-Goals

**Goals:**

- 五个事件各在一次成功动作后出现一条 `dataLayer` 记录。
- 未同意、尚未选择、撤回同意时不推送，也不补推同意前的动作。
- 同一次动作只产生一条对应事件，且不把上一条事件的字段带到下一条。

**Non-Goals:**

- 不在 GTM 容器里配置触发器、GA4 事件代码或自定义维度。
- 不改广告链接上的 `utm_*`。
- 不改其它统计管道，也不把现有导出统计回调挪到剪贴板成功之后。
- 不统计只打开分享卡片、Pack 浏览、收藏或广告曝光。

## Decisions

### 1. 同意未明确就视为未同意

分析同意看 `Osano.cm.analytics`。该值为 `true` 时才推送。函数不补推同意之前的动作。

**备选**：动作照常推送，由 GTM 的同意模式决定标签发不发。未采纳，因为未同意时这些事件不应进入 `dataLayer`。

### 2. 搜索等第一页结束再推

在结果页确认这是一次新的合格全局搜索，并且第一页请求已经结束时推 `ws_search`。成功带上结果数，失败不传结果数。不在搜索框按下回车时推。

**备选**：提交瞬间就推。未采纳，因为那时还不能区分失败和零结果。

### 3. 软件安装和 Pack 安装分成两条事件

详情页推 `ws_app_install`。生成页和 Pack 安装抽屉推 `ws_pack_install`。两边都带 `install_action`、`install_format`、`command_type`、`app_count`。软件事件一次一个应用，带 `app_id`。一行 winget 命令的格式是 `command`，并带 `has_version`。`upgrade` 只属于这条命令。Pack 记录带 `pack_id`，不带 `app_id` 和 `has_version`，也不使用 `command` 格式。生成页没有真实 Pack，`pack_id` 固定为 `generate`，用 `app_count` 表示这一批有几个软件。已有 Pack 的 `pack_id` 为该 Pack 的标识。

复制要等剪贴板成功。现有导出统计回调留在原地。同一次「下载并复制」只推一条 `download`。

**备选**：一条 `ws_install` 再用类型区分软件和 Pack。未采纳，因为软件安装和 Pack 安装要分开看。

### 4. 分享用同一条事件

软件和 Pack 都推 `ws_share`。`share_type` 为 `app` 或 `pack`。软件写 `app_id`，Pack 写 `pack_id`，不同时写两个标识。渠道仍是 `link`、`badge`、`x`、`facebook`、`linkedin`。

**备选**：`ws_share_app` 和 `ws_share_pack` 两条事件。未采纳，因为传播要放在同一张报表里按类型拆开。

### 5. 广告在出站链接激活时推

首页轮播位置为 `home-carousel`。`DonateCard` 使用它已有的位置：`apps-list`、`app-detail`、`pack-list`。不改链接上的 `utm_*`。

### 6. 事件名、字段和枚举只在一处定义

`utils/gtm.js` 导出三份注册表：`GTM_EVENT`、`GTM_FIELD`、`GTM_VALUE`。推送函数和页面埋点都引用它们，不在调用点另写一份事件名或枚举字符串。改一个 key 只改注册表。

`GTM_EVENT` 写入 `dataLayer` 的事件名一律带 `ws_` 前缀，例如 `ws_search`、`ws_app_install`。对象 key 仍用 `lowerCamelCase`。字段名不加此前缀。

**备选**：每个调用点直接写 `"ws_search"`、`"home-carousel"` 这类字面量。未采纳，因为事件一多就会和推送函数里的字符串分叉。

### 7. 更换容器不改变契约

事件名和字段不包含容器 ID。以后更换 GTM 容器只替换加载片段中的 ID。

## Risks / Trade-offs

- [GTM 片段仍会在同意前加载，容器里的自动网页浏览标签可能照常触发] → 本变更只约束站点自己推送的事件。容器标签由 Osano 或 GTM 同意设置拦住。
- [复制脚本时 GTM 与现有导出统计的时机不同] → 这是有意的。原有统计仍按原回调，GTM 只代表复制成功。
- [分类页广告的位置值是 `apps-list`] → 与 Apps 列表共用该值。需要拆开时用推送里的 `page_path`。
- [搜索词会进入分析工具] → 只推 trim 后、最多 300 字的词，不推用户标识或令牌。
- [外站分享无法确认用户是否发成功] → `x`、`facebook`、`linkedin` 表示站点打开了分享窗口。

## Migration Plan

没有数据迁移。撤回时去掉五个调用点即可。`utils/gtm.js` 可以留着。

## Open Questions

无。
