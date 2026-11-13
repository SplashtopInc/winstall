## Why

站点把 GTM 容器 ID 硬编码在 `pages/_document.js` 的两处加载片段里。后续可能更换不同的 gtm-code，需要把官方 script / noscript 收成一个可传参的公共组件，调用处只改传入值。

## What Changes

- 新增 GTM 加载组件，通过 prop 接收 `gtmCode`，分别渲染 head 内联脚本与 body 内的 noscript iframe。
- `pages/_document.js` 改为使用该组件，并传入当前的 `GTM-5JF42TD`。
- 不改事件推送、Osano 同意逻辑，也不从环境变量读取容器 ID。

## Capabilities

### New Capabilities

- `gtm-snippet`: 文档壳按传入的 gtm-code 加载官方 GTM 片段；无效或空值不注入。

### Modified Capabilities

无。

## Impact

- **组件**：新增 `components/gtmSnippet.js`。
- **文档壳**：`pages/_document.js` 用该组件替换内联 GTM 片段。
- **不变**：`utils/gtm.js` 事件契约、Osano 脚本顺序、Service Worker 对 `googletagmanager.com` 的拦截。
