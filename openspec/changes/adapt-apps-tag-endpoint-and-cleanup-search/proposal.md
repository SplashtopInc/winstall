# Proposal

## Why

后端已在 `/apps/tags/:id` 提供了独立的标签列表端点，并对 `/apps/search` 全面落地了基于 Hybrid RRF（MongoDB 关键字 + Qdrant 语义向量）的搜索架构，清理了原有的字段级过滤参数。前端顶栏全局搜索框仅作为通用关键词输入入口，不再需要引导或支持 `name:` / `desc:` / `tags:` / `publisher:` 等前缀语法。对于标签和发布者浏览，由详情页上的交互链接直接分流到对应的专职端点，使搜索流程清晰解耦，并移除搜索结果为空时对 `/apps/related?q=` 的冗余回退调用。

## What Changes

- **解耦标签端点**：修改 `parseAppsListQuery`，当查询匹配 `tags:` 前缀时（如应用详情页点击 Tag 跳转产生的 `/apps?q=tags: <tag>`），解析为独立的 `kind: "tag"`，直接请求 `GET /apps/tags/:id` 并按信封分页，与 `/apps/search` 彻底解耦。
- **清理僵尸字段参数**：废弃 `name:` 与 `desc:` 字段过滤解析，若用户输入此类前缀，一律作为普通文本传给标准 `q` 参数；在 `appsListPath` 中移除对应的字段 query 参数。
- **收敛顶栏搜索提示**：移除全局搜索输入框右侧的气泡提示中关于 `name:`、`desc:`、`tags:`、`publisher:` 的前缀用法说明，使顶栏搜索回归纯粹的关键词搜索。
- **移除空搜索冗余回退**：移除 `pages/apps.js` 和 `components/Search.js` 在搜索结果为空时对 `TrySearching`（调用 `/apps/related?q=`）的兜底渲染，并同步修正 `SearchEmptyState.js` 的引导文案。

## Capabilities

### New Capabilities

无（沿用现有能力划分）。

### Modified Capabilities

- `apps-list-pagination`: 增加 Tag 浏览按 `GET /apps/tags/:id` 分页的要求；更新搜索分页要求，明确搜索仅传标准 `q` 参数且不带字段过滤。
- `search-query-collection`: 更新未标记采集的请求清单，明确 `tags:` 查询走专职端点且不发送 `X-Search-Record` 请求头。

## Impact

- **前端页面与组件**：
  - `utils/parsePublisherQuery.js`: 拆分 `parseTagQuery`，清理 `FIELD_PREFIX` 和 `suggestionQueryFromListQuery`。
  - `components/Search.js`: 移除搜索前缀 Tips 气泡与空态 `TrySearching`。
  - `pages/apps.js`: 移除搜索空态 `TrySearching`。
  - `components/SearchEmptyState.js`: 更新无结果时的文案提示。
- **接口调用**：
  - 标签浏览从 `GET /apps/search?q=<tag>&tags=<tag>` 迁移至 `GET /apps/tags/:id`。
  - 搜索结果为空时不再发起 `GET /apps/related?q=<query>` 向量回退。
- **测试**：
  - 更新 `test/parsePublisherQuery.test.js` 对应的前缀分类与路径生成断言。
