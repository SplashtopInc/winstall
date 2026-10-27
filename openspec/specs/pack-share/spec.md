# pack-share Specification

## Purpose

让 Pack 主人在详情页直接打开分享，并把一段可粘贴进 GitHub README 的徽章 Markdown 复制出去。读者点击徽章后打开该 Pack 的现有详情页。

## Requirements

### Requirement: 主人的 Share 紧跟在点赞后面

已登录且为该 Pack 主人时，Pack 详情操作行 MUST 按此顺序展示：Install、Add App、点赞、Share、More。Share MUST 只展示分享图标，MUST NOT 展示可见文案 `Share`，且 MUST 提供可访问名称 `Share`。Share MUST NOT 放在 More 菜单里。激活 Share MUST 打开分享面板，且 MUST NOT 要求 More 菜单处于打开状态。打开 Share 时 More 菜单 MUST 关闭。打开 More 时分享面板 MUST 关闭。

#### Scenario: 主人在点赞右侧看到 Share

- **WHEN** Pack 主人打开该 Pack 详情
- **THEN** 操作行 MUST 依次为 Install、Add App、点赞、Share、More，且 Share MUST 只展示图标，可访问名称 MUST 为 `Share`

#### Scenario: 打开 Share 不经过 More

- **WHEN** 主人激活 Share，且 More 菜单是关闭的
- **THEN** 分享面板 MUST 打开，More 菜单 MUST 仍关闭

### Requirement: 访客没有 Share

非主人（含未登录访客）打开 Pack 详情时，操作行 MUST NOT 展示 Share，MUST NOT 展示 More。主人以外的操作行 MUST 仍为 Install、Add to my packs、点赞。

#### Scenario: 访客打开公开 Pack

- **WHEN** 非主人打开一个公开 Pack 的详情
- **THEN** 页面 MUST NOT 展示 Share 或 More

### Requirement: More 只保留编辑和删除

主人的 More 菜单 MUST 只包含 Edit 和 Delete。MUST NOT 再包含 Share。Edit 与 Delete 的既有行为保持不变。

#### Scenario: 主人打开 More

- **WHEN** 主人打开 More 菜单
- **THEN** 菜单 MUST 包含 Edit 和 Delete，且 MUST NOT 包含 Share

### Requirement: 未公开时五个渠道都不可用

分享面板 MUST 按此顺序提供五个渠道：X (Twitter)、Facebook、LinkedIn、Copy link、Copy Markdown Badge。`visibility` 为 `public` 时，五个渠道 MUST 都可激活。`visibility` 不是 `public` 时，五个渠道 MUST 都不可激活，且 Copy link 与 Copy Markdown Badge MUST NOT 写入剪贴板。既有的「勾选后将该 Pack 设为 public」门槛继续管辖全部渠道，包括 Copy Markdown Badge。公开名额已满、因而不能把该 Pack 设为 public 时，Copy Markdown Badge MUST 保持不可激活。

#### Scenario: 私有 Pack 不能复制徽章

- **WHEN** 主人打开一个 `visibility` 不是 `public` 的 Pack 的分享面板，并激活 Copy Markdown Badge
- **THEN** 该渠道 MUST 不可激活，且剪贴板 MUST NOT 被写入

#### Scenario: 公开后五个渠道可用

- **WHEN** 主人打开一个 `visibility` 为 `public` 的 Pack 的分享面板
- **THEN** X (Twitter)、Facebook、LinkedIn、Copy link、Copy Markdown Badge MUST 都可激活，且 Copy Markdown Badge MUST 排在 Copy link 之后

### Requirement: Copy Markdown Badge 复制固定的一行 Markdown

激活 Copy Markdown Badge 后，系统 MUST 把一行 Markdown 写入剪贴板。该行 MUST 是图片链接：替代文本 MUST 为 `Open in winstall`；图片 URL 的路径 MUST 为 `/badge.svg`；链接 URL 的路径 MUST 为 `/packs/` 加上该 Pack 的公开标识。两个 URL MUST 使用与同一次分享里 Copy link 相同的站点源，且 MUST 为绝对 URL。链接路径 MUST 与 Copy link 使用的 Pack 标识一致，MUST NOT 使用名称 slug，MUST NOT 使用 `/packs/:id` 以外的页面路径，MUST NOT 附带会触发导入或 Fork 的查询参数。该行 MUST NOT 包含 Pack 名称，MUST NOT 换行。

复制成功时，该渠道文案 MUST 变为 `Markdown copied`，且 Copy link 的文案 MUST 保持不变。复制失败时，该渠道文案 MUST 变为 `Copy failed`。空闲文案 MUST 为 `Copy Markdown Badge`。成功或失败文案随后 MUST 回到空闲文案。

#### Scenario: 复制出可粘贴的徽章

- **WHEN** 主人在站点源 `https://winstall.app` 上，对公开标识为 `cJL66qrefbvuG1U7_fZ-h` 的公开 Pack 激活 Copy Markdown Badge，且写入剪贴板成功
- **THEN** 剪贴板 MUST 为 `[![Open in winstall](https://winstall.app/badge.svg)](https://winstall.app/packs/cJL66qrefbvuG1U7_fZ-h)`，且 Copy link 的文案 MUST NOT 变成 `Markdown copied`

#### Scenario: 与 Copy link 使用同一站点源

- **WHEN** 主人在某个站点源上对公开 Pack 激活 Copy Markdown Badge，且 Copy link 会复制 `https://example.test/packs/abc`
- **THEN** 徽章 Markdown 中的图片 URL MUST 以 `https://example.test/badge.svg` 为地址，链接 URL MUST 为 `https://example.test/packs/abc`

### Requirement: 徽章图以固定路径匿名提供

`/badge.svg` MUST 返回一张静态 SVG，不要求登录。图中可见文字 MUST 为 `Open in winstall`。图形 MUST 自带填充，使白字在 GitHub 浅色与深色 README 上都可读。该 SVG MUST NOT 引用外部图片、字体或脚本。路径 MUST 保持 `/badge.svg`，MUST NOT 改名或改到其它路径后再从旧路径重定向。

#### Scenario: 匿名取到徽章图

- **WHEN** 未登录客户端请求 `/badge.svg`
- **THEN** 响应 MUST 是该静态 SVG，且可见文字 MUST 为 `Open in winstall`

### Requirement: 徽章点击打开现有 Pack 详情

徽章链接打开后，系统 MUST 展示该标识对应的现有 Pack 详情，包括该页已有的 Install，以及非主人时已有的 Add to my packs。系统 MUST NOT 因为这条链接而自动复制 Pack、自动导入或跳到其它页面。

#### Scenario: 从徽章进入详情

- **WHEN** 用户打开徽章 Markdown 中的 `/packs/:id` 链接
- **THEN** 系统 MUST 展示该 Pack 的现有详情，且 MUST NOT 自动复制该 Pack
