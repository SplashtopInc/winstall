# Spec Delta: apps-list-pagination

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Search results are paginated
WHEN the user views keyword search results on `/apps` (excluding `publisher:` and `tags:` prefixes) or searches in the Add Apps dialog without a publisher or tag prefix, the system MUST request `GET /apps/search` with `q`, `offset`, and `limit` without field filter query parameters, and MUST use `{ total, offset, limit, data }` so the user can browse every hit reported in `total`. Any arbitrary prefix such as `name:` or `desc:` MUST be treated as literal query text and passed directly in `q`. Changing the query MUST reset to offset 0. On `/apps`, the user MUST reach further search hits with Load more (append), MUST NOT use Prev/Next page controls or arrow-key paging, MUST keep the search query in the URL as `q`, and MUST NOT write `page` or `offset` to the URL. Search result grids on `/apps` MUST NOT insert a shelf ad card. The first search batch and each Load more batch MUST request `limit` 60. In the Add Apps dialog, the user MUST reach further search hits with Load more (append) and MUST NOT use Prev/Next page controls. Limited previews (Pack add-app search, typeahead suggest) MUST NOT paginate; they MAY link to the full `/apps?q=`结果 page.

#### Scenario: Keyword search page two
- **WHEN** a keyword search on `/apps` has more hits than one page and the user opens the next page
- **THEN** the UI appends the next slice of search hits via Load more without replacing already shown cards, the grid MUST NOT contain a shelf ad card, and the user can reach every hit counted in the API envelope `total`

#### Scenario: Tag prefix uses search envelope
- **WHEN** the user searches with a `tags:` prefix
- **THEN** the system uses `GET /apps/tags/:id` for tag catalog browse rather than keyword search, maintaining equivalent list envelope pagination

#### Scenario: Preview search stays one page
- **WHEN** a Pack add-app preview search uses a small result limit
- **THEN** the preview shows at most that many apps and does not present result pagination
