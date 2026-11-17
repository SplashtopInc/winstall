# Tasks

## 1. 纯模块与单元测试

- [x] 1.1 新增 `sw/cachePrivacy.js`（ESM，不引用 `self`），导出 `hasUserCredentials(request)`、`LEGACY_CACHE_NAMES`（`cross-origin`、`apis`）与 `purgeLegacyCaches(cacheStorage)`；代码注释用英文。验证：`node -e "import('./sw/cachePrivacy.js').then(m => console.log(Object.keys(m)))"` 列出这三个导出。
- [x] 1.2 新增 `test/swCachePrivacy.test.js`（`node:test`，沿用 `await import()` 写法），覆盖：带 `Authorization`（含 `authorization` 小写头名）判为凭证请求；不带头不是；头值为空字符串按设计处理并在测试里写明；`LEGACY_CACHE_NAMES` 含 `cross-origin` 与 `apis` 且不含预缓存缓存名；`purgeLegacyCaches` 用假 `cacheStorage` 验证两个缓存都被删除，且其中一个抛错时另一个仍被删除、函数不抛出。验证：`node --test test/swCachePrivacy.test.js` 全部通过。

## 2. 接入 Service Worker

- [x] 2.1 修改 `sw/sw.ts`：在 `runtimeCaching` 数组第一项加入以 `hasUserCredentials(request)` 为匹配器、`new NetworkOnly()` 为处理器的规则，位于 `_next/static` 规则与 `...defaultCache` 之前，不引入 `StaleWhileRevalidate`、不新增缓存名。验证：`npx tsc --noEmit -p tsconfig.json` 对 `sw/sw.ts` 无新增类型错误，且文件中该规则在数组最前。
- [x] 2.2 修改 `sw/sw.ts`：在 `installSerwist` 之后增加 `activate` 监听器，`event.waitUntil(purgeLegacyCaches(self.caches))`，不改动 `skipWaiting` / `clientsClaim`。验证：代码审阅确认监听器与 `installSerwist` 自带的激活逻辑互不依赖，且 `npm test` 仍通过。

## 3. 生产构建验证

- [x] 3.1 运行 `npm run build` 并用 `npm start` 启动（开发模式下 SW 被 `disable`，必须走生产构建），确认 `public/sw.js` 已生成且包含新规则与 `activate` 清理。验证：`grep -c "cross-origin" public/sw.js` 不为 0，浏览器里能注册 SW。
- [x] 3.2 在浏览器 DevTools 里手动验证规格场景：登录后访问"我的 Pack""我的点赞"，在 Application → Cache Storage 中确认没有带 Bearer 的响应出现在任何缓存；断网后刷新这些页面，确认请求失败而不是回显旧数据；匿名访问首页 trending，确认公共响应仍写入 `cross-origin` 缓存。验证：三项观察结果记录在提交说明里。
- [x] 3.3 验证旧缓存迁移：先在 `master`（旧 SW）的生产构建里登录并访问"我的 Pack"，确认 `cross-origin` 缓存里有该响应；再切到本变更的生产构建重载，等待新 SW 激活。验证：激活后 Cache Storage 中不再有该条目，预缓存相关缓存仍在。

## 4. 文档

- [x] 4.1 更新 `docs/SERVICE_WORKER_GUIDE.md`：补充"带 `Authorization` 的请求只走网络、不缓存"与"激活时清理 `cross-origin` / `apis`"，修正策略对照表里把 API 整体标为 NetworkOnly 的表述，并注明"凭证只能通过 `Authorization` 头传递，新增凭证方式须同步更新匹配器与测试"。验证：文档中不再出现与实际策略矛盾的描述，且文中提到的文件路径和命令可照着执行。

## Workflow follow-up

- 评审通过后归档本变更，并确认归档后 `openspec/specs/sw-cache-privacy/` 已生成。
