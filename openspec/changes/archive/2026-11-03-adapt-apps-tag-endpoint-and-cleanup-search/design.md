# Design

## Context

后端（`winstall-api`）近期已将 `/apps/search` 重构为基于 Hybrid RRF（MongoDB 关键字 + Qdrant 语义向量）检索，并在 `/apps/tags/:id` 提供了专职的标签列表接口。

目前前端：
- 在 `utils/parsePublisherQuery.js` 中将 `tags:` 前缀路由为 `/apps/search?q=<tag>&tags=<tag>`，同时支持已无后端消费的 `name:` 与 `desc:` 字段过滤；
- 在 `components/Search.js` 中通过悬浮的气泡（Tips）向用户展示前缀搜索说明；
- 在 `pages/apps.js` 和 `components/Search.js` 中，当搜索结果为空时，会继续调用 `<TrySearching />`，向 `/apps/related?q=` 发起二次向量查询作为兜底。

根据规划，前端需要将标签查询直接分流至专用端点，清理僵尸字段参数，关闭顶栏前缀语法引导，并彻底移除空搜索时的二次向量兜底请求。

## Goals / Non-Goals

**Goals:**
- 将 `tags:` 前缀在 `parseAppsListQuery` 中解析为独立的 `{ kind: "tag", tag }`，并在 `appsListPath` 中路由到 `/apps/tags/:id?offset={n}&limit={n}`。
- 保证应用详情页及应用卡片上点击标签（`/apps?q=tags: <tag>`）时，平滑调用 `/apps/tags/:id` 并支持原有 Load more 分页信封。
- 清理 `parseAppsListQuery` 中的 `name:` / `desc:` 字段模式，普通搜索统一由标准参数 `q` 承载。
- 移除顶栏全局搜索框的语法提示气泡（`Search tips`）。
- 移除搜索空态下的 `<TrySearching />` 组件调用与 `suggestionQueryFromListQuery` 辅助方法，并将 `SearchEmptyState` 文案更新为纯文本引导。

**Non-Goals:**
- 不重构或修改后端 `winstall-api` 接口。
- 不移除 `AppNotFound.js`（应用 404 页）中的 `TrySearching`，仅针对搜索无结果的场景清理冗余请求。
- 不改变 `/apps/:id`、`/packs/:id` 等既定页面路由硬约束。

## Decisions

### 1. `parseAppsListQuery` 架构升级

**选择：** 显式支持 `publisher` 与 `tag` 两种前缀模式，其余所有文本归一为标准 `search`。
- `TAG_PREFIX = /^tags:\s*(.+)$/i` 独立提取，返回 `{ kind: "tag", tag: string }`。
- `PUBLISHER_PREFIX = /^publisher:\s*(.+)$/i` 保留，返回 `{ kind: "publisher", publisher: string }`。
- 移除 `FIELD_PREFIX = /^(name|tags|desc):\s*(.+)$/i`。若用户手动输入 `name: foo`，解析为 `{ kind: "search", q: "name: foo" }`，完全由后端混合搜索自行分词与匹配。
- 路径生成：
  - `tagListPath(tag, { offset, limit })`: 构造 `/apps/tags/${encodeURIComponent(tag)}?offset=${offset}&limit=${limit}`。
  - `listScopeKey(parsed)`: 当 `parsed.kind === "tag"` 时，返回 `tag:${parsed.tag}`。

**备选考虑：**
- *完全删除 `tags:` 前缀支持，改为全新路由如 `/tags/:id`*：被否决。详情页和卡片已广泛使用 `/apps?q=tags: ${tag}`，保持 URL 格式能最大程度兼容外部书签和内部链接，且在解析层分流成本最低。

### 2. 搜索行为收敛与气泡提示移除

**选择：** 顶栏搜索框移除 `Search tips` 图标与下拉提示卡片。
- 用户在顶栏搜索框中只需要输入任意关键词，不需要关心底层的字段名。
- `Search.js` 中删除 `FiHelpCircle` 及其浮动内容，精简 DOM 与样式复杂度。

### 3. 移除搜索空态中的向量回退调用

**选择：** 从 `pages/apps.js` 和 `components/Search.js` 中移除 `<TrySearching />`。
- 后端 Hybrid RRF 已经在一次查询中聚合了词法与语义向量（Qdrant）。当搜索返回 0 条时，说明语义和关键字均无匹配，此时调用 `/apps/related?q=` 不仅命中率极低，还会造成额外的网络与模型计算浪费。
- `SearchEmptyState.js` 仅保留纯文字提示 `We couldn't find any apps matching your search. Try a different keyword.`，移除对下方建议的提及。

## Risks / Trade-offs

- **[Risk] 用户直接收藏了带 `name:` 或 `desc:` 前缀的书签 URL**
  → **Mitigation**: 原来后端也会忽略这些字段（或在升级后统一由标准 `q` 处理）。现在直接作为普通 `q` 参数传递给后端混合检索，依然可以召回相关应用，不影响页面可访问性。
- **[Risk] `tags:` 参数在特殊字符编码下可能导致后端 404**
  → **Mitigation**: 在 `tagListPath` 中统一使用 `encodeURIComponent(tag)`，与后端的 `/apps/tags/:id` 路由参数完全对齐。
