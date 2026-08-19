## Context

See proposal.md — Why。API 分页契约已上线：`GET /apps/search` 与 `GET /publishers/:id` 均返回 `{ total, offset, limit, data }`（默认 limit 60、上限 200）。Web 全量目录已用 `GET /apps?offset&limit` 翻页；`?q=` 时 `Search.js` 自己拉第一页并关掉页面 Pagination。`publisher:` 仍打 publishers，但未传 `offset`，且曾按数组解析。Add Apps 对话框搜索不翻页；`ListSort` 只排当前页。

实现必须分三步，互不提前：① publisher 分页 ② 搜索结果分页 ③ 删除页面排序。

## Goals / Non-Goals

**Goals:**
- `/apps` 按查询种类选 endpoint，共用现有 Previous/Next 与 `page` query
- 对话框与结果页共用同一套前缀解析
- 预览（Pack `limit=N`、suggest、More by）保持单页

**Non-Goals:**
- 不改 winstall-api、不抬 search `CANDIDATE_LIMIT`
- 不给 `GET /apps` / publishers 在 Web 或本次 API 中补默认「最近更新」排序
- 不把 publisher 浏览改成 `/apps/search?q=`

## Decisions

### 1. `/apps` 按查询种类接管列表，而不是给 Search.js 加一套翻页
- **选择**：`pages/apps.js` 根据 `q` 选择 `/apps`、`/publishers/:id` 或 `/apps/search`，自己画列表与 Pagination。`Search.js` 在结果页（`hideInput`）不拉数、不渲染完整列表；Pack 预览仍由 `Search.js` 拉一页。
- **理由**：页面已有 offset 分页与键盘左右；搜索模式只是藏掉了它。
- **替代**：Search.js 内嵌 Pagination — 与目录翻页重复，URL `page` 难统一。

### 2. 分三步落地，publisher 先独立闭环
- **选择**：第一步只认 `publisher:`：结果页 + Add Apps 对话框走 publishers 信封，More by 用小 limit + `total`。关键词 / `tags:` / `name:` / `desc:` 仍保持现网一页，直到第二步。第三步才删 `ListSort` / `applySort` / `?sort=`。
- **理由**：API publishers 已 breaking；先接线可恢复 View All。搜索翻页与去排序是独立 UX。
- **替代**：一次改三套 — 已否决。

### 3. 共用前缀解析，第一步只抽 publisher
- **选择**：`parsePublisherQuery(q) → name | null`（`^publisher:\s*(.+)$`）。第二步再扩展为 list / search / publisher URL builder。
- **理由**：三处正则不一致会把 `publisher: X` 打到 search。
- **替代**：第一步就做完整 query helper — 可以，但搜索 URL 第二步才需要。

### 4. 翻页必须保留 `q`
- **选择**：`handleNext` / `handlePrevious` 的 `router.replace` 必须带上当前 `q`（及 `page`）。换 `q` 时 `page` 回到 1。
- **理由**：现网翻页只写 `{ page }`，搜索/publisher 一翻页会掉回全量目录。

### 5. More by 用信封 `total`，limit 略大于预览数
- **选择**：`GET /publishers/:id?offset=0&limit=5`，展示最多 4 条（排除当前 app）；View All 当 `total > 1` 或过滤后仍有更多。链接仍为 `/apps?q=publisher: ${publisher}`。
- **理由**：不再一次默认 60；`total` 是真计数，不靠本页 slice。
- **替代**：`limit=4` 不够排除当前 app 后再判断是否还有。

### 6. 客户端不排序；不传 `sort`
- **选择**：第三步删除 `ListSort.js` 与所有 `applySort`。列表请求不带 `sort`。`RecentApps` 的 `/apps?sort=update-desc` 改为 `/apps`。
- **理由**：顺序由 API 默认规则决定。`GET /apps` 与 publishers 当前为自然序；search 为相关度。
- **替代**：Web 继续排当前页 — 与需求冲突。

## Risks / Trade-offs

- [search `total` 最大约 500] → UI 按 API `total` 翻页；不在本次抬候选窗口。
- [去掉 ListSort 后目录不再「每页像最近更新」] → 接受 API 自然序；若要最近更新，另开 API 默认 sort。
- [第一步期间关键词搜索仍只有一页] → 有意；第二步补齐。

## Migration Plan

1. 部署 Web 第一步（publisher 信封 + 结果页/对话框翻页 + More by）。
2. 第二步搜索分页。
3. 第三步删除排序控件。
4. 回滚：还原对应文件；API 信封不回退。

## Open Questions

无。页大小沿用 60；publishers/search limit 上限 200 由 API 截断。
