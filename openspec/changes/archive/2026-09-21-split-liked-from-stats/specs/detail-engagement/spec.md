## MODIFIED Requirements

### Requirement: Like on App and Pack detail requires sign-in

App detail and Pack detail MUST offer a Like control that shows the current like count and whether the signed-in user has liked the resource. An anonymous user MUST be able to see the like count. The visible like count MUST follow `engagement-count-format` compact units. When the user is signed in, the visible like count MUST come from `GET /apps/:id/like` or `GET /packs/:id/like`, or from a successful `POST` or `DELETE` like response; it MUST NOT be taken from stats after that like read succeeds. When the user is signed out, the visible like count MUST come from `GET /apps/:id/stats` or `GET /packs/:id/stats`. The liked pressed state MUST come from `GET …/like` when the user is signed in, or from a successful like or unlike write; it MUST NOT be inferred from a stats payload. Activating Like while signed out MUST open the existing login flow and MUST NOT call the like API. After a successful login that was started from Like, the system MUST complete the like. A signed-in user activating Like MUST send the like or unlike to winstall-api with the session API JWT. Like MUST NOT require a local like store.

#### Scenario: Signed-in user likes an app
- **WHEN** a signed-in user activates Like on an App detail page
- **THEN** the system MUST send an authenticated like request for that app to winstall-api and MUST update the control to the liked state and the new count from the like API response

#### Scenario: Signed-in user likes a pack
- **WHEN** a signed-in user activates Like on a Pack detail page
- **THEN** the system MUST send an authenticated like request for that pack to winstall-api and MUST update the control to the liked state and the new count from the like API response

#### Scenario: Signed-out user is asked to log in
- **WHEN** a signed-out user activates Like on an App or Pack detail page
- **THEN** the system MUST open the existing login panel, MUST NOT send a like request yet, and MUST complete the like after that login succeeds and the user returns to the same detail page

#### Scenario: Unlike
- **WHEN** a signed-in user who has already liked the resource activates Like again
- **THEN** the system MUST send an authenticated unlike request to winstall-api and MUST update the control to the unliked state and the new count

## ADDED Requirements

### Requirement: Detail like status is read from GET like

When a signed-in user opens App or Pack detail, the web app MUST request `GET /apps/:id/like` or `GET /packs/:id/like` on the API origin with the session API JWT and MUST set the Like control pressed state from `liked` and the visible like count from `likeCount`. An anonymous user MUST NOT send that request. A 401 or other GET like failure MUST leave the control unliked and MUST NOT hide view or download counts already obtained from stats; the visible like count MAY then remain the stats value. Refreshing stats MUST NOT clear a known liked state or replace a likeCount already obtained from the like API.

#### Scenario: Signed-in detail loads like status
- **WHEN** a signed-in user opens an App or Pack detail page
- **THEN** the client MUST call `GET /apps/:id/like` or `GET /packs/:id/like` with the session JWT and MUST use `liked` for the pressed state and `likeCount` for the visible like count

#### Scenario: Anonymous detail skips GET like
- **WHEN** a signed-out user opens an App or Pack detail page
- **THEN** the client MUST NOT call `GET /apps/:id/like` or `GET /packs/:id/like`, and the Like control MUST appear unliked while still showing likeCount from stats when that read succeeds

#### Scenario: GET like failure keeps counts
- **WHEN** `GET …/like` returns 401 or otherwise fails
- **THEN** the Like control MUST appear unliked and the page MUST still show stats counts when the stats read succeeded
