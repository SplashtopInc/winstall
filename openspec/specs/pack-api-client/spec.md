# pack-api-client Specification

## Purpose

Defines how the winstall web app consumes Pack CRUD, lists, stats, and account-delete cascade exclusively from winstall-api (browser-direct or server-side), with no local Pack authority, cutover flag, or web-side pack content moderation.

## Requirements

### Requirement: Pack traffic always uses the API

The system MUST send browser Pack create, read, update, delete, copy, my-list, and public-list requests to winstall-api Pack endpoints at the runtime API origin. The system MUST NOT offer an environment flag or other runtime switch that sends those requests to a local Pack HTTP API as authority, and MUST NOT route them through a same-origin `/api/winstall` forwarder. Path and method mapping MUST be:

| Client intent | API |
|---------------|-----|
| List my packs | `GET /packs/me` |
| List public packs | `GET /packs` (query: `offset`, `limit`, `sort`, `q`) |
| Create pack | `POST /packs` |
| Get / update / delete pack | `GET` / `PATCH` / `DELETE /packs/:id` |
| Copy pack | `POST /packs/:id/copy` |

The browser MUST authenticate Pack writes and “my packs” with the session-issued API JWT as `Authorization: Bearer`. Public list and anonymous detail reads MUST omit Bearer. A signed-in `GET /packs/:id` MUST attach Bearer only when an unexpired session API JWT is available, so an expired token cannot turn an otherwise public read into a 401.

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

### Requirement: Local Pack HTTP and document store are absent

The web app MUST NOT expose local HTTP routes under `/api/packs` for Pack CRUD, public listing, copy, or view/download increment. The web app MUST NOT keep a local Pack or PackLike document model as a runtime dependency for those operations. Account deletion MUST remove the user’s packs on the API and MUST NOT require a second delete against a local Pack collection to be correct.

#### Scenario: Local pack routes are gone
- **WHEN** a client requests any path under `/api/packs`
- **THEN** the system MUST NOT return a successful Pack CRUD, list, copy, or stats increment from a local Web handler

#### Scenario: Account deletion clears API packs only
- **WHEN** a signed-in user deletes their account
- **THEN** packs previously owned by that user on the API MUST no longer be returned by `GET /packs/:id` for those ids, without relying on a local Pack collection cleanup to achieve that

### Requirement: Pack view and download counts use analytics track

Pack view and download increments MUST be recorded via winstall-api analytics (`POST /analytics/track` with `targetType` pack) at the runtime API origin. Track requests MUST include a `sessionId` and event type `view` or `download`. Track failures MUST NOT block core Pack UX. Lifetime counts for display MUST be read from `GET /packs/:id/stats` on the API origin, not from an embedded `stats` object on the Pack document. App view and download tracks MUST use the same API `POST /analytics/track` surface (`targetType` app) and MUST NOT go through `/api/apps/:id/stats`.

#### Scenario: Viewing a pack tracks view
- **WHEN** a user views a public or unlisted pack detail
- **THEN** the system records a pack `view` track via the API origin `POST /analytics/track` with `sessionId`, and MUST NOT POST `/api/winstall/analytics/track` or a local `/api/packs/:id/stats` increment

#### Scenario: Viewing an app tracks view
- **WHEN** a user views an app detail
- **THEN** the system records an app `view` track via the API origin `POST /analytics/track` with `sessionId`, and MUST NOT POST `/api/apps/:id/stats`

### Requirement: Server-rendered Pack reads use the API

The packs sitemap and any other remaining SSR or build-time Pack reads MUST obtain Pack data from winstall-api. They MUST NOT query a local Pack collection as authority. Those server-side requests MUST NOT attach `AuthKey` or `AuthSecret`; public Pack list and detail reads MUST succeed without those headers. The homepage MUST NOT fetch or render recommended or official Featured Packs.

#### Scenario: Homepage recommended packs from API
- **WHEN** the homepage is generated or revalidated
- **THEN** the page MUST NOT load or display a Featured Packs section sourced from an official-creator pack list, and MUST NOT fetch recommended packs for that section

#### Scenario: Pack sitemap from API
- **WHEN** the packs sitemap is generated
- **THEN** listed pack ids MUST come from API-backed public pack data

#### Scenario: SSR Pack read without AuthKey
- **WHEN** the server fetches public packs from winstall-api during render or revalidation
- **THEN** the request MUST NOT include `AuthKey` or `AuthSecret`

### Requirement: Pack payloads stay UI-compatible without web-side moderation

Pack payloads returned to the UI MUST remain usable by existing Pack pages: document `_id`, `name`, `description`, `visibility`, `status`, `defaultInstallOptions`, and `apps` elements with `_id` / `name` / `latestVersion` (or equivalent formatted fields). The web app MUST NOT apply a separate local content-moderation gate before create or update; rejected or accepted pack text is determined by the API response.

#### Scenario: Detail page loads without embedded stats
- **WHEN** the pack detail page loads a public pack
- **THEN** the page MUST render pack metadata and apps from the Pack payload without depending on `pack.stats` on that document

#### Scenario: Create uses API validation only
- **WHEN** a signed-in user submits a new pack whose name or description the API rejects
- **THEN** the UI MUST surface the API error and MUST NOT have already accepted the pack via a local moderation pass

### Requirement: Pack detail displays stats from the API

When a Pack detail page loads, the web app MUST request `GET /packs/:id/stats` on the API origin and MUST render lifetime view and download counts from that response. The request MUST omit `AuthKey` and `AuthSecret`. The page MUST NOT use `pack.stats` on the Pack document as the source of those counts. The stats request MUST omit `Authorization`. The page MUST NOT read `liked` from the stats payload.

