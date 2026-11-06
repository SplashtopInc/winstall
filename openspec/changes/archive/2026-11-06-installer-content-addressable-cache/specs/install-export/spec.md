# install-export Specification Delta

## ADDED Requirements

### Requirement: Instant installer content-addressable cache and client dispatch

The instant installer request MUST identify installer builds by a deterministic content hash of the embedded configuration and binary version. If a matching executable already exists in storage, the system MUST return a direct download location without invoking the builder. If not cached, it MUST queue build generation. The client MUST inspect successful responses by `Content-Type` to trigger immediate download, initiate polling, or save binary directly.

#### Scenario: Cached installer returns immediate download URL
- **GIVEN** an installer matching the requested configuration hash already exists in storage
- **WHEN** a client submits a POST request to `/api/installer`
- **THEN** the response MUST be HTTP 200 with `Content-Type: application/json` containing `downloadUrl`
- **AND** the client MUST trigger file download immediately without initiating polling

#### Scenario: Uncached installer initiates generation
- **GIVEN** no installer matching the requested configuration hash exists in storage
- **WHEN** a client submits a POST request to `/api/installer`
- **THEN** the response MUST be HTTP 202 with `Content-Type: application/json` containing `statusUrl`
- **AND** the client MUST initiate polling on `statusUrl`

#### Scenario: Synchronous stream builder fallback
- **GIVEN** the builder operates in synchronous stream mode (such as early prototype or validation environments)
- **WHEN** the server returns HTTP 200 with `Content-Type: application/octet-stream`
- **THEN** the client MUST read the body as a binary blob and trigger file download directly

#### Scenario: Builder mode evolution and verification support
- **GIVEN** the installer generation system
- **WHEN** configuring builder integrations
- **THEN** it MUST retain support for both direct builder base (synchronous stream and S3 async mode) and production Jenkins webhook mode to facilitate staging and validation environments

#### Scenario: Builder redirect architecture note
- **GIVEN** an upstream builder reverse proxy or load balancer that redirects requests
- **WHEN** forwarding POST build requests
- **THEN** it MUST use HTTP 307 or 308 to preserve the HTTP method and request body, and MUST NOT use 301 or 302
