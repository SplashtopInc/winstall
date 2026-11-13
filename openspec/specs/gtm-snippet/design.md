## Context

见 `proposal.md` 的 Why（归档 change：`extract-gtm-component`）。现状：文档壳通过公共 GTM 加载组件注入官方 script / noscript；`utils/gtm.js` 只写 `window.dataLayer`，事件名与字段不含容器 ID。事件行为以 `openspec/specs/gtm-event-tracking/spec.md` 为准。

## Goals / Non-Goals

**Goals:**

- 一个组件同时覆盖官方 script 与 noscript 两段，靠 prop 传入 `gtmCode`。
- `_document` 调用处只改传入值即可换容器。
- 保持现有加载顺序：Osano → GTM 内联脚本 → 页面内容。

**Non-Goals:**

- 不改 `utils/gtm.js`、同意门槛或任何 `ws_*` 事件。
- 不引入环境变量或 `NEXT_PUBLIC_*` 来配置容器 ID。
- 不改 Osano 脚本、也不改 Service Worker 对 `googletagmanager.com` 的拦截。
- 不在 GTM 容器内配置触发器或 GA4 标签。

## Decisions

### 1. 组件拆成两个 part，同一 `gtmCode`

官方片段必须分别落在 `head` 与 `body`。组件用 prop `part` 区分：`script` 渲染内联加载脚本，`noscript` 渲染 iframe。调用方在 `_document` 各用一次，两次传入同一 `gtmCode`。

**备选**：两个独立组件。未采纳，因为容器 ID 校验与 URL 拼装应只维护一处。

### 2. 代码字面量传入，不读环境变量

`_document` 直接写 `gtmCode="GTM-5JF42TD"`（或等价常量）。换容器改调用处。组件本身不读 `process.env`。

**备选**：像 API origin 一样经 meta / 环境变量注入。未采纳，因为当前明确只要代码传入，且容器 ID 不是按部署环境切换的运行时密钥。

### 3. 文件名 `components/gtmSnippet.js`，prop 用 `gtmCode`

遵循仓库 `lowerCamelCase` 文件名约定。用户口头说的 gtm-code 对应 prop `gtmCode`。

### 4. 校验失败则不渲染

传入值 trim 后须匹配 `^GTM-[A-Z0-9]+$`（大小写按官方常见写法；实现时以字母数字容器后缀为准）。空值或非法值返回 `null`，避免把坏脚本拼进 HTML。

### 5. 继续用文档壳内联脚本，不用 `next/script`

加载必须在首份 HTML 里完成，且排在 Osano 之后。`next/script` 会改变时机，排除。

### 6. `dataLayer` 名称固定

组件内部继续使用 `dataLayer`，与 `utils/gtm.js` 一致。不把 dataLayer 名做成可配置 prop。

## Risks / Trade-offs

- [调用方可能给 script 与 noscript 传入不同的 `gtmCode`] → 规范要求同一文档只挂一个容器；`_document` 两处共用同一字面量。
- [校验过严会挡住合法新格式] → 当前只接受官方常见的 `GTM-` + 字母数字；若 Google 变更格式再放宽。
- [抽象后仍硬编码在 `_document`] → 有意为之：换码改一处 prop，不引入部署配置面。

## Migration Plan

无数据迁移。撤回时把 `_document` 内联片段还原即可。新组件可删除。

## Open Questions

无。
