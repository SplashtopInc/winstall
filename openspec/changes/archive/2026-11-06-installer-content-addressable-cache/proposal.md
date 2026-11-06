# Proposal: Installer Content-Addressable Cache

## Why

目前 winstall 生成 instant installer 时，每一次导出请求都通过 `randomUUID()` 生成全新的 `taskId` 作为 S3 key，无论用户请求的软件配置是否相同，都会触发 Builder 重新构建打包并向 S3 写入重复的二进制文件。

S3 bucket 已配置长达 30 天的对象生命周期，但未能发挥内容缓存的价值。通过将构建底层 exe 版本号与内嵌 JSON 配置规范化合并哈希，作为 S3 存储的唯一 Key，并在触发构建前检查 S3 是否已有现成文件，可以大幅降低 Builder 的编译负载、消除相同配置的构建等待时间，并节约 S3 存储开销。

## What Changes

- **基于内容哈希的 S3 Key**: 使用 `sha256(projectName + ":" + version + ":" + rcUpdateId + ":" + canonicalConfig)` 生成确定性的哈希 key，全面覆盖影响二进制构建的所有环境变量与配置维度，取代随机 UUID。
- **S3 产物存在性预检**: 在向 Builder 发送生成任务之前，先调用 S3 `HeadObject` 检查是否已有缓存的 `.exe`。
- **并发请求去重与折叠**: 当相同配置的安装包正在由 Builder 构建时，复用同一个任务状态，不重复触发 Builder 构建。
- **前端响应解析合并 (MIME-driven)**: 前端简化响应解析逻辑，依托 `response.ok` 与 `Content-Type` 判定：
  - 若为 `application/json`，包含 `downloadUrl` 则直接触发下载；包含 `statusUrl` 则进入轮询。
  - 若为二进制流（`application/octet-stream`），直接保存文件（保留同步模式兼容性）。
- **重定向负载分流架构备忘**: 在规范中明确记录：若未来 Builder 引入反向代理或负载均衡重定向，必须使用 `307/308` 保持 POST 方法与 Body，不得使用 `301/302`。

## Capabilities

### Modified Capabilities
- `install-export`: 修改 instant installer 请求的缓存命中响应与客户端响应解析规范。

## Impact

- **Affected code**:
  - `utils/s3Client.js`: 增加 `checkS3FileExists(key)`。
  - `pages/api/installer.js`: 计算确定性哈希 key、检查 S3、命中则直接返回下载链接、去重并发构建。
  - `utils/downloadInstantInstaller.js`: 合并响应处理逻辑，支持即时下载。
- **APIs**:
  - `POST /api/installer`: 当缓存命中时，可返回状态码 `200` 及包含 `{ downloadUrl, cached: true }` 的 JSON。
- **Dependencies**: 无新增第三方依赖，使用 Node.js 原生 `node:crypto`。
