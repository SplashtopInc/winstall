# detail-engagement Specification

## Purpose

Shows lifetime view and download counts on App and Pack detail pages, and lets a signed-in user like or unlike either resource. Counts are readable without login; liking requires authentication.

## Requirements

### Requirement: Detail pages show lifetime view and download counts

当统计展示开关打开时，App 详情与 Pack 详情 MUST 展示该资源在 winstall-api stats 上的终身浏览与下载（安装）次数。这些页面 MUST NOT 从 App 或 Pack 文档内嵌的 `stats` 对象读取计数。本能力 MUST NOT 用 stats 接口去填列表、目录或周榜卡片。`SingleApp` 上来自列表字段的终身计数由 `app-card-engagement` 规定。`PackCard` 上来自列表字段的终身计数由 `pack-card-engagement` 规定。Trending Apps 与 Featured Packs 使用周榜 payload 上的 `viewCount`、`downloadCount`、`likeCount`，由 `home-trending` 规定。stats 读取失败 MUST NOT 挡住详情页其余内容；读取失败时 MAY 不展示计数。开关打开且读取成功时，页面 MUST 展示这些计数。开关关闭时，页面 MUST NOT 展示浏览或下载次数，且 MUST NOT 请求 `GET /apps/:id/stats` 或 `GET /packs/:id/stats`。展示出的每个数字 MUST 遵循 `engagement-count-format` 的紧凑单位（小于 1000 为精确整数，大于或等于 1000 为一位小数的 `K` / `M` / `B`，不加 `+`）。

#### Scenario: App detail shows stats

- **WHEN** 统计展示开关打开，且用户打开 App 详情且 stats 读取成功
- **THEN** 页面 MUST 展示该 App 的终身浏览与下载次数

#### Scenario: Pack detail shows stats

- **WHEN** 统计展示开关打开，且用户打开 Pack 详情且 stats 读取成功
- **THEN** 页面 MUST 展示该 Pack 的终身浏览与下载次数

#### Scenario: Stats failure does not hide the page

- **WHEN** 详情页的 stats 读取失败
- **THEN** 页面 MUST 仍渲染身份、安装操作与其它既有内容，且 MUST NOT 依赖计数才能使用

#### Scenario: Lists omit engagement counts

- **WHEN** 用户查看首页、Apps 列表或 Packs 列表
- **THEN** 这些表面 MUST NOT 把 `GET /apps/:id/stats` 或 `GET /packs/:id/stats` 的计数当作本能力的展示来源

#### Scenario: 开关关闭时详情不请求 stats

- **WHEN** 统计展示开关关闭，且用户打开 App 或 Pack 详情
- **THEN** 页面 MUST NOT 展示浏览或下载次数，且 MUST NOT 请求 `GET /apps/:id/stats` 或 `GET /packs/:id/stats`

### Requirement: Like on App and Pack detail requires sign-in

App detail and Pack detail MUST offer a Like control that shows whether the signed-in user has liked the resource. The control MUST NOT display a like count, including when the user is signed out. The liked pressed state MUST come from `GET …/like` when the user is signed in, or from a successful like or unlike write; it MUST NOT be inferred from a stats payload. Activating Like while signed out MUST open the existing login flow and MUST NOT call the like API. After a successful login that was started from Like, the system MUST complete the like. A signed-in user activating Like MUST send the like or unlike to winstall-api with the session API JWT. Like MUST NOT require a local like store.

#### Scenario: Signed-in user likes an app
- **WHEN** a signed-in user activates Like on an App detail page
- **THEN** the system MUST send an authenticated like request for that app to winstall-api and MUST update the control to the liked state from the like API response

#### Scenario: Signed-in user likes a pack
- **WHEN** a signed-in user activates Like on a Pack detail page
- **THEN** the system MUST send an authenticated like request for that pack to winstall-api and MUST update the control to the liked state from the like API response

#### Scenario: Signed-out user is asked to log in
- **WHEN** a signed-out user activates Like on an App or Pack detail page
- **THEN** the system MUST open the existing login panel, MUST NOT send a like request yet, and MUST complete the like after that login succeeds and the user returns to the same detail page

#### Scenario: Unlike
- **WHEN** a signed-in user who has already liked the resource activates Like again
- **THEN** the system MUST send an authenticated unlike request to winstall-api and MUST update the control to the unliked state

### Requirement: Detail like status is read from GET like

When a signed-in user opens App or Pack detail, the web app MUST request `GET /apps/:id/like` or `GET /packs/:id/like` on the API origin with the session API JWT and MUST set the Like control pressed state from `liked`. An anonymous user MUST NOT send that request. A 401 or other GET like failure MUST leave the control unliked and MUST NOT hide view or download counts already obtained from stats. Refreshing stats MUST NOT clear a known liked state. App detail and Pack detail MUST NOT render `likeCount` from stats or from the like API.

#### Scenario: Signed-in detail loads like status
- **WHEN** a signed-in user opens an App or Pack detail page
- **THEN** the client MUST call `GET /apps/:id/like` or `GET /packs/:id/like` with the session JWT and MUST use `liked` for the pressed state, and MUST NOT display `likeCount`

#### Scenario: Anonymous detail skips GET like
- **WHEN** a signed-out user opens an App or Pack detail page
- **THEN** the client MUST NOT call `GET /apps/:id/like` or `GET /packs/:id/like`, and the Like control MUST appear unliked and MUST NOT display a like count

#### Scenario: GET like failure keeps counts
- **WHEN** `GET …/like` returns 401 or otherwise fails
- **THEN** the Like control MUST appear unliked and the page MUST still show stats counts when the stats read succeeded

### Requirement: App download counts include pack and generate exports

An App's lifetime download count MUST include downloads of that app by itself (copying the detail-page install command or downloading the detail-page instant installer), plus one download each time a Pack that contains it is exported, plus one download each time it is exported from the generate page. A Pack export MUST still increment the Pack download count once. Opening an install drawer without copying or downloading MUST NOT increment counts.

#### Scenario: Pack export increments the pack and each listed app
- **WHEN** a user copies or downloads an export for a Pack that contains apps
- **THEN** the system MUST send one pack `download` track for that Pack and one app `download` track for each distinct app in that Pack

#### Scenario: Generate export increments each listed app
- **WHEN** a user copies or downloads an export on the generate page
- **THEN** the system MUST send one app `download` track for each distinct app in the current generate list and MUST NOT send a pack `download` track

#### Scenario: App detail installer download increments the app
- **WHEN** a user successfully downloads the instant installer from an App detail page
- **THEN** the system MUST send one app `download` track for that app and MUST NOT send a pack `download` track

### Requirement: Trending is absent

This capability MUST NOT add a Trending badge, rail, or sort on App or Pack detail pages. Homepage weekly trending boards are specified by `home-trending` and are outside this capability.

#### Scenario: Detail has no trending mark
- **WHEN** a user opens an App or Pack detail page
- **THEN** the page MUST NOT present a Trending label or equivalent heat mark
