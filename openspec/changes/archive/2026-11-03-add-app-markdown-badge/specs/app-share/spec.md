## Purpose

让 App 详情的分享菜单复制一段可粘贴进 GitHub README 的徽章 Markdown。读者点击徽章后打开该 App 的现有详情页。

## ADDED Requirements

### Requirement: 分享菜单在 Copy link 之后提供徽章渠道

App 详情的分享菜单 MUST 按此顺序提供渠道：X (Twitter)、Facebook、LinkedIn、Copy link、Copy Markdown Badge。Copy Markdown Badge MUST 排在 Copy link 之后。能打开该菜单的访问者（含未登录）MUST 能激活它。该渠道 MUST NOT 因登录状态被禁用。其可见文案 MUST 为 `Copy Markdown Badge`，激活之后 MUST 仍保持这句文案。

#### Scenario: 菜单末尾是徽章渠道

- **WHEN** 用户打开 App 详情的分享菜单
- **THEN** 渠道顺序 MUST 为 X (Twitter)、Facebook、LinkedIn、Copy link、Copy Markdown Badge，且最后一项的可见文案 MUST 为 `Copy Markdown Badge`

### Requirement: 复制徽章时关闭菜单并用 toast 反馈

激活 Copy Markdown Badge 后，系统 MUST 关闭分享菜单，并尝试把一行 Markdown 写入剪贴板。写入成功时，系统 MUST 用该详情页已有的 toast 显示 `Markdown copied`。写入失败时，系统 MUST 用同一 toast 显示 `Copy failed`。该次激活 MUST NOT 把 Copy link 的文案改成 `Markdown copied`。

#### Scenario: 复制成功后菜单关闭

- **WHEN** 用户在 App 详情激活 Copy Markdown Badge，且写入剪贴板成功
- **THEN** 分享菜单 MUST 关闭，toast MUST 显示 `Markdown copied`，且 Copy link 的文案 MUST NOT 变成 `Markdown copied`

#### Scenario: 复制失败

- **WHEN** 用户在 App 详情激活 Copy Markdown Badge，且写入剪贴板失败
- **THEN** 分享菜单 MUST 关闭，toast MUST 显示 `Copy failed`

### Requirement: 徽章 Markdown 指向该 App 详情

成功写入剪贴板的内容 MUST 是一行 Markdown 图片链接。替代文本 MUST 为 `Open in winstall`。图片 URL 的路径 MUST 为 `/badge.svg`。链接 URL 的路径 MUST 为 `/apps/` 加上该 App 的公开标识。两个 URL MUST 使用与同一次分享里 Copy link 相同的站点源，且 MUST 为绝对 URL。链接路径 MUST 与 Copy link 使用的 App 标识一致，MUST NOT 使用名称 slug，MUST NOT 使用 `/apps/:id` 以外的页面路径，MUST NOT 附带查询参数。该行 MUST NOT 包含 App 名称，MUST NOT 换行。

#### Scenario: 复制出可粘贴的徽章

- **WHEN** 用户在站点源 `https://winstall.app` 上，对公开标识为 `Git.Git` 的 App 激活 Copy Markdown Badge，且写入剪贴板成功
- **THEN** 剪贴板 MUST 为 `[![Open in winstall](https://winstall.app/badge.svg)](https://winstall.app/apps/Git.Git)`

#### Scenario: 与 Copy link 使用同一站点源

- **WHEN** 用户在某个站点源上对 App 激活 Copy Markdown Badge，且 Copy link 会复制 `https://example.test/apps/Vendor.App`
- **THEN** 徽章 Markdown 中的图片 URL MUST 以 `https://example.test/badge.svg` 为地址，链接 URL MUST 为 `https://example.test/apps/Vendor.App`

### Requirement: 徽章点击打开现有 App 详情

徽章链接打开后，系统 MUST 展示该标识对应的现有 App 详情，包括该页已有的安装与下载操作。系统 MUST NOT 因为这条链接而自动把该 App 加入列表、自动开始下载，或跳到其它页面。

#### Scenario: 从徽章进入详情

- **WHEN** 用户打开徽章 Markdown 中的 `/apps/:id` 链接
- **THEN** 系统 MUST 展示该 App 的现有详情，且 MUST NOT 自动把该 App 加入列表或开始下载
