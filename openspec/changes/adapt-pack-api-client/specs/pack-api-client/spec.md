## Purpose

Defines how the winstall web app consumes Pack CRUD, lists, and stats from winstall-api through the existing BFF—without browser JWT direct access—while keeping local Pack routes available for rollback until a later cleanup change.

## ADDED Requirements

### Requirement: Pack client traffic goes to API via BFF

The system MUST route browser Pack CRUD and list requests through the Web BFF (`/api/winstall…`) to winstall-api Pack endpoints. The system MUST NOT send those requests to local `/api/packs/*` as the authority after cutover. Path and method mapping MUST be:

| Client intent | BFF → API |
|---------------|-----------|
| List my packs | `GET /packs/me` |
| List public packs | `GET /packs` (query: `offset`, `limit`, `sort`, `q`) |
| Create pack | `POST /packs` |
| Get / update / delete pack | `GET` / `PATCH` / `DELETE /packs/:id` |
| Copy pack | `POST /packs/:id/copy` |

#### Scenario: Create pack via BFF
- **WHEN** a signed-in user creates a pack from the UI after cutover
- **THEN** the request reaches winstall-api as `POST /packs` via `/api/winstall`, not via local `POST /api/packs/create` writing Web Mongo as authority

#### Scenario: List my packs via BFF
- **WHEN** a signed-in user opens their packs list after cutover
- **THEN** the client obtains data from `GET /packs/me` via the BFF

#### Scenario: Public list pagination shape preserved
- **WHEN** the client requests public packs with `offset` / `limit`
- **THEN** the response usable by the UI MUST expose `{ total, offset, limit, data }` consistent with the API contract

### Requirement: BFF issues user JWT for protected Pack API paths

For Pack paths that require a user identity on the API, the BFF MUST require a NextAuth session and attach a short-lived Bearer JWT whose `userId` claim is the session public id. Protected paths MUST include at least: `POST /packs`, `PATCH /packs/:id`, `DELETE /packs/:id`, `POST /packs/:id/copy`, and `GET /packs/me`. Unauthenticated calls to those paths MUST receive 401 from the BFF (or equivalent) without forwarding as an anonymous write.

#### Scenario: Unauthenticated create blocked at BFF
- **WHEN** an unauthenticated client attempts `POST /api/winstall/packs` (create)
- **THEN** the BFF MUST NOT forward a successful create to the API without a user JWT

#### Scenario: My packs requires session
- **WHEN** an unauthenticated client requests `GET /api/winstall/packs/me`
- **THEN** the request MUST fail with authentication required

#### Scenario: Public pack list does not require user JWT
- **WHEN** a client requests `GET /api/winstall/packs` for the public list
- **THEN** the BFF MAY forward without a user JWT (service AuthKey/Secret as today)

### Requirement: Pack document responses remain UI-compatible

Pack payloads returned to the UI MUST remain usable by existing Pack pages and helpers: document `_id` (nanoid), `name`, `description`, `visibility`, `status`, `defaultInstallOptions`, and `apps` elements with `_id` / `name` / `latestVersion` (or equivalent formatted fields), not raw storage-only field names alone. Responses MUST NOT require the UI to read an embedded `stats` object on the Pack document for correct CRUD/list display.

#### Scenario: Detail page loads public pack without embedded stats
- **WHEN** the pack detail page loads a public pack after cutover
- **THEN** the page MUST render pack metadata and apps from the Pack payload without depending on `pack.stats` on that document

### Requirement: Pack view and download counts use analytics track

After cutover, Pack view and download increments MUST be recorded via winstall-api analytics (`POST /analytics/track` with `targetType` pack) reached through the Web BFF (`POST /api/winstall/analytics/track`). The browser MUST NOT POST `/api/packs/:id/stats` while the cutover flag is on. Track requests MUST include a `sessionId` and event type `view` or `download`. Failures of track MUST NOT block core Pack UX. Lifetime counts for display MUST be read from `GET /packs/:id/stats` (PackStats), not from embedded Pack `stats`.

#### Scenario: Viewing a public pack tracks view
- **WHEN** a user views a public or unlisted pack detail after cutover
- **THEN** the system records a pack `view` track via `/api/winstall/analytics/track` with `sessionId`, not via `/api/packs/:id/stats`

#### Scenario: Local pack stats $inc is not the authority
- **WHEN** Pack traffic has been cut over to the API
- **THEN** successful view/download counting MUST NOT rely on Web Mongo `incrementViewCount` / `incrementDownloadCount` as the source of truth

### Requirement: Server-rendered and build-time Pack reads use the API

Homepage recommended/official packs, pack sitemaps, and any other SSR or build-time Pack reads that today query Web Mongo Pack collections MUST obtain Pack data from winstall-api using server-side credentials (AuthKey/Secret and/or BFF-equivalent), not `Pack.find` against the local authority collection after cutover.

#### Scenario: Homepage recommended packs from API
- **WHEN** the homepage is generated or revalidated after cutover
- **THEN** recommended pack data MUST come from the API Pack surface, not from local Mongoose `Pack.find` as authority

#### Scenario: Pack sitemap from API
- **WHEN** the packs sitemap is generated after cutover
- **THEN** listed pack ids MUST come from API-backed public pack data

### Requirement: Account deletion removes API-owned packs

When a user deletes their account, the system MUST remove that user’s active Packs in winstall-api (for example by listing `GET /packs/me` then `DELETE /packs/:id` for each, using server-side AuthKey/Secret plus user identity as required by the API), and MUST NOT leave API Packs orphaned solely because local Web Mongo Pack rows were deleted.

#### Scenario: Delete account clears API packs
- **WHEN** a signed-in user deletes their account after cutover
- **THEN** packs previously owned by that `userId` on the API MUST no longer be returned by `GET /packs/:id` for those ids

### Requirement: Local Pack routes retained; no browser JWT direct access

This change MUST NOT remove `pages/api/packs/*`, local `packService`, or `dbModel/Pack*` as a rollback surface. While the cutover flag is on, the system MUST NOT send Pack CRUD, list, SSR, or stats/track requests to `/api/packs/*`; those modules exist only for flag-off rollback. The browser MUST NOT be required to hold or send an API JWT for Pack operations in this change; session cookie + BFF proxy remains the authenticated client path.

#### Scenario: Local pack API files still present after adapter ships
- **WHEN** this change is implemented and cut over
- **THEN** local `/api/packs` route modules MAY still exist in the repo for rollback, even if unused by the primary client path

#### Scenario: Flag on sends no traffic to local pack routes
- **WHEN** the Pack API cutover flag is on
- **THEN** browser and SSR Pack traffic MUST go through `/api/winstall…` or server-side API credentials, and MUST NOT call `/api/packs/*` (including `/api/packs/:id/stats`)

#### Scenario: No client-held API JWT required for Pack
- **WHEN** a user creates or edits a pack after this change
- **THEN** the browser MUST authenticate via the existing session/BFF flow, not by attaching a long-lived API JWT obtained for direct API access
