# apps-list-pagination Specification

## Purpose

Lets users page through the full app catalog, keyword/tag search hits, and a publisher’s apps using the API list envelope, without client-side sort controls.

## Requirements

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

### Requirement: Tag browse is paginated
WHEN the user opens an apps list scoped to a tag (including `tags:` queries on `/apps` triggered by clicking tags in app detail or app cards), the system MUST request `GET /apps/tags/:id` with `offset` and `limit` and MUST render from the `{ total, offset, limit, data }` envelope so the user can reach every app counted in `total`. The system MUST NOT treat the tags response as a bare array. Changing tag scope MUST reset to offset 0.

#### Scenario: Tag results page two
- **WHEN** a tag has more apps than one page and the user opens the next page of `/apps?q=tags: <name>`
- **THEN** the UI appends the next slice of that tag's apps via Load more without replacing already shown cards, and the user can reach every app counted in API `total`

#### Scenario: App detail tag click opens paginated tag catalog
- **WHEN** the user clicks a tag pill on an app detail page or app card
- **THEN** the system opens `/apps?q=tags: <name>` and requests `GET /apps/tags/:id` with offset 0 and limit 60, without querying `/apps/search`

#### Scenario: Add Apps dialog tag query
- **WHEN** the user enters a `tags:` query in the Add Apps dialog
- **THEN** the dialog fetches apps from `GET /apps/tags/:id` and supports Load more without Prev/Next paging

### Requirement: Search results are paginated
WHEN the user views keyword search results on `/apps` (excluding `publisher:` and `tags:` prefixes) or searches in the Add Apps dialog without a publisher or tag prefix, the system MUST request `GET /apps/search` with `q`, `offset`, and `limit` without field filter query parameters, and MUST use `{ total, offset, limit, data }` so the user can browse every hit reported in `total`. Any arbitrary prefix such as `name:` or `desc:` MUST be treated as literal query text and passed directly in `q`. Changing the query MUST reset to offset 0. On `/apps`, the user MUST reach further search hits with Load more (append), MUST NOT use Prev/Next page controls or arrow-key paging, MUST keep the search query in the URL as `q`, and MUST NOT write `page` or `offset` to the URL. Search result grids on `/apps` MUST NOT insert a shelf ad card. The first search batch and each Load more batch MUST request `limit` 60. In the Add Apps dialog, the user MUST reach further search hits with Load more (append) and MUST NOT use Prev/Next page controls. Limited previews (Pack add-app search, typeahead suggest) MUST NOT paginate; they MAY link to the full `/apps?q=`结果 page. 当用户直接访问或刷新带 `q` 参数的 `/apps` URL 时，客户端首轮渲染 MUST 与服务端 SSG 静态预渲染 HTML 保持一致，不得产生 React 水合不匹配错误，并在水合完成后由副作用发起对应查询的加载。

#### Scenario: Keyword search page two
- **WHEN** a keyword search on `/apps` has more hits than one page and the user opens the next page
- **THEN** the UI appends the next slice of search hits via Load more without replacing already shown cards, the grid MUST NOT contain a shelf ad card, and the user can reach every hit counted in the API envelope `total`

#### Scenario: Tag prefix uses search envelope
- **WHEN** the user searches with a `tags:` prefix
- **THEN** the system uses `GET /apps/tags/:id` for tag catalog browse rather than keyword search, maintaining equivalent list envelope pagination

#### Scenario: Preview search stays one page
- **WHEN** a Pack add-app preview search uses a small result limit
- **THEN** the preview shows at most that many apps and does not present result pagination

#### Scenario: 直达搜索 URL 水合无错误
- **WHEN** 用户直接通过浏览器地址栏打开或刷新带有搜索关键词的页面如 `/apps?q=browser`
- **THEN** 客户端首轮渲染与预渲染静态页面完全一致且不抛出水合报错，随后客户端生命周期根据路由中的 `q` 加载对应搜索结果并更新界面

### Requirement: Client does not sort app lists
The apps catalog, search results, publisher browse, and Add Apps dialog MUST NOT expose a sort control and MUST NOT reorder the currently shown apps on the client. List order MUST be the order returned by the API. The system MUST NOT send a `sort` query parameter on these list requests.

#### Scenario: Catalog has no sort control
- **WHEN** the user opens `/apps` with no search query
- **THEN** the page shows apps in API order with Load more when `total` exceeds the first batch and does not offer a sort dropdown

#### Scenario: Search and publisher lists have no sort control
- **WHEN** the user views paginated search or publisher results
- **THEN** the UI does not offer client-side sort and displays apps in API order

### Requirement: `/apps` 全量目录用 Load more
在 `/apps` 且没有生效搜索查询时，系统 MUST 请求 `GET /apps`，带 `offset` 与 `limit`，MUST NOT 发送 `sort`。首屏 `limit` MUST 为 59，Load more 的 `limit` MUST 为 60。系统 MUST 使用 `{ total, offset, limit, data }` 渲染。当 `total` 大于已展示条数时 MUST 展示 Load more；激活 Load more MUST 追加下一批且不得替换已展示卡片。系统 MUST NOT 展示 Prev/Next、顶栏小翻页或左右方向键翻列表。系统 MUST NOT 展示「Showing … of N apps (page x of y)」这类当前页范围文案。无查询标题仍可展示应用总数。

#### Scenario: 无查询时用 Load more 追加
- **WHEN** 用户打开 `/apps` 且全量目录超过第一批，并激活 Load more
- **THEN** 已展示卡片仍在，下一批追加在其后，且该次请求 `GET /apps` 的 `limit` 为 60

#### Scenario: 无范围页码文案
- **WHEN** 用户在 `/apps` 查看有结果的目录或搜索列表
- **THEN** 页面 MUST NOT 展示 Showing 当前切片范围或 page x of y 的文案

### Requirement: 地址栏忽略并剥除 page
系统 MUST 把 `/apps` 上的 `q`（若有）当作列表范围来源，MUST NOT 把地址栏 `page` 或 `offset` 当作列表分页来源。打开带 `page` 的 `/apps` URL 时，系统 MUST 从 offset 0 加载第一批，MUST 用 Load more 而非跳到对应页切片，并 MUST 从地址栏剥除 `page`。更换查询 MUST 丢弃已展示列表并从 offset 0 重新加载，且 MUST NOT 把 `page` 写回 URL。

#### Scenario: 旧 page 书签落到第一批
- **WHEN** 用户打开 `/apps?page=2` 或 `/apps?q=chrome&page=2`
- **THEN** 系统展示第一批卡片，提供 Load more（当 `total` 大于第一批时），MUST NOT 请求与第 2 页对应的 offset，且地址栏不再带 `page`
