# user-pack-profile Specification

## Purpose

Records that the web app no longer offers a public per-user Pack directory, and that the Twitter lookup and sitemap entries which existed only for that page are gone.

## Requirements

### Requirement: User pack directory page is not offered

The system MUST NOT serve a page at `/users/:id` that lists packs created by that user. Requests to those URLs MUST NOT be redirected to another pack listing. Account deletion at `/api/users/me` and signed-in “my packs” remain available elsewhere.

#### Scenario: Former profile URL
- **WHEN** a client requests `/users/:id` for any id
- **THEN** the response MUST NOT be a pack directory page for that user (the URL is gone; no redirect)

### Requirement: Pack sitemap omits user profile URLs

The packs sitemap MUST list public pack detail URLs and MUST NOT include `/users/:id` entries derived from pack owners.

#### Scenario: Sitemap has packs only
- **WHEN** the packs sitemap is generated
- **THEN** it MUST contain `/packs/:id` loc entries for public packs and MUST NOT contain `/users/:id` loc entries

### Requirement: Twitter user-lookup proxy is not provided

The system MUST NOT expose an HTTP endpoint that forwards caller-supplied Twitter API URLs using a server Twitter bearer token. NextAuth Twitter sign-in, when configured, MUST continue to use its own client credentials and MUST NOT depend on that proxy.

#### Scenario: Former twitter proxy
- **WHEN** a client requests the former Twitter proxy path used by the user pack directory
- **THEN** the system MUST NOT forward a Twitter API call on the client’s behalf
