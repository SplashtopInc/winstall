## Context

需求见同目录 `spec.md`。

winstall-api 在 `GET /apps/search` 的缓存之前读取 `X-Search-Record: 1`。`q` trim 后非空且不超过 300 字、且没有 `tags` 参数时写入一行；Bearer 能校验时写入 `userId`，否则写入 `null`。无效令牌不返回 401。响应信封不变。

网站侧：全局搜索框的输入建议打 `GET /apps/suggest`。回车在没有高亮建议时，以及 “View all results”，都进入 `/apps?q=`。结果页按查询拉第一页；`offset` 0 的关键词、`tags:`、`name:`、`desc:` 走 `GET /apps/search`，`publisher:` 走 `GET /publishers/:id`，Load more 用更大的 `offset`。同一 `q` 不会再次请求。只有带记录选项的那一次搜索附上未过期的 session API JWT。Add Apps 与 Pack 预览另有自己的 `/apps/search` 调用，不带记录头。

## Goals / Non-Goals

**Goals:**

- 一次合格提交正好给随后那一个第一页 `GET /apps/search` 加上记录头。
- 仅这次请求在令牌未过期时附带 session API JWT。
- 标记在跳转之后、页面效应重跑之前仍然在，并且只会被消费一次。

**Non-Goals:**

- 不改 `GET /apps/suggest`、本地 Recent 的条数与结构、搜索 URL 或分页。
- 不让 Add Apps、Pack 预览、Load more、直接打开的结果链接带记录头。
- 不改 winstall-api，也不为 `publisher:` 额外发一次 `/apps/search`。
- 不根据 300 字或 `tags` 在客户端丢掉记录头。API 会自己跳过。

## Decisions

### 1. 用一次性标记连接提交和结果请求

对话框不自己打 `GET /apps/search`。提交时若目标路径与当前路径不同，把 trim 后的原词写入 `sessionStorage` 键 `winstall.pendingSearchRecord`，值为 `{ text, expiresAt }`。`expiresAt` 为写入后 30 秒。然后照旧进入 `/apps?q=`。

结果页在发起第一页请求之前同步读取并删除该键。仅当未过期、`text` 与页面 `q` trim 后一致、且这次解析是 `search`、`offset` 为 0 时，给该次请求加上记录选项。publisher、目录列表、Load more 即使读到匹配的词，也删除标记且不带头，避免泄漏到下一次关键词搜索。

同一路径不再写入。这样已经打开的结果页再提交同一个词时，不会留下一枚以后刷新才消耗的标记。

**替代方案**：提交时先发带头的搜索，再让结果页再发一次。多一次请求，而且对话框关闭时的导航可能留下没有对应结果页的记录。把是否记录编进搜索 URL 会让 Add Apps 和 Pack 预览一起写入。

### 2. 记录选项只存在于这一次调用

请求助手接受调用方选项 `recordSearch: true`。该选项不进入 URL。为真时设置 `X-Search-Record: 1`；浏览器里 session API JWT 未过期时再设置 `Authorization: Bearer`。过期或缺失则省略 `Authorization`。不把 `/apps/search` 放进现有的强制或可选 JWT 判断，因此其它搜索仍匿名。这次请求失败不因 401 重试：过期令牌根本不会发出，API 对无效令牌也不会把搜索打成 401。

**替代方案**：所有 `/apps/search` 都附 JWT。搜索缓存键不含 `Authorization`，功能上可行，但会把身份附到 Load more、Add Apps 和预览搜索上，超出采集范围。

### 3. 开发环境双次效应只消费一次

标记的删除发生在任何 `await` 之前。同一次提交若把加载效应跑两遍，第一遍拿走标记并发出带头请求，第二遍已经没有标记，发出的是普通搜索。服务端对每个带头请求各写一行，所以不能两遍都带头。

## Risks / Trade-offs

- [Risk] 自定义头和 `Authorization` 会让原本简单的跨域 GET 先发 OPTIONS。API CORS 会反射预检头。 → **Mitigation**: 只给这一次请求加头。若预检失败，搜索错误与今天的失败表现相同，不自动改走无头重试，以免把采集失败伪装成成功采集。
- [Risk] 标记写完后、结果页消费前，用户又离开。 → **Mitigation**: 结果页读取时删除该键。未过期且与当前 `q` 一致才带头。超过 30 秒的标记在读取时丢弃。
- [Risk] `name:` / `desc:` 记下来的 `text` 是参数 `q` 的值，不含前缀。`tags:` 带了头也不会被 API 写入。`publisher:` 没有搜索请求。 → **Mitigation**: 接受 API 已定的规则，客户端不改查询形状。
- [Risk] 提交后 30 秒内结果页仍未发出第一页请求，则这次不采集。 → **Mitigation**: 正常跳转远短于 30 秒。不延长到跨刷新仍有效。

## Migration Plan

API 已先部署。本变更发布后，新的合格提交开始写入。回滚前端后不再带头，已写入的文档仍由 API 的 TTL 删除。无前端数据迁移。

## Open Questions

无。
