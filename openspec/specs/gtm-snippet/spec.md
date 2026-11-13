# gtm-snippet Specification

## Purpose

把 Google Tag Manager 官方加载片段收成可复用能力，由调用方传入 gtm-code，便于以后更换容器而不改事件契约。

## Requirements

### Requirement: 按传入的 gtm-code 注入官方加载片段

站点文档壳 MUST 使用公共 GTM 加载能力，并传入容器 ID（gtm-code）。该能力 MUST 同时提供两段官方片段：一段在文档 `head` 中以同步内联脚本初始化 `dataLayer` 并加载 `gtm.js`；一段在 `body` 开头提供 noscript iframe。两段 MUST 使用同一 gtm-code。加载时机 MUST 保持在文档壳渲染阶段完成，MUST NOT 推迟到客户端水合之后。同一份文档 MUST 只挂一个容器。

#### Scenario: 文档壳使用当前容器 ID

- **WHEN** 站点渲染完整 HTML 文档且调用方传入有效的 gtm-code
- **THEN** 响应 HTML 的 `head` 含有指向该 gtm-code 的 GTM 内联脚本，且 `body` 含有指向同一 gtm-code 的 noscript iframe

#### Scenario: 更换 gtm-code 只改调用处传入值

- **WHEN** 调用方把传入的 gtm-code 换成另一个有效容器 ID 并重新渲染文档
- **THEN** 两段片段都使用新的容器 ID，且站点其它 GTM 事件字段与事件名保持不变

### Requirement: 无效或空的 gtm-code 不注入片段

gtm-code 为空、仅空白，或不符合 `GTM-` 后接字母数字的形式时，该能力 MUST NOT 渲染 script 或 noscript 片段。调用方 MUST 以代码字面量传入 gtm-code，MUST NOT 从环境变量读取容器 ID。

#### Scenario: 空值不渲染

- **WHEN** 调用方传入空字符串作为 gtm-code
- **THEN** 文档中不出现 GTM 内联脚本，也不出现 GTM noscript iframe

#### Scenario: 非法容器 ID 不渲染

- **WHEN** 调用方传入不符合 `GTM-` 加字母数字形式的字符串
- **THEN** 文档中不出现 GTM 内联脚本，也不出现 GTM noscript iframe
