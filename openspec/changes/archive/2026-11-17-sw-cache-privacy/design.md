# Design

## Context

背景与动机见 `proposal.md`。需求见 `specs/sw-cache-privacy/spec.md`。

当前 `sw/sw.ts` 的 `runtimeCaching` 由三部分组成：`_next/static` 的 NetworkFirst、追踪域名的 NetworkOnly，以及 `...defaultCache`（`@serwist/next/worker`，版本 9.5.15）。生产环境下 `defaultCache` 的相关规则如下：

| 规则 | 范围 | 策略 / 缓存名 |
|---|---|---|
| `/api/auth/*` | 同源 | NetworkOnly |
| 同源 `/api/*` 的 GET | 同源 | NetworkFirst，`apis`，24 小时 |
| 其余同源 | 同源 | NetworkFirst，`pages` / `pages-rsc*` / `others` |
| `!sameOrigin` | 所有跨源 | NetworkFirst，`cross-origin`，32 条、1 小时、10 秒超时 |
| `/.*/` 的 GET | 兜底 | NetworkOnly |

浏览器直连的 winstall-api 是跨源请求，因此落入 `cross-origin` 规则。请求本身是 `credentials: "omit"`、`cache: "no-store"`（见 `utils/fetchWinstallAPI.js`），认证只靠 `Authorization: Bearer`。Cache API 的 key 只有 URL，所以不同用户的响应共用同一个条目。

两个约束决定了方案：

- API origin 是运行时值（来自 `_document` 注入的 meta，规范见 `api-client-credentials`），而 SW 在构建期编译，构建时 `WINSTALL_API_BASE` 通常未设置（见 `pages/express.js` 的 Docker 构建注释）。所以 SW 里无法写死或比较 API origin。
- 同源一侧经核对不含用户数据：`pages/packs/[id].js` 的 `getServerSideProps()` 不读 session，`/api/auth/*` 已是 NetworkOnly，`pages/api/users/me.js` 只处理 DELETE，不会被缓存。因此泄露面只在跨源 API 的带凭证 GET。

SW 只拦截 GET（Serwist 路由默认方法为 GET），POST、PATCH、DELETE 本来就不会被缓存，无需处理。

## Goals / Non-Goals

**Goals:**
- 带 `Authorization` 的 GET 不读不写任何缓存，无离线回退。
- 清除旧版本已落盘的 `cross-origin` 与 `apis` 缓存。
- 判断逻辑可在 Node 下单测，不需要真实 Service Worker。

**Non-Goals:**
- 不改公共数据的缓存策略与时长（不引入 StaleWhileRevalidate，不新建 `winstall-api-public` 缓存）。
- 不为登录态数据做"离线可读"的加密缓存或按用户分区缓存。
- 不在登出时额外清缓存：修复后私有数据本来就不进缓存，无需清理。
- 不修改已归档的 `my-likes/design.md`。

## Decisions

### 决策 1：只按 `Authorization` 请求头判断，不比较 origin

规则匹配器为 `request.headers.has("Authorization")`，放在 `runtimeCaching` 数组第一项，处理器为 `new NetworkOnly()`。

- 头存在即判定为凭证请求，即使值为空字符串（`Headers.has` 语义）。宁可多一次不缓存，也不要因为值异常而漏缓存私有数据。
- 理由：API origin 只在运行时可知，SW 拿不到；按头判断对换域名、新增 API 域名都自动生效，也同时覆盖同源与跨源。
- 备选 A：`url.origin === API_ORIGIN`。需要把 origin 在构建期写进 SW，或运行时通过 postMessage / IndexedDB 同步，增加复杂度和时序问题（SW 启动早于页面读 meta）。放弃。
- 备选 B：按路径白名单（`/packs/me`、`/apps/liked` 等）。新增私有端点就会漏。放弃。
- 取舍：头判断依赖客户端始终用 `Authorization` 传凭证，这正是 `api-client-credentials` 规定的唯一凭证方式，可以依赖。

### 决策 2：不动 `defaultCache`，公共请求保持原行为

保留原有 `cross-origin` NetworkFirst 规则承接公共数据。片段里的"规则 2"（SWR、7 天、新缓存名）不采纳，原因是它改变公共数据新鲜度（trending、点赞数等），属于独立的产品决策，不应混在安全修复里。

