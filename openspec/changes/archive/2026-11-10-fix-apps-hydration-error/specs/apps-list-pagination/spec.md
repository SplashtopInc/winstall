# Spec Delta

## MODIFIED Requirements

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
