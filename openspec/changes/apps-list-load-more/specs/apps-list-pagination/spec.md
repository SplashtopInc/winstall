## MODIFIED Requirements

### Requirement: Publisher browse is paginated
WHEN the user opens an apps list scoped to a publisher (including `publisher:` queries on `/apps` and in the Add Apps dialog), the system MUST request `GET /publishers/:id` with `offset` and `limit` and MUST render from the `{ total, offset, limit, data }` envelope so the user can reach every app counted in `total`. The system MUST NOT treat the publishers response as a bare array. Changing publisher scope MUST reset to offset 0. On `/apps`, the system MUST preserve the publisher query in the URL as `q`, MUST NOT write `page` or `offset` to the URL, and MUST reach further publisher apps with Load more (append). The system MUST NOT use Prev/Next page controls or arrow-key paging for that list. In the Add Apps dialog, the user MUST reach further publisher hits with Load more (append), MUST NOT use Prev/Next page controls for that list, and the dialog MUST preserve the publisher query in dialog state until the query is cleared or a category tab is activated.

#### Scenario: Publisher results page two
- **WHEN** a publisher has more apps than one page and the user opens the next page of `/apps?q=publisher: <name>`
- **THEN** the UI appends the next slice of that publisher’s apps via Load more without replacing already shown cards, and the user can reach every app counted in API `total`

#### Scenario: Add Apps dialog publisher prefix
- **WHEN** the user types a `publisher:` query in the Add Apps dialog for a publisher with more than one page of apps
- **THEN** the dialog shows Load more for that publisher list and does not cap the user at the first page

#### Scenario: Publisher View All from app detail
- **WHEN** an app detail shows more apps by the same publisher than the preview size
- **THEN** the system fetches a small first page from `GET /publishers/:id` and offers View All that opens the paginated publisher list on `/apps`

### Requirement: Search results are paginated
WHEN the user views keyword search results on `/apps` (including `tags:`, `name:`, and `desc:` prefixes) or searches in the Add Apps dialog without a publisher prefix, the system MUST request `GET /apps/search` with `q`, `offset`, and `limit` (plus field filters for prefixes) and MUST use `{ total, offset, limit, data }` so the user can browse every hit reported in `total`. Changing the query MUST reset to offset 0. On `/apps`, the user MUST reach further search hits with Load more (append), MUST NOT use Prev/Next page controls or arrow-key paging, MUST keep the search query in the URL as `q`, and MUST NOT write `page` or `offset` to the URL. In the Add Apps dialog, the user MUST reach further search hits with Load more (append) and MUST NOT use Prev/Next page controls. Limited previews (Pack add-app search, typeahead suggest) MUST NOT paginate; they MAY link to the full `/apps?q=` results page.

#### Scenario: Keyword search page two
- **WHEN** a keyword search on `/apps` has more hits than one page and the user opens the next page
- **THEN** the UI appends the next slice of search hits via Load more without replacing already shown cards, and the user can reach every hit counted in the API envelope `total`

#### Scenario: Tag prefix uses search envelope
- **WHEN** the user searches with a `tags:` prefix
- **THEN** the system uses `GET /apps/search` with the tag filter and paginates that envelope the same way as keyword search

#### Scenario: Preview search stays one page
- **WHEN** a Pack add-app preview search uses a small result limit
- **THEN** the preview shows at most that many apps and does not present result pagination

### Requirement: Client does not sort app lists
The apps catalog, search results, publisher browse, and Add Apps dialog MUST NOT expose a sort control and MUST NOT reorder the currently shown apps on the client. List order MUST be the order returned by the API. The system MUST NOT send a `sort` query parameter on these list requests.

#### Scenario: Catalog has no sort control
- **WHEN** the user opens `/apps` with no search query
- **THEN** the page shows apps in API order with Load more when `total` exceeds the first batch and does not offer a sort dropdown

#### Scenario: Search and publisher lists have no sort control
- **WHEN** the user views paginated search or publisher results
- **THEN** the UI does not offer client-side sort and displays apps in API order

## ADDED Requirements

### Requirement: `/apps` 全量目录用 Load more
在 `/apps` 且没有生效搜索查询时，系统 MUST 请求 `GET /apps`，带 `offset` 与 `limit`，`limit` MUST 为 56，MUST NOT 发送 `sort`。系统 MUST 使用 `{ total, offset, limit, data }` 渲染。当 `total` 大于已展示条数时 MUST 展示 Load more；激活 Load more MUST 追加下一批且不得替换已展示卡片。系统 MUST NOT 展示 Prev/Next、顶栏小翻页或左右方向键翻列表。系统 MUST NOT 展示「Showing … of N apps (page x of y)」这类当前页范围文案。无查询标题仍可展示应用总数。

#### Scenario: 无查询时用 Load more 追加
- **WHEN** 用户打开 `/apps` 且全量目录超过第一批，并激活 Load more
- **THEN** 已展示卡片仍在，下一批追加在其后，且请求 `GET /apps` 的 `limit` 为 56

#### Scenario: 无范围页码文案
- **WHEN** 用户在 `/apps` 查看有结果的目录或搜索列表
- **THEN** 页面 MUST NOT 展示 Showing 当前切片范围或 page x of y 的文案

### Requirement: 地址栏忽略并剥除 page
系统 MUST 把 `/apps` 上的 `q`（若有）当作列表范围来源，MUST NOT 把地址栏 `page` 或 `offset` 当作列表分页来源。打开带 `page` 的 `/apps` URL 时，系统 MUST 从 offset 0 加载第一批，MUST 用 Load more 而非跳到对应页切片，并 MUST 从地址栏剥除 `page`。更换查询 MUST 丢弃已展示列表并从 offset 0 重新加载，且 MUST NOT 把 `page` 写回 URL。

#### Scenario: 旧 page 书签落到第一批
- **WHEN** 用户打开 `/apps?page=2` 或 `/apps?q=chrome&page=2`
- **THEN** 系统展示第一批卡片，提供 Load more（当 `total` 大于第一批时），MUST NOT 请求与第 2 页对应的 offset，且地址栏不再带 `page`
