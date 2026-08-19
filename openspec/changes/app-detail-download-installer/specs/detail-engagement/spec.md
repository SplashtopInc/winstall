## MODIFIED Requirements

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
