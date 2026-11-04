## Why

公开 Pack 的详情任何人都能打开，但 Share 只出现在主人自己的页面上。看到别人公开合集的人无法复制链接、徽章或发到社交渠道。

## What Changes

- `visibility` 为 `public` 的 Pack，任何打开详情的人都能使用 Share，包括未登录访客。五个渠道直接可激活。
- 非主人不看到 “Make this pack public to share”，也不能改这个 Pack 的可见性。
- 主人的私有 Pack 保持现状：Share 仍在，五个渠道在设为 public 之前不可用，勾选后仍走现有的公开门槛和每人 10 个名额。
- More、Edit、Delete 仍只给主人。未公开以外的可见性（含 `unlisted`）这次不改。
- 复制出去的仍是现有 `/packs/:id` 与同一行徽章 Markdown。不因为分享而复制 Pack、导入或跳到别的页面。

## Capabilities

### New Capabilities

- （无）

### Modified Capabilities

- `pack-share`：公开 Pack 的 Share 从「仅主人」改为「任何打开该详情的人」。主人私有 Pack 的公开门槛保持不变。

## Impact

- 前端：`pages/packs/[id].js` 在公开 Pack 上为非主人渲染 Share；`components/PackShareCard.js` 对非主人隐藏公开门槛。样式沿用 `styles/packDetail.module.scss` 里现有的分享按钮和卡片。
- API：不新增接口。把 Pack 设为 public 仍是主人调用现有的 `PATCH /packs/:id`。
- URL：不改 `/apps/:id`、`/packs/:id`、`/apps`、`/packs`。
