# Design: 基于内容哈希的 Installer S3 缓存与客户端分流

## Context

参见 `proposal.md`。当前系统对于每次生成请求都会创建随机 UUID 任务 ID。

### Builder 演进历史与环境兼容背景
系统生成 installer 经历了三个阶段的演进，当前设计和后续改造必须继续保留对这些模式的支持，以便在本地开发、测试或独立验证环境中进行轻量验证：
1. **阶段 1：BuilderBase 同步流直连模式 (早期单机可行性验证 / 保底方案)**
   - 在未配置 S3 或早期单机验证时，由 Next.js 将配置同步发给 `WINSTALL_BUILDER_BASE/installer`。
   - Builder 同步编译并将 exe 二进制流（`application/octet-stream`）直接在 HTTP 响应中吐回，Next.js 转发该二进制流，浏览器作为普通文件流接收。
2. **阶段 2：BuilderBase S3 异步模式 (S3 架构验证)**
   - 在跑通 S3 预签名机制后，保留 BuilderBase 直连，但在请求 payload 中注入 `upload: { upload_url, callback_url }`。
   - Builder 异步编译并将 exe 上传到 S3，通过回调通知完成，Next.js 返回 202 让前端轮询 status。
3. **阶段 3：Jenkins Webhook 模式 (正式生产环境)**
   - 在正式产品形态下，通过 `WINSTALL_BUILDER_WEBHOOK` 表单触发 Jenkins CI 流水线，并附带项目名、PE 底模版本、资源更新 ID 以及 S3 预签名与回调地址，完全解耦构建计算。

S3 对象的生命周期为 30 天。S3 客户端采用 AWS SDK v3，并基于 Redis/本地文件缓存跟踪任务状态。

## Goals / Non-Goals

**Goals:**
- 将 S3 对象存储的 key 转换为由构建底模版本号和规范化配置构成的 sha256 内容指纹。
- 在发起耗时的 Builder 构建之前，通过 S3 `HeadObject` 预检判断产物是否已存在。
- 命中缓存时直接生成预签名下载 URL 并返回，跳过任务队列、Redis 轮询与 Builder 编译。
- 客户端依托原生 `response.ok` 与 MIME `Content-Type` 整合分流，保持轻量最小化。
- 记录未来负载分流代理的重定向选型规范（使用 307/308）。

**Non-Goals:**
- 不在此变更中修改 Builder 本身的构建方式或向其引入重定向代理。
- 不修改原有回调路由（`/api/installer/callback`）的契约协议，仅将 taskId 赋值为内容哈希。

## Decisions

### 1. 内容哈希计算规范 (Deterministic Hashing)
- **决策**: 使用 `sha256` 算法，哈希输入全面覆盖决定最终 exe 二进制产物的所有环境与配置维度：
  ```
  payload = [
    projectName || 'Winstall_Installer_Builder',
    version || 'v0.9.1.0',
    rcUpdateId || '129',
    canonicalStringify(config)
  ].join('::')
  hash = sha256(payload)
  ```
  无论当前采用 Jenkins Webhook 模式还是 BuilderBase 直连异步模式，都使用同一套环境常量与规范化配置，确保哈希空间的唯一性与一致性。
- **规范化 JSON 序列化**: 采用无外部依赖的原生实现，对 Object 键进行递归字典排序，保持 Array 原始顺序不变（安装顺序有语义），消除属性顺序不一致导致的假穿透。
- **替代方案**: 只用 `version + JSON.stringify(config)`。缺点是遗漏了 `project_name`、`rc_update_id` 环境变量，且原生 `JSON.stringify` 存在键顺序不确定性，可能导致运维更新环境变量时命中旧缓存下错包。

### 2. S3 Key 存储与下载文件名解耦
- **决策**: S3 中的物理对象存储路径统一为 `installers/${hash}.exe`。
- 用户期望的下载文件名（如 `winstall-Tencent_WeChat.exe`）在调用 `generateGetPresignedUrl(hash, filename)` 时，通过 S3 原生 `ResponseContentDisposition` 动态注入：
  ```javascript
  ResponseContentDisposition: `attachment; filename="${filename}"`
  ```
- **收益**: 一份二进制在 S3 上只需存储一份，满足 30 天复用，同时满足不同用户/不同语境下的个性化下载文件名需求。

### 3. S3 预检与并发请求折叠 (Request Coalescing)
- **决策**:
  1. 先执行 `s3Client.send(new HeadObjectCommand(...))`。
  2. 若 S3 存在，直接返回 `200 OK`，载荷为 `{ taskId: hash, downloadUrl, cached: true }`。
  3. 若 S3 不存在，检查 Redis `installer:task:${hash}`：
     - 若为 `'0'`（正在构建中），则直接返回 `202 Accepted` 和对应的 `statusUrl`，不重复向 Builder 发起任务。
     - 若为空，则写入 `'0'`，调用 Builder 构建，并返回 `202 Accepted`。
- **替代方案**: 只做 Redis 缓存。缺点是 Redis TTL（通常 1 小时）远低于 S3 的 30 天生命周期。直接以 S3 作为真理来源（Source of Truth）更可靠。

### 4. 客户端基于 MIME 驱动的轻量处理
- **决策**:
  - 前端使用 `response.ok` 统一捕获 `200~299` 成功状态，非成功统一抛出解析后的错误。
  - 成功时读取 `response.headers.get('content-type')`：
    - 若包含 `application/json`：解析后检查 `downloadUrl`（存在则直接触发 `downloadFile`），否则检查 `statusUrl`（存在则进入 `pollStatus`），均不存在则抛错。
    - 若非 JSON（如 `application/octet-stream`）：读取 `response.blob()` 保存文件。
- **收益**: 奥卡姆剃刀，消除了嵌套的状态码分支，代码结构扁平直观。

### 5. 负载分流与重定向选型（架构备忘）
- **决策**: 在架构设计中记录约束：未来若 Builder 部署于反向代理或具有负载分流重定向的网关之后，**必须使用 HTTP 307 或 308 重定向**，严禁使用 301 或 302。
- **原理**: RFC 规范中，客户端对 301/302 的 POST 请求会自动转为 GET 请求并丢弃 Request Body，导致向 Builder 发起的构建请求丢失 payload；307/308 则强制保持 POST 方法与原始 Body。

## Risks / Trade-offs

- **[Risk] S3 HeadObject 带来额外网络往返** → **Mitigation**: HeadObject 仅传输 HTTP Header，耗时通常为 20~80ms，相比 Builder 3~10 秒的编译耗时和上传开销，收益远大于成本。
- **[Risk] 前端直接下载跳过倒计时动画** → **Mitigation**: 前端 `isProcessing` 在 `downloadInstantInstaller` 执行完毕后统一在 `finally` 中复位，秒级下载直接完成是体验优化，无需刻意模拟等待。
- **[Risk] S3 未配置或异常** → **Mitigation**: 若 S3 未配置，`checkS3FileExists` 返回 `false`，平滑回退到原本无缓存的正常处理流程。
