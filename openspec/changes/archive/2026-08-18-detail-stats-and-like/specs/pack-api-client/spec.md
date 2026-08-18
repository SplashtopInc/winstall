## ADDED Requirements

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
