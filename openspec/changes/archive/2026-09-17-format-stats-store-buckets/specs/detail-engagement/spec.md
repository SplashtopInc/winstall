## MODIFIED Requirements

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

App detail and Pack detail MUST offer a Like control that shows the current like count and whether the signed-in user has liked the resource. An anonymous user MUST be able to see the like count. The visible like count MUST follow `engagement-count-format` compact units. Activating Like while signed out MUST open the existing login flow and MUST NOT call the like API. After a successful login that was started from Like, the system MUST complete the like. A signed-in user activating Like MUST send the like or unlike to winstall-api with the session API JWT. Like MUST NOT require a local like store.

#### Scenario: Signed-in user likes an app
- **WHEN** a signed-in user activates Like on an App detail page
- **THEN** the system MUST send an authenticated like request for that app to winstall-api and MUST update the control to the liked state and the new count from the API response or a follow-up read

#### Scenario: Signed-in user likes a pack
- **WHEN** a signed-in user activates Like on a Pack detail page
- **THEN** the system MUST send an authenticated like request for that pack to winstall-api and MUST update the control to the liked state and the new count from the API response or a follow-up read

#### Scenario: Signed-out user is asked to log in
- **WHEN** a signed-out user activates Like on an App or Pack detail page
- **THEN** the system MUST open the existing login panel, MUST NOT send a like request yet, and MUST complete the like after that login succeeds and the user returns to the same detail page

#### Scenario: Unlike
- **WHEN** a signed-in user who has already liked the resource activates Like again
- **THEN** the system MUST send an authenticated unlike request to winstall-api and MUST update the control to the unliked state and the new count
