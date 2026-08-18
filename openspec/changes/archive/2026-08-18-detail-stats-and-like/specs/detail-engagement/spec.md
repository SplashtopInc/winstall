## Purpose

Shows lifetime view and download counts on App and Pack detail pages, and lets a signed-in user like or unlike either resource. Counts are readable without login; liking requires authentication.

## ADDED Requirements

### Requirement: Detail pages show lifetime view and download counts

App detail and Pack detail MUST show lifetime view and download (install) counts obtained from the winstall-api stats surface for that resource. Those pages MUST NOT read counts from an embedded `stats` object on the App or Pack document, and MUST NOT show those counts on list or card surfaces. A stats read failure MUST NOT block the rest of the detail page; counts MAY be omitted when the read fails.

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

App detail and Pack detail MUST offer a Like control that shows the current like count and whether the signed-in user has liked the resource. An anonymous user MUST be able to see the like count. Activating Like while signed out MUST open the existing login flow and MUST NOT call the like API. After a successful login that was started from Like, the system MUST complete the like. A signed-in user activating Like MUST send the like or unlike to winstall-api with the session API JWT. Like MUST NOT require a local like store.

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

### Requirement: App download counts include pack and generate exports

An App's lifetime download count MUST include downloads of that app by itself, plus one download each time a Pack that contains it is exported, plus one download each time it is exported from the generate page. A Pack export MUST still increment the Pack download count once. Opening an install drawer without copying or downloading MUST NOT increment counts.

#### Scenario: Pack export increments the pack and each listed app
- **WHEN** a user copies or downloads an export for a Pack that contains apps
- **THEN** the system MUST send one pack `download` track for that Pack and one app `download` track for each distinct app in that Pack

#### Scenario: Generate export increments each listed app
- **WHEN** a user copies or downloads an export on the generate page
- **THEN** the system MUST send one app `download` track for each distinct app in the current generate list and MUST NOT send a pack `download` track

### Requirement: Trending is absent

The web app MUST NOT show a Trending badge, rail, or sort as part of this capability.

#### Scenario: Detail has no trending mark
- **WHEN** a user opens an App or Pack detail page
- **THEN** the page MUST NOT present a Trending label or equivalent heat mark
