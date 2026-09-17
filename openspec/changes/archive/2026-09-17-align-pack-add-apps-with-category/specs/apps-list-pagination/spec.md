## MODIFIED Requirements

### Requirement: Publisher browse is paginated
WHEN the user opens an apps list scoped to a publisher (including `publisher:` queries on `/apps` and in the Add Apps dialog), the system MUST request `GET /publishers/:id` with `offset` and `limit` and MUST render from the `{ total, offset, limit, data }` envelope so the user can reach every app counted in `total`. The system MUST NOT treat the publishers response as a bare array. Changing publisher scope MUST reset to offset 0. On `/apps`, pagination controls MUST preserve the publisher query in the URL. In the Add Apps dialog, the user MUST reach further publisher hits with Load more (append), MUST NOT use Prev/Next page controls for that list, and the dialog MUST preserve the publisher query in dialog state until the query is cleared or a category tab is activated.

#### Scenario: Publisher results page two
- **WHEN** a publisher has more apps than one page and the user opens the next page of `/apps?q=publisher: <name>`
- **THEN** the UI shows the next slice of that publisher’s apps and a range/total consistent with the API `total` and `offset`

#### Scenario: Add Apps dialog publisher prefix
- **WHEN** the user types a `publisher:` query in the Add Apps dialog for a publisher with more than one page of apps
- **THEN** the dialog shows Load more for that publisher list and does not cap the user at the first page

#### Scenario: Publisher View All from app detail
- **WHEN** an app detail shows more apps by the same publisher than the preview size
- **THEN** the system fetches a small first page from `GET /publishers/:id` and offers View All that opens the paginated publisher list on `/apps`

### Requirement: Search results are paginated
WHEN the user views keyword search results on `/apps` (including `tags:`, `name:`, and `desc:` prefixes) or searches in the Add Apps dialog without a publisher prefix, the system MUST request `GET /apps/search` with `q`, `offset`, and `limit` (plus field filters for prefixes) and MUST use `{ total, offset, limit, data }` so the user can browse every hit reported in `total`. Changing the query MUST reset to offset 0. On `/apps`, the catalog MUST keep page controls. In the Add Apps dialog, the user MUST reach further search hits with Load more (append) and MUST NOT use Prev/Next page controls. Limited previews (Pack add-app search, typeahead suggest) MUST NOT paginate; they MAY link to the full `/apps?q=` results page.

#### Scenario: Keyword search page two
- **WHEN** a keyword search on `/apps` has more hits than one page and the user opens the next page
- **THEN** the UI shows the next slice of search hits and a range/total consistent with the API envelope

#### Scenario: Tag prefix uses search envelope
- **WHEN** the user searches with a `tags:` prefix
- **THEN** the system uses `GET /apps/search` with the tag filter and paginates that envelope the same way as keyword search

#### Scenario: Preview search stays one page
- **WHEN** a Pack add-app preview search uses a small result limit
- **THEN** the preview shows at most that many apps and does not present result pagination
