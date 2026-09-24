## Why

App 与 Pack 详情上的 Like 按钮目前会同时显示终身 like 数量。产品希望详情页只保留可点赞/取消赞的控件，不再把 like 数字作为可见信号。

## What Changes

- App 详情与 Pack 详情的 Like 控件 MUST NOT 再展示 like 数量（含未登录时来自 stats 的数字）。
- Like 按钮本身保留：未登录打开登录、已登录可赞/取消赞、pressed 态仍来自 `GET …/like` 与写响应。
- 货架卡、首页周榜、Pack 列表卡上的 like 数字不变。
- 不改 winstall-api，不改 views / downloads 展示。

## Capabilities

### New Capabilities

- （无）

### Modified Capabilities

- `detail-engagement`：详情 Like 控件不再展示 like 数量；点赞/取消赞与登录门槛不变。
- `pack-api-client`：Pack 详情仍走 API like，但可见 like 数字不再是要求。

## Impact

- `components/LikeButton.js`：去掉可见数字。
- `components/AppDetailView.js`、`pages/packs/[id].js`：仍传 liked / pending / onClick；不必再为展示绑定 likeCount。
- `hooks/useResourceEngagement.js`、`utils/engagementApi.js`：可继续读写 `likeCount`（写响应与 GET like 契约不变），只是 UI 不渲染。
- 测试若断言详情按钮文案含数字，需改为只断言 Like / Unlike 与 pressed 态。
