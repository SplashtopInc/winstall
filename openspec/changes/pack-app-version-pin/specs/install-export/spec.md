## MODIFIED Requirements

### Requirement: Per-app install commands

Each selected app MUST produce its own `winget install --id=<id> -e` command, plus that app's effective flags. Batch MUST join those commands with `&&`. PowerShell MUST join them with `;`. The displayed command MAY wrap one install per line; copy and download MUST still use the existing single-line joined script. The export MUST NOT emit a single `winget install` with multiple package ids. Unless the user requests interactive install, each command MUST include `--silent`.

On generate, a command MUST include pinned `-v` when that app's selected version is not the catalog latest (`versions[0]` when present). On a Pack install export, a command MUST include `-v` with `appVersion` when that pin is non-empty and either `versions[]` is missing/empty or the pin is present in `versions[]`, including when that value equals `versions[0]`. A Pack app whose `appVersion` is missing or `""`, or whose pin is non-empty while `versions[]` is non-empty and does not contain it, MUST omit `-v`. Instant installer payloads MUST use the same pin-or-omit rule as the winget command for that app.

#### Scenario: Batch copies joined per-app commands
- **WHEN** a user copies the Batch export for two apps
- **THEN** the clipboard MUST contain two `winget install --id=` commands joined by ` && `, each with `-e` and that app's effective flags

#### Scenario: Display wraps one install per line
- **WHEN** a user views Batch or PowerShell with more than one app
- **THEN** the command box MUST show one install per line, with the joiner at the end of each line except the last

#### Scenario: Official multi-id syntax is not used
- **WHEN** a user exports more than one app
- **THEN** the system MUST NOT present or copy `winget install <id1> <id2>` as the install command

#### Scenario: Unpinned pack app omits version flag
- **WHEN** a user copies Batch from a Pack install drawer for an app whose `appVersion` is missing or `""`
- **THEN** that app's command MUST NOT include `-v`

#### Scenario: Pinned pack app includes version flag
- **WHEN** a user copies Batch from a Pack install drawer for an app whose `appVersion` is in `versions[]`
- **THEN** that app's command MUST include `-v` with that version even if it equals the catalog latest

#### Scenario: Invalid pack pin omits version flag
- **WHEN** a user copies Batch from a Pack install drawer for an app whose `appVersion` is not in a non-empty `versions[]`
- **THEN** that app's command MUST NOT include `-v`

#### Scenario: Pack pin trusted when versions are absent
- **WHEN** a user copies Batch from a Pack install drawer for an app whose `appVersion` is non-empty and `versions[]` is missing or empty
- **THEN** that app's command MUST include `-v` with that `appVersion`
