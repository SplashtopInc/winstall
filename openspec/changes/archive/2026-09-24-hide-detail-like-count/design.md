## Context

见 `proposal.md` 的 Why。详情 Like 由共用的 `components/LikeButton.js` 渲染，App 在 `components/AppDetailView.js`，Pack 在 `pages/packs/[id].js`。按钮同时输出心形图标与 `formatCount(likeCount)`。`useResourceEngagement` 仍从 stats / GET like / 写响应合成 `likeCount` 与 `liked`。货架与周榜走 `appListCounts` / `trendingCounts`，不经 `LikeButton`。

归档后本节决定并入 `openspec/specs/detail-engagement/design.md`（该能力目前无独立 design 文件）。

## Goals / Non-Goals

**Goals:**

- 详情 Like 只展示图标与 pressed 态，不渲染数字。
- 登录门槛、GET like、POST/DELETE like 路径保持现状。

**Non-Goals:**

- 不改 API、stats 映射、hook 内 `likeCount` 状态。
- 不隐藏列表/周榜上的 like 数字。
- 不移除 Like 按钮。

## Decisions

### 1. 只改 `LikeButton` 的可见输出

**选择：** 从按钮 children 去掉 `formatCount(likeCount)`。可保留 `likeCount` prop 以免调用方大改，但 MUST NOT 渲染。`aria-label` 继续只用 Like / Unlike。

**理由：** 两处详情共用同一组件；货架计数不走它，改一处即可。

**备选：** 在详情页不传 `likeCount`、组件仍显示 0。否决：仍会画出数字。新增 `showCount` 开关。否决：当前无其它调用方需要数字。

### 2. 继续请求 like 面

**选择：** 已登录仍打 `GET …/like`，用 `liked` 设 pressed；写响应仍更新 `liked`。Hook 可继续存 `likeCount`，UI 不读。

**理由：** 避免为隐藏数字而拆请求契约；后续若恢复展示无需再接线。

**备选：** 未登录不再依赖 stats 的 likeCount。可接受但不强制改 hook。

## Risks / Trade-offs

- **[调用方仍传 likeCount]** → 组件忽略即可。
- **[测试断言按钮文本含数字]** → 改为断言 `aria-pressed` / `aria-label`。
- **[Trade-off]** 网络仍带回 likeCount，只是不展示。

## Migration Plan

只发 Web。回滚：恢复 `LikeButton` 内数字。

## Open Questions

无。
