## Purpose

Presents a shared winget export surface on the generate page and the Pack install drawer: install-type tabs, default options, copy/download actions, and—on generate—the selected-app list and empty state. One app and many apps use the same layout.

## ADDED Requirements

### Requirement: Generate page orders export above the selected list

When the generate page has one or more selected apps, it MUST show install-type tabs, then default options (except on Winget Import), then the command or installer actions, then a selected-apps heading that includes the count. It MUST NOT show a decorative download illustration beside the export. The selected-apps count MUST NOT appear in the page title or lead.

#### Scenario: Ready generate page structure
- **WHEN** a user opens the generate page with at least one selected app
- **THEN** the page MUST present tabs, default options (unless Winget Import is active), export actions, and a selected-apps heading that includes the number of selected apps, in that order

#### Scenario: Count lives on the list heading
- **WHEN** a user has four apps selected on the generate page
- **THEN** the selected-apps heading MUST include `(4)` and the page title and lead MUST NOT include a selected-app count

### Requirement: One app and many apps share the generate layout

The generate page MUST use the same information structure and command dialect for one selected app and for many selected apps. It MUST NOT switch to an App-detail identity header or a different install-command format when only one app is selected.

#### Scenario: Single selected app
- **WHEN** a user opens the generate page with exactly one selected app
- **THEN** the page MUST show the same tabs, options, export actions, and list chrome as with many apps, with one command line and one list card

#### Scenario: Many selected apps
- **WHEN** a user opens the generate page with more than one selected app
- **THEN** the page MUST show one command line per selected app and one list card per selected app, without a second layout

### Requirement: Pack install drawer shares the export surface

The Pack install drawer MUST present the same install-type tabs, default-options control, command presentation, and copy/download actions as the generate page export. Opening the drawer MUST NOT create a separate command dialect or a generate-only layout fork.

#### Scenario: Pack install uses the same tabs and actions
- **WHEN** a user opens Install on a Pack detail page
- **THEN** the drawer MUST offer Download installer, Batch, PowerShell, and Winget Import with the same default-options and copy/download actions as generate

### Requirement: Per-app install commands

Each selected app MUST produce its own `winget install --id=<id> -e` command, including a pinned `-v` when the selected version is not the latest, plus that app's effective flags. Batch MUST join those commands with `&&`. PowerShell MUST join them with `;`. The displayed command MAY wrap one install per line; copy and download MUST still use the existing single-line joined script. The export MUST NOT emit a single `winget install` with multiple package ids. Unless the user requests interactive install, each command MUST include `--silent`.

#### Scenario: Batch copies joined per-app commands
- **WHEN** a user copies the Batch export for two apps
- **THEN** the clipboard MUST contain two `winget install --id=` commands joined by ` && `, each with `-e` and that app's effective flags

#### Scenario: Display wraps one install per line
- **WHEN** a user views Batch or PowerShell with more than one app
- **THEN** the command box MUST show one install per line, with the joiner at the end of each line except the last

#### Scenario: Official multi-id syntax is not used
- **WHEN** a user exports more than one app
- **THEN** the system MUST NOT present or copy `winget install <id1> <id2>` as the install command

### Requirement: Export actions by install type

Install-type tabs MUST appear in this order: Download installer, Batch, PowerShell, Winget Import. The first visit MUST select Download installer unless the user previously chose another type on this shared export surface. Download installer MUST offer an installer download. Batch MUST offer Copy and Download `.bat`. PowerShell MUST offer Copy and Download `.ps1`. Winget Import MUST hide default options and MUST offer one action that downloads the `.json` and copies the import command. Copy and download MUST continue to record export downloads as they already do.

#### Scenario: Default tab
- **WHEN** a user with no stored export-tab preference opens generate or a Pack install drawer
- **THEN** Download installer MUST be selected

#### Scenario: Winget Import is a single combined action
- **WHEN** a user selects Winget Import
- **THEN** default options MUST be hidden and the only export action MUST download the `.json` and copy the import command

#### Scenario: Batch and PowerShell copy sit below the command
- **WHEN** a user selects Batch or PowerShell
- **THEN** Copy MUST appear below the command box as a primary action, not inside the command box

### Requirement: Generate selected apps show custom-option state

Each selected app on the generate page MUST show icon, name, publisher, version, and a settings control. When that app has custom install options relative to the current defaults, the settings control MUST show a small blue indicator. Activating settings MUST open the existing per-app options editor.

#### Scenario: Custom options marked on the gear
- **WHEN** a selected app on generate has custom install options
- **THEN** its settings control MUST show a small blue indicator and apps using only the defaults MUST NOT

### Requirement: Empty generate page has no illustration

When the generate page has no selected apps, it MUST show a title, a short lead, and a path to browse apps. It MUST NOT show a decorative illustration.

#### Scenario: No apps selected
- **WHEN** a user opens the generate page with an empty selection
- **THEN** the page MUST show an empty-state title and a browse-apps action, and MUST NOT show a download illustration
