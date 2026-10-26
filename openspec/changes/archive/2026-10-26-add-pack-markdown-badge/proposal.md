## Why

Pack 的 Share 藏在主人的 More 菜单里，作者要分享合集时先得点开三点。GitHub README 上也没有一块可点击的「Open in winstall」徽章，读者无法从仓库直接跳到这个 Pack。

## What Changes

- 主人在 Pack 详情上，Share 从 More 中移出，作为独立按钮放在点赞后面。More 只保留 Edit 和 Delete。访客仍不看到 Share。
- 现有 X (Twitter)、Facebook、LinkedIn、Copy link 四个渠道保持不变，并继续沿用「先把 Pack 设为 public 才能分享」。
- 新增第五个渠道 Copy Markdown Badge。点击后复制一段 Markdown，图片指向 `/badge.svg`，链接指向该 Pack 的 `/packs/:id`。粘贴进 README 后显示可点击的「Open in winstall」徽章。
- 点击徽章只打开现有 Pack 详情。不增加一键导入或 Fork。
- 新增静态徽章图 `/badge.svg`。徽章地址与 `/packs/:id` 一样，一旦被复制进仓库就不再改名。

## Capabilities

### New Capabilities

- `pack-share`：Pack 详情上主人可见的 Share，以及 Copy Markdown Badge 渠道和 `/badge.svg`。

### Modified Capabilities

- （无）公开页面路径仍是 `/packs/:id`。不改 App 详情的 Share，也不改点赞、安装或复制 Pack 的既有行为。

## Impact

- 前端：`pages/packs/[id].js` 的操作行与 More 菜单；`components/PackShareCard.js` 增加一个复制渠道。样式在 `styles/packDetail.module.scss`。
- 静态资源：新增 `public/badge.svg`，匿名可访问，不带登录态。
- API：不新增接口。公开门槛仍是现有的 `PATCH /packs/:id`，把 `visibility` 写成 `public`。
- URL：徽章链接使用现有哈希 `_id`，不引入 slug。不改 `/apps/:id`、`/packs/:id`、`/apps`、`/packs`。
