## 1. 公开门槛只留给主人

- [x] 1.1 在 `pages/packs/[id].js` 把 `isOwner` 传给 `components/PackShareCard.js`
- [x] 1.2 在 `components/PackShareCard.js` 中，仅当查看者是主人且 `visibility` 不是 `public` 时展示 “Make this pack public to share”，并调用 `fetchMyPacks` 计算公开名额。其余情况不请求「我的 Pack」，也不调用 `updatePack`

## 2. 公开 Pack 对所有人显示 Share

- [x] 2.1 在 `pages/packs/[id].js` 中，当 `isOwner` 或 `pack.visibility === "public"` 时渲染现有 `shareWrap`、`shareTrigger` 和 `PackShareCard`，位置仍在点赞之后。More 仍只在 `isOwner` 时渲染
- [x] 2.2 非主人的公开 Pack 操作行为 Install、Add to my packs、点赞、Share，且不展示 More。`visibility` 不是 `public` 时，非主人不渲染 Share

## 3. 核对既有主人路径

- [x] 3.1 主人的公开 Pack 仍为 Install、Add App、点赞、Share、More，五个渠道可激活，且不出现公开勾选
- [x] 3.2 主人的私有 Pack 仍先勾选才能分享，勾选后仍 `PATCH /packs/:id` 把 `visibility` 写成 `public`，公开名额仍是每人 10 个
