# Proposal

## Why

当用户选择的应用包含中文、日文等非 ASCII 字符时（例如应用名称为“网易云音乐”），Jenkins 构建任务收到的 `installer_config` 构建参数会出现乱码（显示为 `ç½æäºé³ä¹` 等）。

经排查，前端浏览器发送给 Next.js 路由的请求为标准的 UTF-8 `application/json`，编码完全正常；乱码发生在 Next.js 服务端（`pages/api/installer.js`）向 Jenkins Webhook 转发请求时：当前实现使用了 `FormData`，在 Node.js 中以未指定 charset 的 `multipart/form-data` 形式发出，而 Jenkins Servlet 默认采用 ISO-8859-1 (Latin-1) 解码 multipart 请求体，导致 UTF-8 多字节序列被逐字节误解码为 Latin-1 字符，并在下游构建管线中进一步放大为双重乱码。

通过将发往 Jenkins Webhook 的请求改为标准的 `application/x-www-form-urlencoded` 格式，并由 `URLSearchParams` 对所有参数（特别是 `installer_config`）进行标准的 UTF-8 百分比编码，使请求体由纯 ASCII 字符组成，Jenkins 接收后可按 UTF-8 正确还原原始字符。

## What Changes

- **服务端 Jenkins Webhook 请求体编码**：在 `pages/api/installer.js` 中，将构建发往 Jenkins Webhook 的请求体由 `new FormData()` 切换为 `new URLSearchParams()`（即 `application/x-www-form-urlencoded;charset=UTF-8`）。
- **参数 UTF-8 百分比编码**：`installer_config` 及其他 webhook 字段在通过 `URLSearchParams` 发送时，自动进行 UTF-8 百分比编码（例如 `网` 编码为 `%E7%BD%91`），确保请求体为纯 ASCII 安全传输。
- **前端浏览器行为保持不变**：明确浏览器前端到 Next.js API 的 JSON 传输和哈希校验机制不需要也不进行任何修改，避免数据污染和缓存失效。

## Capabilities

### New Capabilities
<!-- 无新增能力 -->

### Modified Capabilities
- `install-export`: 在 Instant installer 构建与分发规范中，明确当配置为 Jenkins Webhook 模式时，服务端发往构建服务的参数必须使用 UTF-8 百分比编码的 `application/x-www-form-urlencoded` 格式，以确保非 ASCII 字符（如中日文字符）在 Jenkins 中正确解码。

## Impact

- 受影响代码：`pages/api/installer.js`（Webhook 构建请求体构造逻辑）。
- 关联测试：`test/installerCacheRoute.test.js` 及相关 Webhook 调度单测。
- 外部集成：Jenkins `CreateBuild_Winstall_Installer_Builder` 接收到的 `installer_config` 字符串参数恢复正常的中日文字符，不再产生 Latin-1 乱码。
