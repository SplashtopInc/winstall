## MODIFIED Requirements

### Requirement: Pack traffic always uses the API

The system MUST send browser Pack create, read, update, delete, copy, my-list, public-list, and public-quota requests to winstall-api Pack endpoints at the runtime API origin. The system MUST NOT offer an environment flag or other runtime switch that sends those requests to a local Pack HTTP API as authority, and MUST NOT route them through a same-origin `/api/winstall` forwarder. Path and method mapping MUST be:

| Client intent | API |
|---------------|-----|
| List my packs | `GET /packs/me` |
| Read my public pack quota | `GET /packs/me/quota` |
| List public packs | `GET /packs` (query: `offset`, `limit`, `sort`, `q`) |
| Create pack | `POST /packs` |
| Get / update / delete pack | `GET` / `PATCH` / `DELETE /packs/:id` |
| Copy pack | `POST /packs/:id/copy` |

The browser MUST authenticate Pack writes and “my packs” with the session-issued API JWT as `Authorization: Bearer`. `GET /packs/me/quota` MUST 使用同一 session API JWT。没有可用 JWT 时，网站 MUST NOT 匿名发出 `GET /packs/me/quota`。Public list and anonymous detail reads MUST omit Bearer. A signed-in `GET /packs/:id` MUST attach Bearer only when an unexpired session API JWT is available, so an expired token cannot turn an otherwise public read into a 401.

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

#### Scenario: 公开名额请求携带 session JWT
- **WHEN** 已登录用户需要读取自己的公开名额，且 session 中有可用的 API JWT
- **THEN** 请求到达 winstall-api 的 `GET /packs/me/quota`，并带 `Authorization: Bearer` 与该 JWT

#### Scenario: 没有 JWT 时不匿名请求公开名额
- **WHEN** 客户端需要读取公开名额，且没有可用的 API JWT
- **THEN** 客户端不发出不带 `Authorization` 的 `GET /packs/me/quota`
