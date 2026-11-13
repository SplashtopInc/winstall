## 1. GTM 加载组件

- [x] 1.1 新增 `components/gtmSnippet.js`：接收 `gtmCode` 与 `part`（`script` | `noscript`），校验 `gtmCode` 为 `GTM-` 加字母数字；非法或空值返回 `null`
- [x] 1.2 `part="script"` 渲染与现网等价的 `dataLayer` 初始化与 `gtm.js` 内联脚本；`part="noscript"` 渲染指向同一容器 ID 的官方 noscript iframe

## 2. 接入文档壳

- [x] 2.1 在 `pages/_document.js` 用该组件替换现有两处硬编码片段，两次传入同一 `gtmCode="GTM-5JF42TD"`，保持 Osano 在 GTM 脚本之前
- [x] 2.2 确认 `_document` 中不再出现裸露的 `GTM-5JF42TD` 字符串（除作为组件 prop 传入外）
