# gtm-event-tracking Specification

## Purpose

在用户同意分析之后，把搜索、软件安装、Pack 安装、分享和广告点击记成稳定的 GTM 事件。分享用同一条事件区分软件和 Pack。

## Requirements

### Requirement: 未取得分析同意时不推送

站点 MUST 只在用户已经同意分析时，向 `dataLayer` 推送本规格中的事件。同意尚未选择、分析被拒绝，或同意之后又被撤回，都视为未同意。未同意时，站点 MUST NOT 推送 `ws_page_loaded`、`ws_search`、`ws_app_install`、`ws_pack_install`、`ws_share` 或 `ws_ad_click`。用户事后同意时，站点 MUST NOT 补推同意之前已经发生的动作。推送失败或 `dataLayer` 不可用时，对应动作 MUST 照常完成。

#### Scenario: 未同意时复制命令不推送

- **WHEN** 用户尚未同意分析，并在软件详情成功复制安装命令
- **THEN** 命令仍复制成功，且 `dataLayer` 不出现 `ws_app_install`

#### Scenario: 撤回同意后不再推送

- **WHEN** 用户曾同意分析，随后撤回，再成功复制一个公开 Pack 的链接
- **THEN** `dataLayer` 不出现 `ws_share`

### Requirement: 每条推送只携带该事件的字段

已同意时，每次推送 MUST 包含 `event` 和 `page_path`。`page_path` MUST 是当时的路径名，MUST NOT 包含查询串或 hash。该条记录 MUST NOT 保留上一次其它事件专有的字段。推送 MUST NOT 包含用户标识、邮箱、登录令牌、安装命令全文、脚本全文、Pack 标题或 Pack 描述。

#### Scenario: 复制命令之后再搜索

- **WHEN** 已同意的用户先产生一条 `ws_app_install`，再产生一条 `ws_search`
- **THEN** `ws_search` 那条记录包含 `search_term`，且不包含 `app_id`

### Requirement: 页面浏览沿用既有字段

已同意时，客户端完成一次路由后，站点 MUST 推送一条 `ws_page_loaded`。该条记录 MUST 包含 `page_location`、`page_path` 和 `page_title`。`page_location` MUST 是当时的完整地址，`page_title` MUST 是当时的文档标题。

#### Scenario: 同意后的路由推送页面浏览

- **WHEN** 已同意的用户从首页进入 `/apps`
- **THEN** `dataLayer` 出现一条 `ws_page_loaded`，其 `page_path` 为 `/apps`

#### Scenario: 未同意的路由不推送页面浏览

- **WHEN** 未同意的用户从首页进入 `/apps`
- **THEN** `dataLayer` 不出现 `ws_page_loaded`

### Requirement: 合格搜索推送 search

已同意的用户在全局搜索框提交一次新的搜索，并且该次提交打开新的 `/apps?q=` 结果时，站点 MUST 在第一页结束后推送一条 `ws_search`。按下回车且当前没有高亮的应用建议，或点击 “View all results”，都算提交。`search_term` MUST 是 trim 后的提交文本，超过 300 个字符时只保留前 300 个字符。第一页成功时 MUST 包含 `result_count`，零结果为 0。第一页失败时 MUST 包含 `search_term`，且 MUST NOT 包含 `result_count`。同一次提交只有一条。

查询为空、与当前结果地址相同、是 `publisher:` 或 `tags:` 时，MUST NOT 推送。输入建议、回车打开高亮应用、Load more、Add Apps 里的搜索、Pack 内搜索、刷新或直接打开已有的 `/apps?q=`，MUST NOT 推送。

#### Scenario: 搜索成功

- **WHEN** 已同意的用户在全局搜索框提交 `firefox`，当前不在该结果地址，并且第一页返回总数 12
- **THEN** `dataLayer` 出现一条 `ws_search`，`search_term` 为 `firefox`，`result_count` 为 12

#### Scenario: 搜索失败仍保留搜索词

- **WHEN** 已同意的用户提交一次新的合格搜索，第一页请求失败
- **THEN** `dataLayer` 出现一条 `ws_search`，包含 `search_term`，且没有 `result_count`

#### Scenario: 发布者查询不记

- **WHEN** 已同意的用户在全局搜索框提交 `publisher: VideoLAN`
- **THEN** `dataLayer` 不出现 `ws_search`

### Requirement: 软件安装推送 ws_app_install

已同意的用户在软件详情成功复制安装命令或下载安装包时，站点 MUST 推送一条 `ws_app_install`。`install_action` MUST 为 `copy` 或 `download`。`install_format` MUST 为 `command` 或 `installer`。`command_type` MUST 为 `install` 或 `upgrade`。`upgrade` 只允许出现在 `install_format` 为 `command` 的记录上。`app_count` MUST 为 1，并且 MUST 包含该软件的 `app_id`。记录 MUST NOT 包含 `pack_id`。`install_format` 为 `command` 时 MUST 包含 `has_version`：命令带有用户选定版本时为真，否则为假。`installer` MUST NOT 包含 `has_version`，且 `command_type` MUST 为 `install`，`install_action` MUST 为 `download`。

