# api-client-credentials Specification

## Purpose

Defines how the winstall web app authenticates calls to winstall-api: no AuthKey/Secret on any hop, public reads and analytics track with only the API base URL, and user operations still via session plus BFF-issued JWT.

## Requirements

### Requirement: Web never sends AuthKey or AuthSecret

The web app MUST NOT attach `AuthKey` or `AuthSecret` headers on any request it makes to winstall-api, including BFF forwards, server-side catalog and Pack reads, account-delete cascade, and App analytics track. The web app MUST NOT require `WINSTALL_API_KEY` or `WINSTALL_API_SECRET` to serve pages or proxy those calls. `WINSTALL_API_BASE` remains the required API origin for server-side calls.

#### Scenario: BFF forward has no API key headers
- **WHEN** the browser calls a BFF path that is forwarded to winstall-api
- **THEN** the forwarded request MUST NOT include `AuthKey` or `AuthSecret`

#### Scenario: SSR catalog has no API key headers
- **WHEN** the server renders or revalidates a page that loads apps or public packs from winstall-api
- **THEN** that server-side request MUST NOT include `AuthKey` or `AuthSecret`

#### Scenario: App track does not require API keys
- **WHEN** `WINSTALL_API_BASE` is set and `WINSTALL_API_KEY` / `WINSTALL_API_SECRET` are unset
- **THEN** a Pack or App view/download track MUST still be forwarded to `POST /analytics/track` and MUST NOT fail solely because those keys are missing

### Requirement: User operations still use session and BFF JWT

Signed-in Pack writes, “my packs”, copy, and owner reads of private packs MUST continue to authenticate with the existing session cookie and a BFF-issued user JWT. The browser MUST NOT hold or send an API JWT for those operations in this change. Unauthenticated calls to those protected BFF paths MUST still be rejected without forwarding a successful write.

#### Scenario: Signed-in create still uses BFF JWT
- **WHEN** a signed-in user creates a pack from the UI
- **THEN** the BFF MUST forward `POST /packs` with a user JWT derived from the session, and MUST NOT attach `AuthKey` or `AuthSecret`

#### Scenario: Unauthenticated create still blocked at BFF
- **WHEN** an unauthenticated client attempts to create a pack through the BFF
- **THEN** the BFF MUST NOT forward a successful create to the API
