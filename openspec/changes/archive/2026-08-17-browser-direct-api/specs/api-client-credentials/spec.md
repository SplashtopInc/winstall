## MODIFIED Requirements

### Requirement: Web never sends AuthKey or AuthSecret

The web app MUST NOT attach `AuthKey` or `AuthSecret` headers on any request it makes to winstall-api, including browser-direct catalog, Pack, and analytics calls, server-side catalog and Pack reads, and account-delete cascade. The web app MUST NOT require `WINSTALL_API_KEY` or `WINSTALL_API_SECRET` to serve pages or make those calls. `WINSTALL_API_BASE` remains the required API origin.

#### Scenario: BFF forward has no API key headers
- **WHEN** a request that previously went through the BFF reaches winstall-api from the browser
- **THEN** that request MUST NOT include `AuthKey` or `AuthSecret`

#### Scenario: Browser catalog has no API key headers
- **WHEN** the browser loads apps or public packs from winstall-api
- **THEN** that request MUST NOT include `AuthKey` or `AuthSecret`

#### Scenario: SSR catalog has no API key headers
- **WHEN** the server renders or revalidates a page that loads apps or public packs from winstall-api
- **THEN** that server-side request MUST NOT include `AuthKey` or `AuthSecret`

#### Scenario: App track does not require API keys
- **WHEN** `WINSTALL_API_BASE` is set and `WINSTALL_API_KEY` / `WINSTALL_API_SECRET` are unset
- **THEN** a Pack or App view/download track MUST still reach `POST /analytics/track` on the API origin and MUST NOT fail solely because those keys are missing

## REMOVED Requirements

### Requirement: User operations still use session and BFF JWT

**Reason**: The same-origin BFF is removed. The browser now holds a short API JWT delivered on the existing session and calls winstall-api directly.

**Migration**: Signed-in Pack writes, “my packs”, copy, and owner reads of private packs send `Authorization: Bearer` with the session-issued API JWT. Unauthenticated writes are rejected by the API (no BFF gate).

## ADDED Requirements

### Requirement: Browser reads API origin from runtime meta

The browser MUST obtain the winstall-api origin from a document meta tag whose content is the runtime `WINSTALL_API_BASE` value, using the same injection pattern as the icon base. The browser MUST NOT depend on a build-time public env var as the source of that origin. When the meta content is empty, the browser MUST NOT call a guessed API host.

#### Scenario: Client catalog uses meta origin
- **WHEN** the browser requests apps or public packs and the API-origin meta is populated
- **THEN** the request URL MUST use that origin and MUST NOT use a same-origin `/api/winstall` prefix

#### Scenario: Empty meta skips the call
- **WHEN** the browser would call winstall-api and the API-origin meta is empty
- **THEN** the client MUST NOT invent a fallback API host

#### Scenario: Runtime revalidation fills the origin meta
- **WHEN** a page that needs the API origin is revalidated on a running server that has `WINSTALL_API_BASE` set
- **THEN** a subsequent full document request for that page MUST include that origin in the API-origin meta

### Requirement: Pages that need the API origin regenerate at runtime

A page whose first full document load can trigger browser calls to winstall-api (own data fetch or the global app search) MUST be Incremental Static Regeneration or per-request server render, so `_document` can write the runtime API origin into the meta tag. Those pages MUST NOT remain build-only automatic static HTML. Pack detail (`/packs/:id`) MUST stay on-demand server render. Client Pack and catalog fetches MUST remain in the browser; ISR MUST NOT become the authority for that data.

#### Scenario: Pack list is eligible for ISR
- **WHEN** `/packs` is built without `WINSTALL_API_BASE`
- **THEN** the page MUST still be revalidatable at runtime (not frozen as automatic static HTML)

#### Scenario: Pack detail stays per-request
- **WHEN** a client requests `/packs/:id`
- **THEN** the document MUST be rendered on the server for that request and MUST NOT require a prebuilt path list

### Requirement: User operations use a session-issued API JWT

Signed-in Pack writes, “my packs”, copy, and owner reads of private packs MUST authenticate with a short-lived API JWT delivered on the existing NextAuth session JSON (not a new mint HTTP route). The JWT payload MUST be `{ userId }` equal to the session public id, signed with the same secret and comparable lifetime as the former BFF hop token. Accessing the session MUST refresh that JWT when it is missing or expired. The browser MUST send it only as `Authorization: Bearer`. The browser MUST NOT send the NextAuth session-cookie JWT, OAuth access or refresh tokens, or `X-User-Id` as API credentials. Unauthenticated calls MUST omit Bearer and MUST NOT succeed as a user write.

#### Scenario: Signed-in create uses session API JWT
- **WHEN** a signed-in user creates a pack from the UI
- **THEN** the browser MUST `POST` the API `/packs` with `Authorization: Bearer` set to the session API JWT, and MUST NOT attach `AuthKey`, `AuthSecret`, or `X-User-Id`

#### Scenario: Session refresh renews an expired API JWT
- **WHEN** a signed-in user’s API JWT is missing or expired and the client reads the session
- **THEN** the session JSON MUST include a newly issued, unexpired API JWT for that user

#### Scenario: Unauthenticated create has no Bearer
- **WHEN** an unauthenticated client attempts to create a pack
- **THEN** the request MUST omit `Authorization`, and the create MUST NOT succeed

#### Scenario: NextAuth cookie is not the API credential
- **WHEN** the browser calls a user Pack endpoint
- **THEN** the request MUST NOT present the NextAuth session-cookie JWT or OAuth tokens as the API Bearer

### Requirement: Same-origin API proxy is absent

The web app MUST NOT expose `/api/winstall` as a catch-all forwarder to winstall-api, and MUST NOT expose `/api/apps/:id/stats` as an analytics proxy. Browser catalog, Pack, and analytics traffic MUST use the API origin. Server-rendered catalog and Pack reads, sitemaps, and account-delete cascade MUST continue to call winstall-api from the server.

#### Scenario: Former BFF path is gone
- **WHEN** a client requests a path under `/api/winstall`
- **THEN** the system MUST NOT forward that request to winstall-api as a successful proxy

#### Scenario: Former app-stats proxy is gone
- **WHEN** a client POSTs `/api/apps/:id/stats`
- **THEN** the system MUST NOT forward an analytics track to winstall-api from that route
