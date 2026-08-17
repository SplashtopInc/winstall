## MODIFIED Requirements

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

### Requirement: Pack view and download counts use analytics track

Pack view and download increments MUST be recorded via winstall-api analytics (`POST /analytics/track` with `targetType` pack) at the runtime API origin. Track requests MUST include a `sessionId` and event type `view` or `download`. Track failures MUST NOT block core Pack UX. Lifetime counts for display MUST be read from `GET /packs/:id/stats` on the API origin, not from an embedded `stats` object on the Pack document. App view and download tracks MUST use the same API `POST /analytics/track` surface (`targetType` app) and MUST NOT go through `/api/apps/:id/stats`.

#### Scenario: Viewing a pack tracks view
- **WHEN** a user views a public or unlisted pack detail
- **THEN** the system records a pack `view` track via the API origin `POST /analytics/track` with `sessionId`, and MUST NOT POST `/api/winstall/analytics/track` or a local `/api/packs/:id/stats` increment

#### Scenario: Viewing an app tracks view
- **WHEN** a user views an app detail
- **THEN** the system records an app `view` track via the API origin `POST /analytics/track` with `sessionId`, and MUST NOT POST `/api/apps/:id/stats`
