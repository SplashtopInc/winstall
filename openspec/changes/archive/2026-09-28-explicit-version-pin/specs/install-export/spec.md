## MODIFIED Requirements

### Requirement: Per-app install commands

Each selected app MUST produce its own `winget install --id=<id> -e` command, plus that app's effective flags. When that app has no explicit version pin (`appVersion` missing or blank), the command MUST omit `-v`. When the user has explicitly selected a version, the command MUST include `-v` with that version, including when the version equals the catalog tip (`versions[0]` when a version list is present). Instant installer payloads and the Winget Import package `Version` field MUST use the same pin-or-omit rule (omit `Version` when unpinned). Batch MUST join those commands with `&&`. PowerShell MUST join them with `;`. The displayed command MAY wrap one install per line; copy and download MUST still use the existing single-line joined script. The export MUST NOT emit a single `winget install` with multiple package ids. Unless the user requests interactive install, each command MUST include `--silent`.

#### Scenario: Batch copies joined per-app commands
- **WHEN** a user copies the Batch export for two apps
- **THEN** the clipboard MUST contain two `winget install --id=` commands joined by ` && `, each with `-e` and that app's effective flags

#### Scenario: Display wraps one install per line
- **WHEN** a user views Batch or PowerShell with more than one app
- **THEN** the command box MUST show one install per line, with the joiner at the end of each line except the last

#### Scenario: Official multi-id syntax is not used
- **WHEN** a user exports more than one app
- **THEN** the system MUST NOT present or copy `winget install <id1> <id2>` as the install command

#### Scenario: Unpinned app omits -v
- **WHEN** a user copies Batch for an app they never explicitly version-selected
- **THEN** that app's command MUST omit `-v`

#### Scenario: Explicit tip pin includes -v
- **WHEN** a user copies Batch for an app whose explicit version equals the catalog tip
- **THEN** that app's command MUST include `-v` with that version

### Requirement: Generate selected apps show custom-option state

Each selected app on the generate page MUST show icon, name, publisher, version, and a settings control. When that app has no explicit version pin, the version label MUST be `v{catalog tip} (latest)`. When the user has explicitly selected a version, the version label MUST be `v{that version}` and MUST NOT include `(latest)`, including when that version equals the catalog tip. The version control MUST offer a Latest choice that clears the pin, and MUST offer each catalog version as an explicit pin. When that app has custom install options relative to the current defaults, the settings control MUST show a small blue indicator. Activating settings MUST open the existing per-app options editor.

#### Scenario: Custom options marked on the gear
- **WHEN** a selected app on generate has custom install options
- **THEN** its settings control MUST show a small blue indicator and apps using only the defaults MUST NOT

#### Scenario: Unpinned generate card shows latest
- **WHEN** a selected app on generate has no explicit version pin and the catalog tip is `1.2.3`
- **THEN** the card version label MUST be `v1.2.3 (latest)`

#### Scenario: Explicit tip selection hides latest
- **WHEN** a user explicitly selects the catalog tip on a generate app card
- **THEN** the card version label MUST NOT include `(latest)` and the export command MUST include `-v` for that version

### Requirement: App detail offers instant installer download as the primary action

The App detail page MUST show a Download installer control on the same action row as Add to list. That control MUST be the primary action on the row. Add to list MUST remain available as a secondary action. Copy MUST remain on the winget command box and MUST NOT move onto the action row. The version dropdown MUST list Latest separately from each catalog version, including the current tip. Until the user selects a catalog version, and again after the user chooses Latest, the visible version MUST be `{catalog tip}(latest)` and the winget command, Copy, and Download installer MUST omit a pinned version. After the user selects a catalog version, including the current tip, the visible version MUST be that version without `(latest)`, and the command, Copy, and Download installer MUST include that version. The page MUST NOT open an install drawer or show generate export tabs.

#### Scenario: Action row order and emphasis
- **WHEN** a user views an App detail page
- **THEN** the action row MUST include Download installer as the primary control and Add to list as a secondary control on the same row

#### Scenario: Download uses the selected version
- **WHEN** a user activates Download installer after explicitly choosing a version, including the catalog tip
- **THEN** the downloaded installer MUST target that selected version of the app

#### Scenario: Copy stays on the command
- **WHEN** a user views an App detail page before choosing a version
- **THEN** Copy MUST remain on the command box, the command MUST be `winget install -e --id …` without `-v`, and the visible version MUST be the catalog tip followed by `(latest)`

#### Scenario: Explicit version includes -v
- **WHEN** a user selects a version on the App detail page and copies the command
- **THEN** the command MUST include `-v` with that version, and the visible version MUST be that version without `(latest)`
