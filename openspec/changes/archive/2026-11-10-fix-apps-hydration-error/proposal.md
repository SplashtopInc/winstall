# Proposal

## Why

用户直接访问或刷新带查询参数的应用列表页面（如 `/apps?q=最受欢迎的浏览器`）时，客户端首轮渲染计算发现 URL 含有 `q`，将初始列表清空并渲染骨架屏，而服务端提供的是 SSG 预渲染的全量应用目录 HTML（含 `All apps (14,786)` 标题及 59 个预渲染应用卡片）。这导致客户端与服务端 HTML 结构不一致，引发 React 水合失败（Hydration Mismatch Error）。

修复此问题可以保证页面在带查询参数直达时的首屏渲染一致性，消除水合报错，并平滑过渡到对应的搜索结果列表。

## What Changes

- 保持 `/apps` 页面在客户端首次渲染时的状态与 SSG 预渲染数据（`data`）严格一致，移除在 `useState` 初始值中通过 `pathHasSearchQuery` 区分有无查询参数的逻辑。
- 确保首屏水合阶段渲染出与预渲染 HTML 结构完全一致的内容，消除 Hydration Mismatch。
- 水合完成后，由挂载的 `useEffect` 检测 `router.isReady` 及 URL 查询参数，在检测到查询参数时发起搜索请求并更新列表。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

- `apps-list-pagination`: 明确 `/apps` 页面在直达或刷新带 `q` 参数的 URL 时，首屏水合必须与服务端静态输出保持结构一致，避免发生水合错误。

## Impact

- 受影响代码：`pages/apps.js` 中的初始状态计算及列表初始渲染逻辑。
- 不影响现有 API 请求格式与路由规范，不影响搜索与分页能力。
