# api-client-credentials Specification

## Purpose

Defines how the winstall web app authenticates calls to winstall-api: no AuthKey/Secret on any hop, public reads and analytics track with only the API origin, and user operations via a short API JWT delivered on the NextAuth session.

## Requirements

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

### Requirement: Browser reads API origin from runtime meta

The browser MUST obtain the winstall-api origin from a document meta tag whose content is the runtime `WINSTALL_API_BASE` value, using the same injection pattern as the icon base. The browser MUST NOT depend on a build-time public env var as the source of that origin. When the meta content is empty, the browser MUST NOT call a guessed API host. The document MUST NOT write `WINSTALL_API_INTERNAL_BASE` into that meta tag.

#### Scenario: Client catalog uses meta origin
- **WHEN** the browser requests apps or public packs and the API-origin meta is populated
- **THEN** the request URL MUST use that origin and MUST NOT use a same-origin `/api/winstall` prefix

#### Scenario: Empty meta skips the call
- **WHEN** the browser would call winstall-api and the API-origin meta is empty
- **THEN** the client MUST NOT invent a fallback API host

#### Scenario: Runtime revalidation fills the origin meta
- **WHEN** a page that needs the API origin is revalidated on a running server that has `WINSTALL_API_BASE` set
- **THEN** a subsequent full document request for that page MUST include that origin in the API-origin meta

#### Scenario: Internal origin is omitted from the document
- **WHEN** a page is rendered or revalidated with both `WINSTALL_API_BASE` and a different `WINSTALL_API_INTERNAL_BASE` set
- **THEN** the API-origin meta MUST contain `WINSTALL_API_BASE` and MUST NOT contain `WINSTALL_API_INTERNAL_BASE`

### Requirement: 服务端可用可选内部 API origin

系统 MUST 允许运行时配置可选的服务端 API origin（`WINSTALL_API_INTERNAL_BASE`）。当该值存在且非空时，Node 上对 winstall-api 的 HTTP 请求（含 ISR/SSR 目录与 trending、sitemap、删号级联等服务端读取）MUST 使用该 origin。当该值未设置或为空时，服务端 MUST 回退使用 `WINSTALL_API_BASE`。回退 MUST 仅依据配置是否为空，MUST NOT 在一次请求失败后再改打另一个 origin。浏览器 MUST NOT 读取该内部 origin。`WINSTALL_API_BASE` 仍为对外必需 origin。

#### Scenario: 服务端使用内部 origin
- **WHEN** 运行中的服务器已设置非空的 `WINSTALL_API_INTERNAL_BASE` 与 `WINSTALL_API_BASE`，且正在服务端请求 `GET /packs/trending`
- **THEN** 该请求 URL 的 origin MUST 为 `WINSTALL_API_INTERNAL_BASE`，MUST NOT 为 `WINSTALL_API_BASE`

#### Scenario: 未配置内部 origin 时回退
- **WHEN** `WINSTALL_API_INTERNAL_BASE` 未设置或为空，且 `WINSTALL_API_BASE` 已设置，且正在服务端请求 `GET /apps/trending`
- **THEN** 该请求 URL 的 origin MUST 为 `WINSTALL_API_BASE`

#### Scenario: 浏览器忽略内部 origin
- **WHEN** `WINSTALL_API_INTERNAL_BASE` 为内网 origin，且浏览器请求 apps 或 public packs
- **THEN** 该请求 URL 的 origin MUST 为文档中的 API-origin meta（`WINSTALL_API_BASE`），MUST NOT 为 `WINSTALL_API_INTERNAL_BASE`

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
