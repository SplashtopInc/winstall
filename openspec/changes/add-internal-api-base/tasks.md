## 1. 运行时配置

- [x] 1.1 在 `utils/runtimeConfig.js` 导出 public origin（trim 后的 `WINSTALL_API_BASE`），供 `_document` 与 ISR 判断
- [x] 1.2 服务端 `getRuntimeConfig().apiBase` 为 trim 后非空的 `WINSTALL_API_INTERNAL_BASE`，否则回退 public；浏览器仍只读 `winstall-api-base` meta
- [x] 1.3 `pages/_document.js` 的 API meta 只写入 public origin，MUST NOT 写入 internal

## 2. ISR 判断

- [x] 2.1 `pages/index.js`、`pages/apps.js`、`pages/express.js`、`utils/documentShellStaticProps.js` 中「无 API / 短 revalidate」改为看 public origin，fetch 仍走 `getRuntimeConfig().apiBase`

## 3. 测试与文档

- [x] 3.1 扩展 `test/runtimeConfig.test.js`：仅 public、public+internal、仅 internal、internal 空白回退；断言浏览器路径不读 internal
- [x] 3.2 更新 `.env.example`：`WINSTALL_API_BASE` 必填，`WINSTALL_API_INTERNAL_BASE` 可选，注明 Node 专用且勿用 `NEXT_PUBLIC_*`
