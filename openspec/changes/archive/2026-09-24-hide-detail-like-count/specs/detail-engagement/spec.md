## MODIFIED Requirements

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
