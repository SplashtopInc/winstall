## 1. Shared installer download

- [x] 1.1 Extract `InstallerExport`'s payload build, `POST /api/installer`, blob download, and status poll into a helper both Generate and App detail can call
- [x] 1.2 Keep Generate Download installer behavior unchanged (default silent flags, existing tip, Processing countdown, `reportExportDownload`)

## 2. App detail actions

- [x] 2.1 Add Download installer as the primary purple button on the same row as Add to list; keep Copy on the command box
- [x] 2.2 Restyle Add to list as a secondary outline button; leave Like and Share where they are
- [x] 2.3 Wire the button to the helper for the current app and selected version; show Processing while in flight
- [x] 2.4 On successful download, `trackAppStats(app._id, "download")`; do not track on failure; do not send a pack track
- [x] 2.5 Add the existing instant-installer tip near the action so the button is not read as a vendor setup download

## 3. Verify

- [x] 3.1 App detail: Download installer is primary, Add to list is secondary, Copy still copies `winget install -e --id …`
- [x] 3.2 Pinned version on detail is the version baked into the downloaded installer
- [x] 3.3 Generate installer tab still downloads; detail and generate each track one app download on success
