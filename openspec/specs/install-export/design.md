# Design: install-export Architecture

## Context

`install-export` 规范覆盖了 winstall 的导出面板、安装抽屉以及 Instant Installer（快捷安装包）的构建、分发与客户端下载机制。后端服务涉及 Next.js API Routes、Redis 任务状态追踪、AWS S3 预签名 URL 服务以及上游构建系统（Jenkins Webhook 或 BuilderBase 服务）。

## Instant Installer 架构与缓存体系

### 1. Builder 模式与演进支持
系统架构支持三种与 Builder 协同工作的模式，确保在不同环境（本地、测试、正式生产）下的灵活性：
- **阶段 1：BuilderBase 同步直连流模式**：用于无 S3 配置环境或单机开发调试，Builder 同步生成并将 `application/octet-stream` 二进制流直吐回客户端。
- **阶段 2：BuilderBase S3 异步模式**：直接调用 BuilderBase 并传递 `upload_url` 与 `callback_url`，Builder 构建后将文件推入 S3。
- **阶段 3：Jenkins Webhook 模式（生产主力）**：通过表单携带任务指纹、S3 PutPresignedUrl 和回调 URL 触发分布式流水线。

### 2. 内容寻址缓存 (Content-Addressable Cache)
为了消除重复构建开销并复用 S3 的 30 天对象生命周期，系统使用确定性内容哈希取代随机 UUID 作为任务主键与 S3 存储 key：
- **哈希算法**:
  ```
  payload = [
    projectName || 'Winstall_Installer_Builder',
    version || 'v0.9.1.0',
    rcUpdateId || '129',
    canonicalStringify(config)
  ].join('::')
  hash = sha256(payload)
  ```
- **配置规范化**: 采用原生递归算法对配置 JSON 的对象 Key 进行字母排序，数组保持原序，确保相同配置无论键顺序如何均能稳定生成相同的哈希值。
- **S3 物理路径与动态文件名解耦**:
  - S3 Key 固定为 `installers/${hash}.exe`。
  - 用户下载文件名通过 S3 `GetObjectCommand` 的 `ResponseContentDisposition` 动态注入，保证一份物理二进制可对应多种个性化下载文件名。

### 3. S3 预检与请求折叠
- 在发起构建前，调用 S3 `HeadObjectCommand` 预检文件是否存在。
- 若存在：直接返回 HTTP 200 及预签名下载 URL，跳过队列与 Builder 触发。
- 若不存在：检查 Redis 中的 `installer:task:${hash}`，若处于正在构建态（`'0'`），直接返回 202 statusUrl 挂载至现有任务（并发去重），避免惊群效应。

### 4. 客户端 MIME 驱动分流
前端在获得 HTTP 2xx 成功响应后，基于 `Content-Type` 判定动作：
- `application/json`：存在 `downloadUrl` 则立即触发下载；存在 `statusUrl` 则发起轮询。
- 二进制流（`application/octet-stream`）：直接提取 `blob()` 触发下载，向后兼容早期直连流模式。

### 5. 负载分流与重定向选型（架构约束）
若未来在上游 Builder 前引入反向代理或具有负载分流重定向的网关，**必须使用 HTTP 307 或 308 重定向**，严禁使用 301 或 302，以避免在重定向时客户端将 POST 请求降级为 GET 并丢弃请求体。
