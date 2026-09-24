## MODIFIED Requirements

### Requirement: Pack install drawer shares the export surface

The Pack install drawer MUST present the same install-type tabs, command presentation, and copy/download actions as the generate page export. When the current user owns the pack, the drawer MUST also present the same default-options control as generate. When the current user does not own the pack, including when they are signed out, the drawer MUST NOT present the default-options control. Opening the drawer MUST NOT create a separate command dialect or a generate-only layout fork. Export scripts MUST still apply that pack's saved default install options and each app's saved per-app install options even when the default-options control is hidden.

#### Scenario: Pack install uses the same tabs and actions
- **WHEN** a user opens Install on a Pack detail page
- **THEN** the drawer MUST offer Download installer, Batch, PowerShell, and Winget Import with the same copy/download actions as generate

#### Scenario: Owner sees default options
- **WHEN** the pack owner opens Install
- **THEN** the drawer MUST present the default-options control as on generate, except when Winget Import is the active tab

#### Scenario: Visitor does not see default options
- **WHEN** a user who does not own the pack opens Install
- **THEN** the drawer MUST NOT present the default-options control, and the exported commands MUST still include that pack's saved default install flags
