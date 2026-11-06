# Tasks

## 1. S3 客户端能力扩展与内容哈希工具

- [x] 1.1 在 `utils/s3Client.js` 中增加 `checkS3FileExists(key)` 方法（封装 HeadObjectCommand），并编写单元测试验证存在和 404 不存在的分支
- [x] 1.2 在 `utils/installerHash.js` 中使用原生代码实现 Object 递归字典排序规范化序列化函数及 `sha256(project::version::rcUpdateId::config)` 哈希生成函数，并编写测试验证相同对象无论 key 顺序如何均能生成相同 hash

## 2. 后端 Installer 路由改动与并发去重

- [x] 2.1 修改 `pages/api/installer.js`，将 taskId 改为由版本与配置生成的内容哈希，在调用 Builder 前先调用 S3 检查，存在则直接返回 200 与 `downloadUrl`
- [x] 2.2 在 `pages/api/installer.js` 中增加并发去重逻辑：若 S3 不存在但 Redis 状态为正在构建（`'0'`），直接返回 202 与 `statusUrl`，不重复向 Builder 发起任务
- [x] 2.3 验证 `pages/api/installer/callback.js` 与 `pages/api/installer/status.js` 兼容哈希 taskId 且无需破坏性修改，编写测试保证回归

## 3. 前端轻量解析与即时下载适配

- [x] 3.1 修改 `utils/downloadInstantInstaller.js`，采用 `response.ok` + `Content-Type` 统一驱动逻辑（JSON 优先检查 `downloadUrl` 即时触发下载，其次 `statusUrl` 轮询；非 JSON 走 blob 下载）
- [x] 3.2 运行回归测试并使用 `node --test` 验证所有 installer 相关单元测试通过
