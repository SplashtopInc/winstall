## ADDED Requirements

### Requirement: App detail offers instant installer download as the primary action

The App detail page MUST show a Download installer control on the same action row as Add to list. That control MUST be the primary action on the row. Add to list MUST remain available as a secondary action. Copy MUST remain on the winget command box and MUST NOT move onto the action row. Activating Download installer MUST download the same instant installer used on generate for that one app, at the version currently selected on the detail page. The page MUST NOT open an install drawer or show generate export tabs.

#### Scenario: Action row order and emphasis
- **WHEN** a user views an App detail page
- **THEN** the action row MUST include Download installer as the primary control and Add to list as a secondary control on the same row

#### Scenario: Download uses the selected version
- **WHEN** a user activates Download installer after choosing a non-latest version
- **THEN** the downloaded installer MUST target that selected version of the app

#### Scenario: Copy stays on the command
- **WHEN** a user views an App detail page
- **THEN** Copy MUST remain on the command box and the command format MUST stay `winget install -e --id …`
