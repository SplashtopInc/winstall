# detail-engagement Specification

## Purpose

Shows lifetime view and download counts on App and Pack detail pages, and lets a signed-in user like or unlike either resource. Counts are readable without login; liking requires authentication.

## Requirements

### Requirement: Detail pages show lifetime view and download counts

App detail and Pack detail MUST show lifetime view and download (install) counts obtained from the winstall-api stats surface for that resource. Those pages MUST NOT read counts from an embedded `stats` object on the App or Pack document, and MUST NOT show those counts on list or card surfaces. A stats read failure MUST NOT block the rest of the detail page; counts MAY be omitted when the read fails. When the stats read succeeds, the pages MUST display those counts and MUST NOT hide them behind `WINSTALL_SHOW_VIEWS_INSTALLS` or any equivalent client flag. When those counts are shown, each visible number MUST follow `engagement-count-format` compact units (exact integers below 1000; one-decimal `K` / `M` / `B` at or above 1000, without `+`).

#### Scenario: App detail shows stats
- **WHEN** a user opens an App detail page and the API stats read succeeds
- **THEN** the page MUST display lifetime view and download counts for that app

#### Scenario: Pack detail shows stats
- **WHEN** a user opens a Pack detail page and the API stats read succeeds
- **THEN** the page MUST display lifetime view and download counts for that pack

#### Scenario: Stats failure does not hide the page
- **WHEN** the stats read for a detail page fails
- **THEN** the page MUST still render identity, install actions, and other existing content, and MUST NOT depend on counts to become usable

#### Scenario: Lists omit engagement counts
- **WHEN** a user views the homepage, Apps list, or Packs list
- **THEN** those surfaces MUST NOT show view, download, or like counts as part of this capability

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
