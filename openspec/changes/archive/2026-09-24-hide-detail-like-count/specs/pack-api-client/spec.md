## MODIFIED Requirements

### Requirement: Pack like uses the API

Pack like and unlike MUST be sent to winstall-api with the session API JWT. The signed-in like status on Pack detail MUST be read from `GET /packs/:id/like` with that JWT. Pack detail MUST NOT display a like count. The web app MUST NOT restore a local PackLike document model or a local `/api/packs` like route.

#### Scenario: Pack like does not use a local store
- **WHEN** a signed-in user likes or unlikes a pack
- **THEN** the request MUST reach winstall-api and MUST NOT write a local PackLike row or hit a local `/api/packs` like handler

#### Scenario: Pack like status uses GET like
- **WHEN** a signed-in user opens a Pack detail page
- **THEN** the client MUST call `GET /packs/:id/like` on the API origin with the session JWT and MUST NOT take the pressed state from `GET /packs/:id/stats`, and MUST NOT display a like count
