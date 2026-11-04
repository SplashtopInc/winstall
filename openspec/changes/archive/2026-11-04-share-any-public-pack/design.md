## Context

行为见 `specs/pack-share/spec.md`。动机见 `proposal.md`。

Pack 详情操作行在 `pages/packs/[id].js`。Share 整块包在 `isOwner` 里，放在点赞和 More 之间。按钮是 48px 圆钮 `shareTrigger`，图标 `FiShare2`，可访问名称 `Share`。`PackShareCard` 挂在这颗按钮下方。`visibility !== "public"` 时卡片先展示 “Make this pack public to share”，勾选后主人 `PATCH /packs/:id`。五个渠道在未公开时 `disabled`。Copy link 与徽章都使用 `buildSiteUrl(\`/packs/${pack._id}\`)`。

非主人的操作行现在是 Install、Add to my packs、点赞。More 只在主人侧。

## Goals / Non-Goals

**Goals:**

- 公开 Pack 上，用现有 Share 按钮和 `PackShareCard` 给所有打开详情的人，包括未登录访客。
- 公开门槛只留给主人的非公开 Pack。非主人打不开这条 `PATCH`。
- 主人操作行、More、徽章字符串和 `/packs/:id` 保持不变。

**Non-Goals:**

- 不改每人 10 个公开 Pack 的限制，不新增 `unlisted` 的分享。
- 不改 App 详情的 Share，不在列表卡片上加 Share。
- 不把徽章链接做成导入或 Fork。

## Decisions

### 1. 按「主人或已公开」渲染同一颗 Share

`pages/packs/[id].js` 在 `isOwner || pack.visibility === "public"` 时渲染现有的 `shareWrap`、`shareTrigger` 和 `PackShareCard`。位置仍在点赞之后。More 的条件保持 `isOwner`。

非主人因此得到 Install、Add to my packs、点赞、Share。主人仍是 Install、Add App、点赞、Share、More。`handleShareClick` 继续先关掉 More。点 `shareWrap` 外关闭面板的逻辑不用拆。

**理由：** 按钮、面板、五个渠道和复制字符串已经在主人的公开 Pack 上工作。公开 Pack 的卡片本来就不展示公开门槛，因为 `isPublic` 为真。

**备选：** 给访客另做一套类似 App 详情的分享菜单。渠道文案和徽章会有第二份实现。

### 2. 公开门槛只在主人的非公开 Pack 上出现

`PackShareCard` 增加主人判断。只有主人且 `visibility` 不是 `public` 时展示勾选、名额提示，并调用 `fetchMyPacks` 计算公开数量。其余情况不请求「我的 Pack」，也不调用 `updatePack`。

已公开时五个渠道保持可激活，与现在 `shareDisabled = !isPublic` 一致。非主人即使详情里出现非公开 Pack，也不渲染 Share（决策 1），卡片侧再挡一层 `PATCH`。

**理由：** 勾选会改可见性，只能是主人的写操作。已登录的非主人打开别人的公开 Pack 时，不需要为了分享去拉自己的公开名额。

**备选：** 保持现在的 `fetchMyPacks`，只靠 `isPublic` 藏起勾选。公开 Pack 上多一次无关请求，而且非主人路径没有明确禁止写。

## Risks / Trade-offs

- **[Risk] 主人私有 Pack 的勾选被主人判断挡掉。** 缓解：门槛条件是「主人且未公开」，主人路径与现在相同。
- **[Risk] `unlisted` 被当成 public 而放出 Share。** 缓解：条件使用 `visibility === "public"`。非 public 仍只有主人看到 Share。
- **[Trade-off] 未登录访客可以复制公开链接和徽章。** 接受。这两项都不写数据，App 详情已经如此。

## Migration Plan

只改详情页的渲染条件和卡片里的门槛。没有数据迁移，没有新接口。回滚时把 Share 重新放回 `isOwner`，并让卡片恢复对所有未公开 Pack 展示勾选。
