## 1. Publisher pagination

- [x] 1.1 Add `parsePublisherQuery` helper (`^publisher:\s*(.+)$`) and use it from apps page, Search, and Add Apps dialog
- [x] 1.2 On `/apps`, treat `publisher:` as paginated list: `GET /publishers/:id?offset&limit=60`, read `{ total, offset, limit, data }`, show existing Pagination; keep `q` in next/previous URL; reset `page` when publisher changes
- [x] 1.3 Stop `Search.js` from fetching/rendering the full list when `/apps` already owns publisher results (`hideInput`); Pack preview `publisher:` still requests `offset=0` and reads `data`
- [x] 1.4 Paginate Add Apps dialog when input is `publisher:` (same publishers envelope and dialog Pagination); non-publisher search stays one page
- [x] 1.5 Update `MoreByPublisher` to `GET /publishers/:id?offset=0&limit=5`, show up to 4 apps excluding current, use envelope `total` for View All, keep `/apps?q=publisher: …` link

## 2. Search results pagination

- [x] 2.1 Extend query helper so keyword / `tags:` / `name:` / `desc:` build `GET /apps/search` URLs with `offset` and `limit`
- [x] 2.2 On `/apps`, paginate non-publisher `q` the same way as the catalog (page list + Pagination + preserve `q`); `Search.js` does not render the full result list on that page
- [x] 2.3 Paginate Add Apps dialog keyword/prefix search with the same envelope; keep Pack `limit=N` preview and suggest without pagination

## 3. Remove client sort

- [x] 3.1 Remove `ListSort` / `applySort` from `/apps` and Add Apps dialog; stop applying client sort to fetched pages
- [x] 3.2 Delete unused `ListSort.js` (and styles if unused); change `RecentApps` View All from `/apps?sort=update-desc` to `/apps`
