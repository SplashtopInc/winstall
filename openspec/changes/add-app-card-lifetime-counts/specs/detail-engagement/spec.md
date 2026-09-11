## MODIFIED Requirements

### Requirement: Detail pages show lifetime view and download counts

App detail and Pack detail MUST show lifetime view and download (install) counts obtained from the winstall-api stats surface for that resource. Those pages MUST NOT read counts from an embedded `stats` object on the App or Pack document. This capability MUST NOT use the stats surface to populate list or catalog cards; lifetime counts on `SingleApp` that come from list payload fields are specified by `app-card-engagement`. A stats read failure MUST NOT block the rest of the detail page; counts MAY be omitted when the read fails.

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
- **THEN** those surfaces MUST NOT display counts obtained from `GET /apps/:id/stats` or `GET /packs/:id/stats` as part of this capability
