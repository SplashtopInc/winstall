# Spec Delta: install-export

## MODIFIED Requirements

### Requirement: Instant installer content-addressable cache and client dispatch

The instant installer request MUST identify installer builds by a deterministic content hash of the embedded configuration and binary version. If a matching executable already exists in storage, the system MUST return a direct download location without invoking the builder. If not cached, it MUST queue build generation. The client MUST inspect successful responses by `Content-Type` to trigger immediate download, initiate polling, or save binary directly. Any external callback URL passed to builders and any absolute status URL returned for polling MUST be constructed strictly from the server-configured canonical public origin (`WINSTALL_PUBLIC_URL` falling back to `NEXTAUTH_URL`) and MUST NOT be derived from client-controlled request headers. When configured to dispatch builds via Jenkins webhook, the server MUST encode the parameters using UTF-8 percent-encoded `application/x-www-form-urlencoded` rather than unannotated multipart payloads, ensuring multi-byte characters such as Chinese or Japanese package display names are decoded accurately without Latin-1 corruption.

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

#### Scenario: Builder callback and status URLs ignore untrusted request headers
- **GIVEN** a client submits a request to `/api/installer` or `/api/installer/status` with forged `Host` or `X-Forwarded-Proto` headers (such as private cloud metadata addresses or non-HTTP schemes)
- **WHEN** the server constructs the builder callback URL or the task status URL
- **THEN** the URL origin MUST strictly match the server-configured `WINSTALL_PUBLIC_URL` (or `NEXTAUTH_URL` fallback)
- **AND** the server MUST NOT use the client-supplied `Host` or `X-Forwarded-Proto` values in the callback or status URLs

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

#### Scenario: Jenkins webhook uses UTF-8 application/x-www-form-urlencoded
- **GIVEN** the server is configured with `WINSTALL_BUILDER_WEBHOOK`
- **WHEN** the server dispatches a build task for an application list containing non-ASCII names (such as "网易云音乐")
- **THEN** the outgoing HTTP request body MUST be serialized as `application/x-www-form-urlencoded`
- **AND** the `installer_config` parameter value MUST be percent-encoded UTF-8
- **AND** the payload MUST NOT be dispatched as multipart/form-data without charset