#### Scenario: Pack detail reads stats
- **WHEN** a user opens a Pack detail page
- **THEN** the client MUST call `GET /packs/:id/stats` on the API origin and MUST NOT read view or download counts from `pack.stats`

#### Scenario: Pack stats read is anonymous
- **WHEN** the client requests `GET /packs/:id/stats`
- **THEN** the request MUST omit `Authorization`, `AuthKey`, and `AuthSecret`

### Requirement: Pack like uses the API

Pack like and unlike MUST be sent to winstall-api with the session API JWT. The signed-in like status and visible like count on Pack detail MUST be read from `GET /packs/:id/like` with that JWT. The web app MUST NOT restore a local PackLike document model or a local `/api/packs` like route.

#### Scenario: Pack like does not use a local store
- **WHEN** a signed-in user likes or unlikes a pack
- **THEN** the request MUST reach winstall-api and MUST NOT write a local PackLike row or hit a local `/api/packs` like handler

#### Scenario: Pack like status uses GET like
- **WHEN** a signed-in user opens a Pack detail page
- **THEN** the client MUST call `GET /packs/:id/like` on the API origin with the session JWT and MUST NOT take the pressed state or the visible like count from `GET /packs/:id/stats`

### Requirement: Pack 详情直接消费补齐后的 apps

Pack 详情页 MUST 用 `GET /packs/:id` 响应中的 `apps[]` 渲染 app 卡片（含快照字段以及 `desc`、`versions`、`updatedAt`、`available`）。该页 MUST NOT 再为列表中的每个 app 请求 `GET /apps/:id`，MUST NOT 请求 `GET /apps/:id/stats` 或其它目录接口来补卡片。`available` 为 `false` 的元素 MUST 仍留在列表原位，并以不可用状态展示。卡片上的展示版本 MUST 使用该元素的 `latestVersion`（即 Pack 快照钉住的版本）。本要求 MUST NOT 改变 `GET /packs`、`GET /packs/me`、`GET /packs/trending` 的列表消费方式，也 MUST NOT 改变 `/generate` 为选中 app 拉取目录详情的方式。

#### Scenario: 打开详情不再按 app 拉目录
- **WHEN** 用户打开某个 Pack 详情页且 `GET /packs/:id` 成功
- **THEN** 页面用该响应的 `apps[]` 画出卡片，且 MUST NOT 对这些 app 再请求 `GET /apps/:id`

#### Scenario: 下架 app 按 available 展示
- **WHEN** 详情 `apps[]` 中某元素 `available` 为 `false`
- **THEN** 该卡 MUST 仍出现在原位，并以不可用状态展示，且 MUST NOT 因此使整页当作 Pack 不存在

#### Scenario: 详情 app 卡不展示 like
- **WHEN** 用户查看 Pack 详情上的 app 卡片
- **THEN** 该卡 MUST NOT 展示该 app 的 like 数，且客户端 MUST NOT 为该数请求目录或 stats

#### Scenario: generate 上的同款卡也不展示 like
- **WHEN** 用户在 `/generate` 查看选中 app 的卡片
- **THEN** 该卡 MUST NOT 展示 like 数

### Requirement: Pack 详情写入成功后重拉详情

在 Pack 详情页，当加 app、删 app、更改某 app 的钉住版本或 `installOptions`、或更改 pack 名称/描述/可见性的写入成功后，客户端 MUST 再请求一次 `GET /packs/:id`，并用该响应替换页面上的 pack 与 `apps[]`。该次详情 GET 成功时，客户端 MUST NOT 把同一次写入回包中的 `apps[]` 当作卡片权威。若写入已成功但这次 `GET /packs/:id` 失败，客户端 MUST 将写回包的 `apps[]` merge 进当前页面上的 app 列表（保留已有元素上的 `desc`、`versions` 与可用状态；仅新出现的 id 使用写回包快照），MUST NOT 用写回包 `apps[]` 整表替换，并 MUST 提示刷新失败。写入失败时 MUST NOT 用这次失败请求去重拉详情。仅更改默认安装选项且写入成功时，客户端 MUST NOT 再请求 `GET /packs/:id`，MUST NOT 用该次写回包替换 `apps[]`。复制整个 pack、删除整个 pack MUST NOT 适用本刷新（删除成功后离开详情页）。

#### Scenario: 加 app 成功后重拉详情
- **WHEN** 用户在详情页把 app 加入 pack 且 `PATCH /packs/:id` 成功
- **THEN** 客户端 MUST 再请求 `GET /packs/:id` 并按新 `apps[]` 渲染卡片，且 MUST NOT 把 PATCH 回包的 `apps[]` 直接当作卡片数据

#### Scenario: 改版本成功后重拉详情
- **WHEN** 拥有者更改某 app 的钉住版本且写入成功
- **THEN** 客户端 MUST 再请求 `GET /packs/:id` 刷新卡片

#### Scenario: 写入失败不重拉
- **WHEN** 详情页上的 pack 写入失败
- **THEN** 客户端 MUST NOT 仅因这次失败而请求 `GET /packs/:id`

#### Scenario: 仅改默认安装选项不重拉详情
- **WHEN** 拥有者更改默认安装选项且写入成功
- **THEN** 客户端 MUST NOT 因此再请求 `GET /packs/:id`，且 MUST NOT 用写回包替换页面上的 `apps[]`

#### Scenario: 详情 GET 失败时 merge 写回包
- **WHEN** 加 app 的 `PATCH /packs/:id` 已成功，但随后的 `GET /packs/:id` 失败
- **THEN** 客户端 MUST 把 PATCH 回包的 `apps[]` merge 进当前列表（已有卡保留补齐字段），MUST NOT 整表换成薄快照，且 MUST 提示刷新失败
