# pack-api-client Specification

## Purpose

Defines how the winstall web app consumes Pack CRUD, lists, stats, and account-delete cascade exclusively from winstall-api (browser-direct or server-side), with no local Pack authority, cutover flag, or web-side pack content moderation.

## Requirements

### Requirement: Pack traffic always uses the API

The system MUST send browser Pack create, read, update, delete, copy, my-list, and public-list requests to winstall-api Pack endpoints at the runtime API origin. The system MUST NOT offer an environment flag or other runtime switch that sends those requests to a local Pack HTTP API as authority, and MUST NOT route them through a same-origin `/api/winstall` forwarder. Path and method mapping MUST be:

| Client intent | API |
|---------------|-----|
| List my packs | `GET /packs/me` |
| List public packs | `GET /packs` (query: `offset`, `limit`, `sort`, `q`) |
| Create pack | `POST /packs` |
| Get / update / delete pack | `GET` / `PATCH` / `DELETE /packs/:id` |
| Copy pack | `POST /packs/:id/copy` |

The browser MUST authenticate Pack writes and “my packs” with the session-issued API JWT as `Authorization: Bearer`. Public list and anonymous detail reads MUST omit Bearer. A signed-in `GET /packs/:id` MUST attach Bearer only when an unexpired session API JWT is available, so an expired token cannot turn an otherwise public read into a 401.

#### Scenario: Create pack after hard cut
- **WHEN** a signed-in user creates a pack from the UI
- **THEN** the request reaches winstall-api as `POST /packs` from the browser with the session API JWT, and MUST NOT be served by a local Web Pack create route or a `/api/winstall` forwarder

#### Scenario: List my packs after hard cut
- **WHEN** a signed-in user opens their packs list
- **THEN** the client obtains data from `GET /packs/me` on the API origin with the session API JWT

#### Scenario: Public list is anonymous
- **WHEN** a client requests the public pack list
- **THEN** the request MUST be `GET /packs` on the API origin and MUST omit `Authorization`

#### Scenario: No local-authority fallback
- **WHEN** `WINSTALL_API_BASE` is configured and a Pack list or write is requested
- **THEN** the system MUST NOT fall back to a local `/api/packs` handler or local Pack collection as the source of truth

### Requirement: Local Pack HTTP and document store are absent

The web app MUST NOT expose local HTTP routes under `/api/packs` for Pack CRUD, public listing, copy, or view/download increment. The web app MUST NOT keep a local Pack or PackLike document model as a runtime dependency for those operations. Account deletion MUST remove the user’s packs on the API and MUST NOT require a second delete against a local Pack collection to be correct.

#### Scenario: Local pack routes are gone
- **WHEN** a client requests any path under `/api/packs`
- **THEN** the system MUST NOT return a successful Pack CRUD, list, copy, or stats increment from a local Web handler

#### Scenario: Account deletion clears API packs only
- **WHEN** a signed-in user deletes their account
- **THEN** packs previously owned by that user on the API MUST no longer be returned by `GET /packs/:id` for those ids, without relying on a local Pack collection cleanup to achieve that

### Requirement: Pack view and download counts use analytics track

Pack view and download increments MUST be recorded via winstall-api analytics (`POST /analytics/track` with `targetType` pack) at the runtime API origin. Track requests MUST include a `sessionId` and event type `view` or `download`. Track failures MUST NOT block core Pack UX. Lifetime counts for display MUST be read from `GET /packs/:id/stats` on the API origin, not from an embedded `stats` object on the Pack document. App view and download tracks MUST use the same API `POST /analytics/track` surface (`targetType` app) and MUST NOT go through `/api/apps/:id/stats`.

#### Scenario: Viewing a pack tracks view
- **WHEN** a user views a public or unlisted pack detail
- **THEN** the system records a pack `view` track via the API origin `POST /analytics/track` with `sessionId`, and MUST NOT POST `/api/winstall/analytics/track` or a local `/api/packs/:id/stats` increment

#### Scenario: Viewing an app tracks view
- **WHEN** a user views an app detail
- **THEN** the system records an app `view` track via the API origin `POST /analytics/track` with `sessionId`, and MUST NOT POST `/api/apps/:id/stats`

### Requirement: Server-rendered Pack reads use the API

Homepage recommended or official packs, the packs sitemap, and any other SSR or build-time Pack reads MUST obtain Pack data from winstall-api. They MUST NOT query a local Pack collection as authority. Those server-side requests MUST NOT attach `AuthKey` or `AuthSecret`; public Pack list and detail reads MUST succeed without those headers.

#### Scenario: Homepage recommended packs from API
- **WHEN** the homepage is generated or revalidated
- **THEN** recommended pack data MUST come from the API Pack surface

#### Scenario: Pack sitemap from API
- **WHEN** the packs sitemap is generated
- **THEN** listed pack ids MUST come from API-backed public pack data

#### Scenario: SSR Pack read without AuthKey
- **WHEN** the server fetches public packs from winstall-api during render or revalidation
- **THEN** the request MUST NOT include `AuthKey` or `AuthSecret`

### Requirement: Pack payloads stay UI-compatible without web-side moderation

Pack payloads returned to the UI MUST remain usable by existing Pack pages: document `_id`, `name`, `description`, `visibility`, `status`, `defaultInstallOptions`, and `apps` elements with `_id` / `name` / `latestVersion` (or equivalent formatted fields). The web app MUST NOT apply a separate local content-moderation gate before create or update; rejected or accepted pack text is determined by the API response.

#### Scenario: Detail page loads without embedded stats
- **WHEN** the pack detail page loads a public pack
- **THEN** the page MUST render pack metadata and apps from the Pack payload without depending on `pack.stats` on that document

#### Scenario: Create uses API validation only
- **WHEN** a signed-in user submits a new pack whose name or description the API rejects
- **THEN** the UI MUST surface the API error and MUST NOT have already accepted the pack via a local moderation pass

### Requirement: Pack detail displays stats from the API

When a Pack detail page loads, the web app MUST request `GET /packs/:id/stats` on the API origin and MUST render lifetime view and download counts from that response. The request MUST omit `AuthKey` and `AuthSecret`. The page MUST NOT use `pack.stats` on the Pack document as the source of those counts.

#### Scenario: Pack detail reads stats
- **WHEN** a user opens a Pack detail page
- **THEN** the client MUST call `GET /packs/:id/stats` on the API origin and MUST NOT read view or download counts from `pack.stats`

#### Scenario: Pack stats read is anonymous
- **WHEN** the client requests `GET /packs/:id/stats`
- **THEN** the request MUST omit `Authorization` unless a later API contract requires a user token solely to include `liked`; it MUST still omit `AuthKey` and `AuthSecret`

### Requirement: Pack like uses the API

Pack like and unlike MUST be sent to winstall-api with the session API JWT. The web app MUST NOT restore a local PackLike document model or a local `/api/packs` like route.

#### Scenario: Pack like does not use a local store
- **WHEN** a signed-in user likes or unlikes a pack
- **THEN** the request MUST reach winstall-api and MUST NOT write a local PackLike row or hit a local `/api/packs` like handler
