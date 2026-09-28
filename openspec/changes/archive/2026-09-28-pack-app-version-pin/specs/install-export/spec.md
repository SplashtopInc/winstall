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
