## 1. Shared export chrome

- [x] 1.1 Restyle `ExportApps` tabs to match Packs index outline pills (transparent, 2px border, inactive opacity 0.55, active purple border and `#9b2eff` text); keep order Download installer → Batch → PowerShell → Winget Import and existing `winstall-default-export-tab` restore
- [x] 1.2 Keep `AdvancedConfig` behavior (collapse, scope / interactive / force, hide on Winget Import, Pack `persistHint` / `onDefaultFiltersChange`); place it under the tabs and above the command or installer actions
- [x] 1.3 Do not add a generate-only fork of `ExportApps`; `InstallDrawer` stays a shell around the same component

## 2. Command box and script actions

- [x] 2.1 Replace the Batch / PowerShell textarea in `GenericExport` with a detail-style command box (`#f3eaff`); show one install per line with the joiner at the end of each line except the last
- [x] 2.2 Keep copy and file download on the existing joined single-line script (` && ` / ` ; `); do not emit `winget install <id1> <id2>`
- [x] 2.3 Put Copy below the command box as a primary `button.accent`; keep Download `.bat` / `.ps1` as the secondary action; do not put Copy inside the command box
- [x] 2.4 On Winget Import, hide default options, show the import command in the same box, and keep one action that downloads the `.json` and copies the import command
- [x] 2.5 When removing the textarea, keep downloads working (retain `#gsc` or create the object URL in the export component) and keep `onExportDownload` / `reportExportDownload` on copy and download

## 3. Installer tab

- [x] 3.1 Keep Download installer as the default first-visit tab; show the existing installer tip and a primary Download installer button; no command box on this tab

## 4. Generate page chrome

- [x] 4.1 On a non-empty generate page, drop the `dl.svg` illustration; set the title to `Your apps are ready` and keep the winget lead; do not put the selected count in the hero
- [x] 4.2 Move the selected list below the export; title it `Selected apps (N)`
- [x] 4.3 Replace the empty state with `No apps selected`, a short lead, and a browse-apps action; no illustration
- [x] 4.4 Use the same generate chrome for one app and for many apps (no App-detail identity header, no alternate command format)

## 5. Selected app cards

- [x] 5.1 Show compact generate cards (icon, name, publisher, version, gear) via a generate-only `SingleApp` variant or page class; do not restyle homepage or search cards
- [x] 5.2 Mark custom options with a `#2563eb` dot on the gear using `hasCustomScopeInstallOptions`; keep the gear opening `AppSettingsDrawer`

## 6. Verify

- [x] 6.1 Generate with 0 / 1 / N apps: empty state, shared layout, per-app commands, copy vs display wrap, installer / import actions
- [x] 6.2 Pack detail Install drawer shows the same tabs, options, command box, and actions; check wrapping in the narrower drawer
- [x] 6.3 Changing default or per-app options updates the command; copy and download still track exports; App detail copy command is unchanged
