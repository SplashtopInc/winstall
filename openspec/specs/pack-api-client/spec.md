# pack-api-client Specification

## Purpose

Defines how the winstall web app consumes Pack CRUD, lists, stats, and account-delete cascade exclusively from winstall-api (via BFF or server credentials), with no local Pack authority, cutover flag, or web-side pack content moderation.

## Requirements

### Requirement: Pack traffic always uses the API

The system MUST route browser Pack create, read, update, delete, copy, my-list, and public-list requests through the Web BFF to winstall-api Pack endpoints. The system MUST NOT offer an environment flag or other runtime switch that sends those requests to a local Pack HTTP API as authority. Path and method mapping MUST be:

| Client intent | BFF → API |
|---------------|-----------|
| List my packs | `GET /packs/me` |
| List public packs | `GET /packs` (query: `offset`, `limit`, `sort`, `q`) |
| Create pack | `POST /packs` |
| Get / update / delete pack | `GET` / `PATCH` / `DELETE /packs/:id` |
| Copy pack | `POST /packs/:id/copy` |

The browser MUST authenticate Pack writes and “my packs” via the existing session and BFF user JWT, not by holding an API JWT for direct access.

#### Scenario: Create pack after hard cut
- **WHEN** a signed-in user creates a pack from the UI
- **THEN** the request reaches winstall-api as `POST /packs` via the BFF, and MUST NOT be served by a local Web Pack create route writing Web Mongo as authority

#### Scenario: List my packs after hard cut
- **WHEN** a signed-in user opens their packs list
- **THEN** the client obtains data from `GET /packs/me` via the BFF

#### Scenario: No local-authority fallback
- **WHEN** `WINSTALL_API_*` is configured and a Pack list or write is requested
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

Pack view and download increments MUST be recorded via winstall-api analytics (`POST /analytics/track` with `targetType` pack) through the Web BFF. Track requests MUST include a `sessionId` and event type `view` or `download`. Track failures MUST NOT block core Pack UX. Lifetime counts for display MUST be read from `GET /packs/:id/stats`, not from an embedded `stats` object on the Pack document.

#### Scenario: Viewing a pack tracks view
- **WHEN** a user views a public or unlisted pack detail
- **THEN** the system records a pack `view` track via `/api/winstall/analytics/track` with `sessionId`, and MUST NOT POST a local `/api/packs/:id/stats` increment

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
