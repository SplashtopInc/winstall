# Design: Installer Webhook URL-Encoded Encoding

## Context

见 `proposal.md - Why`。当前 `pages/api/installer.js` 在向 Jenkins Webhook 派发构建任务时，使用全局的 `FormData` 对象拼装各参数并通过 Node.js 原生 `fetch` 发送：

```javascript
const formData = new FormData();
// ...
formData.append('installer_config', JSON.stringify(config));
await fetch(builderWebhook, { method: 'POST', headers: webhookHeaders, body: formData });
```

这会导致 HTTP 请求以 `multipart/form-data; boundary=...` 形式发出。由于表单部件没有明确携带 `charset=utf-8`，Jenkins 底层 Servlet / Stapler 将收到的 UTF-8 字节按照 ISO-8859-1（Latin-1）单字节解码，造成中日文字符（如“网易云音乐”）产生乱码（`ç½æäºé³ä¹`），进而在下游构建节点中被进一步当成 Latin-1 重新保存为 UTF-8，造成双重乱码。

## Goals / Non-Goals

**Goals:**
- 将 `pages/api/installer.js` 中 Webhook 请求体序列化由 `FormData` 迁移至 `URLSearchParams`。
- 请求头自动设置为 `application/x-www-form-urlencoded;charset=UTF-8`（或默认由 fetch/URLSearchParams 处理）。
- 保证 `installer_config` 中包含的中日文字符以标准的 UTF-8 百分比编码（Percent-encoding，如 `%E7%BD%91`）安全传输。
- 保持前端浏览器向 Next.js `/api/installer` 发送请求的现有逻辑和数据结构完全不变。

**Non-Goals:**
- 不修改前端浏览器（`utils/downloadInstantInstaller.js`）的请求格式或数据结构。
- 不修改本地开发环境 direct builder base（`WINSTALL_BUILDER_BASE`）的 `application/json` 通信逻辑。
- 不改动 `utils/installerHash.js` 的哈希计算算法，确保现有 S3 缓存和 Redis 去重逻辑不受影响。

## Decisions

### 1. 使用 Node 原生 `URLSearchParams` 替代 `FormData`
- **决策**：在 Webhook 发送分支使用 `new URLSearchParams()` 拼装参数，替代 `new FormData()`。
- **原因**：
  - `URLSearchParams` 为 Node.js 18+ 原生全局对象，零外部依赖（符合第一性原则和精简至上）。
  - 作为 `fetch` 的 `body` 传入时，Node.js 原生 `fetch` 会自动将 `Content-Type` 设置为 `application/x-www-form-urlencoded;charset=UTF-8`，并且自动对 key 和 value 执行标准的 UTF-8 百分比编码。
  - Jenkins 能够天然解析 `application/x-www-form-urlencoded`，并使用 UTF-8 正确还原参数。
- **替代方案考虑**：
  - *方案 B：在 FormData 的每个 part 上手动添加 charset 头*：Node.js 原生 `FormData` 对单个 text part 自定义 Content-Disposition / Content-Type 支持有限，且 Jenkins 对 multipart 的解析依然存在兼容性陷阱。
  - *方案 C：前端提前做 encodeURIComponent*：会污染应用层数据，改变 `computeInstallerHash` 计算出的哈希值，破坏现有 S3 缓存，且将服务端传输细节泄露给前端，不可取。

### 2. 清理历史遗留的无效 Content-Type 赋值
- **决策**：移除原先在 `formData` 上的 `formData.set('Content-Type', 'application/json')`。
- **原因**：原代码试图在 `formData` 上调用 `.set('Content-Type', ...)`，实际只是往表单追加了一个名为 `Content-Type` 的文本字段，不仅毫无作用，还会造成混淆。改用 `URLSearchParams` 后无需此字段。

## Risks / Trade-offs

- **[Risk] 请求体超长问题**：`application/x-www-form-urlencoded` 通常对非常大的文本会稍微增加传输体积（百分比编码扩展）。
  - → *Mitigation*：`installer_config` 仅包含应用元数据列表（数十个到百余个应用的 JSON），文本大小通常在数十 KB 以内，远低于 Webhook 与反向代理的 POST body 大小限制（通常为 1MB~10MB）。
- **[Risk] 与 Jenkins Job 参数类型的兼容性**：
  - → *Mitigation*：Jenkins 团队提供的标准调用范例（curl `--data-urlencode` 与 requests `data={...}`）正是 `application/x-www-form-urlencoded`，已在线下及 LT 环境得到充分验证。
