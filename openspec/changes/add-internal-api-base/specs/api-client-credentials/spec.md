## ADDED Requirements

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

## MODIFIED Requirements

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