### 决策 3：激活时一次性删除 `cross-origin` 与 `apis`

在 `activate` 里 `waitUntil` 删除这两个缓存，逐个 try/catch，失败不阻塞激活。

- 理由：已有用户浏览器里已经有落盘的私有条目。`cross-origin` 虽仍会被公共请求写入，ExpirationPlugin 只在写入或读取时才淘汰，不保证及时；`apis` 如果不再被使用就永远不会清理。显式删除最直接。
- 备选：改用新的缓存名而不删除旧名。旧名变孤儿，永不过期，反而留下残留。放弃。
- 安全性：删除只影响 `cross-origin` 与 `apis`；预缓存使用 Serwist 自己的缓存名，不在待删列表里，列表由测试断言。
- 不依赖 `skipWaiting` 之外的额外机制：现有配置 `skipWaiting: true`、`clientsClaim: true`，新 SW 会很快激活。

### 决策 3 补充：激活监听器的位置

`installSerwist` 自己会注册 `install` / `activate`（含旧预缓存清理）。新增的 `activate` 监听器与它并行，各自 `waitUntil`，互不依赖，放在 `installSerwist` 之后即可。

### 决策 4：判断与缓存名抽成纯模块

新增 `sw/cachePrivacy.js`（ESM，不引用 `self`），导出：

- `hasUserCredentials(request)`：请求带 `Authorization` 返回 true。
- `LEGACY_CACHE_NAMES`：`["cross-origin", "apis"]`。
- `purgeLegacyCaches(cacheStorage)`：接收类 `CacheStorage` 对象，逐个删除上述缓存并吞掉单个失败，返回 Promise。

`sw/sw.ts` 只做装配：把 `hasUserCredentials` 包成 matcher，把 `purgeLegacyCaches(self.caches)` 放进 `activate`。

- 理由：`sw.ts` 带 `self` 与顶层副作用，无法直接被 `node --test` 加载；纯函数加传入的 `cacheStorage` 就能用假对象测。
- 与项目一致：`tsconfig.json` 已开 `allowJs`，`utils/` 下也有大量被 `.test.js` 动态 `import()` 的 ESM `.js` 先例（例如 `utils/userPackReads.js`）。
- 备选：把模块写成 `.ts`。Node 22.23 虽可剥离类型，但本仓库其它被测模块都是 `.js`，保持一致。

## Risks / Trade-offs

- [登录态页面在离线时不再能读到上次的"我的 Pack / 点赞"] → 这是目标行为；这些数据本来不应该离线保留。公共页面不受影响。
- [有人以后把凭证放在 Cookie 或自定义头而不是 `Authorization`] → 规则失效。缓解：`api-client-credentials` 已规定只用 Bearer；在 `docs/SERVICE_WORKER_GUIDE.md` 注明此约束，新增凭证方式时必须同步更新匹配器与测试。
- [激活时清缓存让所有用户第一次访问后丢失公共缓存的离线能力] → 影响仅限一次，公共数据随后重新缓存；`cross-origin` 只有 1 小时寿命，损失很小。
- [`apis` 缓存里可能有当前功能依赖的同源 GET] → 经核对同源 `/api/` 下除 `/api/auth/*` 与 `/api/health` 外无浏览器端 GET 业务；`/api/health` 只被 `docker-compose.yml` 的容器健康检查（Node 直连）使用，不经过 SW。缓存本身只是网络失败时的回退，删除不影响功能。
- [`cache: "no-store"` 给人一种已规避 SW 缓存的错觉] → 已在本设计说明，不改客户端请求选项；`my-likes/design.md` 中的相关表述保留不动。
- [验证只能在生产构建下做：`next.config.js` 里 `disable: NODE_ENV !== "production"`] → 验证步骤必须走 `npm run build` 与 `npm start`，写进 tasks。

## Migration Plan

1. 合并并部署后，新 SW 由 `skipWaiting` 在客户端下一次加载时接管并激活，激活时清除旧缓存。
2. 回滚：还原 `sw/sw.ts` 即可恢复旧行为，但会重新带回泄露问题；回滚后旧缓存已被删除，不需要数据恢复。
3. 无数据库、无 API、无配置变更。