复制一行 winget 命令时，`install_format` MUST 为 `command`，`install_action` MUST 为 `copy`。生成页、Pack 安装界面、复制失败、安装包下载失败、复制分享链接、复制 Markdown 或复制说明页示例命令，MUST NOT 推送这条事件。

#### Scenario: 复制不带版本的安装命令

- **WHEN** 已同意的用户在软件详情的安装页签成功复制一条没有选定版本的安装命令
- **THEN** `dataLayer` 出现一条 `ws_app_install`，`install_action` 为 `copy`，`install_format` 为 `command`，`command_type` 为 `install`，`has_version` 为假，`app_count` 为 1，且带有该软件的 `app_id`，没有 `pack_id`

#### Scenario: 复制命令失败

- **WHEN** 已同意的用户点击复制安装命令，但命令没有写入剪贴板
- **THEN** `dataLayer` 不出现 `ws_app_install`

### Requirement: Pack 安装推送 ws_pack_install

已同意的用户在生成页或某个 Pack 的安装界面成功复制或下载安装内容时，站点 MUST 推送一条 `ws_pack_install`。`install_action` MUST 为 `copy` 或 `download`。`install_format` MUST 为 `installer`、`bat`、`ps1` 或 `json`。`command_type` MUST 为 `install`。`app_count` MUST 为这次包含的软件个数，且至少为 1。记录 MUST 包含非空的 `pack_id`，MUST NOT 包含 `app_id` 或 `has_version`。来自生成页时 `pack_id` MUST 为 `generate`。来自某个 Pack 时 `pack_id` MUST 为该 Pack 的标识。同一次「下载并复制」MUST 只推一条，且 `install_action` 为 `download`。复制失败、安装包下载失败、只打开安装界面或只显示脚本文本，MUST NOT 推送。

#### Scenario: 生成页下载批处理脚本

- **WHEN** 已同意的用户在生成脚本页为一组 6 个软件成功下载 `.bat`
- **THEN** `dataLayer` 出现一条 `ws_pack_install`，`install_format` 为 `bat`，`install_action` 为 `download`，`command_type` 为 `install`，`app_count` 为 6，`pack_id` 为 `generate`，且没有 `app_id`

#### Scenario: Pack 中复制 PowerShell

- **WHEN** 已同意的用户在某个 Pack 的安装界面成功复制 `.ps1`
- **THEN** `dataLayer` 出现一条 `ws_pack_install`，`install_format` 为 `ps1`，`install_action` 为 `copy`，`command_type` 为 `install`，`pack_id` 为该 Pack 的标识，且没有 `app_id`

### Requirement: 分享推送 ws_share

已同意的用户成功分享一个软件或一个公开 Pack 时，站点 MUST 推送一条 `ws_share`。`share_type` MUST 为 `app` 或 `pack`。软件 MUST 带 `app_id`，且 MUST NOT 带 `pack_id`。Pack MUST 带 `pack_id`，且 MUST NOT 带 `app_id`。`share_channel` MUST 为 `link`、`badge`、`x`、`facebook` 或 `linkedin`。复制链接或 Markdown 只有在写入剪贴板成功后才推送。打开 X、Facebook 或 LinkedIn 的分享窗口时推送对应渠道。只打开分享卡片、私有 Pack 上不能使用的分享、复制失败，MUST NOT 推送。

#### Scenario: 复制 Pack 链接

- **WHEN** 已同意的用户把一个公开 Pack 的链接成功写入剪贴板
- **THEN** `dataLayer` 出现一条 `ws_share`，`share_type` 为 `pack`，`share_channel` 为 `link`，`pack_id` 为该 Pack 的标识，且没有 `app_id`

#### Scenario: 复制软件链接

- **WHEN** 已同意的用户把一个软件的链接成功写入剪贴板
- **THEN** `dataLayer` 出现一条 `ws_share`，`share_type` 为 `app`，`share_channel` 为 `link`，`app_id` 为该软件的包标识，且没有 `pack_id`

#### Scenario: 只打开分享卡片

- **WHEN** 已同意的用户只打开分享卡片
- **THEN** `dataLayer` 不出现 `ws_share`

### Requirement: 点击广告推送 ws_ad_click

已同意的用户激活一条广告的出站链接时，站点 MUST 推送一条 `ws_ad_click`。`ad_id` MUST 为该广告的标识。`ad_placement` MUST 为 `home-carousel`、`apps-list`、`app-detail` 或 `pack-list`。`ad_product` MUST 为该广告的产品标识；没有产品标识时使用 `ad_id`。每次激活只推一条。轮播的上一条或下一条、广告仅仅曝光，MUST NOT 推送。广告出站链接上已有的 `utm_source`、`utm_medium`、`utm_campaign`、`utm_content` MUST 保持不变。

#### Scenario: 点击首页轮播广告

- **WHEN** 已同意的用户激活首页轮播中一条广告的出站链接
- **THEN** `dataLayer` 出现一条 `ws_ad_click`，`ad_placement` 为 `home-carousel`，并带有该广告的 `ad_id` 和 `ad_product`

#### Scenario: 切换轮播

- **WHEN** 已同意的用户只按首页轮播的上一条或下一条
- **THEN** `dataLayer` 不出现 `ws_ad_click`
