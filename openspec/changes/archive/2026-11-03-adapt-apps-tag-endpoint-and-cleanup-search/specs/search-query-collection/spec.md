# Spec Delta: search-query-collection

## MODIFIED Requirements

### Requirement: Unrelated searches stay unmarked

下列请求 MUST NOT 带 `X-Search-Record`：全局搜索的输入建议、`/apps` 的 Load more、Add Apps 对话框里的搜索、Pack 内添加应用的预览搜索、刷新、分享链接或 OpenSearch 直接打开的 `/apps?q=`。点击最近搜索只填入输入框时 MUST NOT 发搜索请求。`publisher:` 提交后的结果请求 MUST 仍是 `GET /publishers/:id`，且 MUST NOT 为了采集另发 `GET /apps/search`。`tags:` 提交后的结果请求 MUST 为 `GET /apps/tags/:id`，且 MUST NOT 发送 `X-Search-Record`。若该次普通关键词提交会打标记，头只加在既有的第一页 `GET /apps/search` 上。

#### Scenario: Load more is unmarked

- **WHEN** 用户在 `/apps` 的搜索结果上加载更多
- **THEN** 该次 `GET /apps/search` 的 `offset` 大于 0，且不带 `X-Search-Record`

#### Scenario: A shared results link is unmarked

- **WHEN** 用户直接打开或刷新一个 `/apps?q=` 地址，而不是从当次全局搜索提交进来
- **THEN** 第一页 `GET /apps/search` 不带 `X-Search-Record`

#### Scenario: Add Apps search is unmarked

- **WHEN** 用户在 Add Apps 对话框里搜索应用
- **THEN** 其 `GET /apps/search` 不带 `X-Search-Record`，也不带 `Authorization`

#### Scenario: Publisher submission does not invent a search record

- **WHEN** 用户在全局搜索框提交 `publisher:` 查询
- **THEN** 结果来自 `GET /publishers/:id`，且没有任何请求带 `X-Search-Record`

#### Scenario: Tag browse request does not carry a search record

- **WHEN** 用户打开 `tags:` 查询的 `/apps` 页面
- **THEN** 结果来自 `GET /apps/tags/:id`，且没有任何请求带 `X-Search-Record`
