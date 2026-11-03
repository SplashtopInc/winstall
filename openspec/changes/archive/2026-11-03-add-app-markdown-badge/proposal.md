## Why

Pack 详情已经能复制一行「Open in winstall」徽章 Markdown，贴进 GitHub README 后点开会打开该 Pack。App 详情的分享仍只有社交渠道和 Copy link，仓库作者没法用同一块徽章把读者带到某一个 App。

## What Changes

- App 详情的分享菜单在 Copy link 之后增加 Copy Markdown Badge。现有 X (Twitter)、Facebook、LinkedIn、Copy link 保持不变。
- 激活后关闭菜单，并用详情页现有 toast 反馈：成功 `Markdown copied`，失败 `Copy failed`。
- 写入剪贴板的是一行 Markdown。图片仍是现有 `/badge.svg`，链接是该 App 的 `/apps/:id`，站点源与同一次分享里的 Copy link 相同。
- 点击徽章只打开现有 App 详情。不增加导入、加入列表或自动安装。
- 不改 Pack 的分享，不改列表卡片上未展示的旧分享卡，也不改 `/badge.svg`。

## Capabilities

### New Capabilities

- `app-share`：App 详情分享菜单中的 Copy Markdown Badge，以及它复制出的、指向 `/apps/:id` 的徽章 Markdown。

### Modified Capabilities

- （无）`/badge.svg` 与 Pack 徽章仍由 `pack-share` 规定。公开页面路径仍是 `/apps/:id`。

## Impact

- 前端：`components/AppDetailView.js` 的分享菜单增加一个渠道；复制后关闭菜单并调用现有 toast。样式在 `styles/appDetail.module.scss`，菜单需要容纳 `Copy Markdown Badge` 这一行文案。
- 复制字符串复用 `utils/packBadgeMarkdown.js` 的 `buildPackBadgeMarkdown(shareUrl)`，传入 App 的分享 URL。不新增接口，不新增静态资源。
- URL：徽章链接使用现有 App 标识，不引入 slug，不附加查询参数。不改 `/apps/:id`、`/packs/:id`、`/apps`、`/packs`。
