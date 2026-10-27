# install-export Specification

## Purpose

Presents a shared winget export surface on the generate page and the Pack install drawer: install-type tabs, default options, copy/download actions, and—on generate—the selected-app list and empty state. One app and many apps use the same layout.

## Requirements

### Requirement: Generate page orders export above the selected list

When the generate page has one or more selected apps, it MUST show install-type tabs, then default options (except on Winget Import), then the command or installer actions, then a selected-apps heading that includes the count. It MUST NOT show a decorative download illustration beside the export. The selected-apps count MUST NOT appear in the page title or lead.

#### Scenario: Ready generate page structure
- **WHEN** a user opens the generate page with at least one selected app
- **THEN** the page MUST present tabs, default options (unless Winget Import is active), export actions, and a selected-apps heading that includes the number of selected apps, in that order

#### Scenario: Count lives on the list heading
- **WHEN** a user has four apps selected on the generate page
- **THEN** the selected-apps heading MUST include `(4)` and the page title and lead MUST NOT include a selected-app count

### Requirement: Generate Add more opens the apps list

When the generate page has one or more selected apps, the selected-apps heading MUST include an Add more action. Activating Add more MUST open the apps list page at `/apps`. It MUST NOT send the user to the home page.

#### Scenario: Add more goes to the apps list
- **WHEN** a user with at least one selected app activates Add more on the generate page
- **THEN** the system MUST open `/apps`

### Requirement: One app and many apps share the generate layout

The generate page MUST use the same information structure and command dialect for one selected app and for many selected apps. It MUST NOT switch to an App-detail identity header or a different install-command format when only one app is selected.

#### Scenario: Single selected app
- **WHEN** a user opens the generate page with exactly one selected app
- **THEN** the page MUST show the same tabs, options, export actions, and list chrome as with many apps, with one command line and one list card

#### Scenario: Many selected apps
- **WHEN** a user opens the generate page with more than one selected app
- **THEN** the page MUST show one command line per selected app and one list card per selected app, without a second layout

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

### Requirement: Per-app install commands

Each selected app MUST produce its own `winget install --id=<id> -e` command, plus that app's effective flags. When that app has no explicit version pin (`appVersion` missing or blank), the command MUST omit `-v`. When the user has explicitly selected a version, the command MUST include `-v` with that version, including when the version equals the catalog tip (`versions[0]` when a version list is present). The Winget Import package `Version` field MUST use the same pin-or-omit rule (omit `Version` when unpinned). An instant installer app whose `command` is `install` MUST use that same pin-or-omit rule for its package version. Batch MUST join those commands with `&&`. PowerShell MUST join them with `;`. The displayed command MAY wrap one install per line; copy and download MUST still use the existing single-line joined script. The export MUST NOT emit a single `winget install` with multiple package ids. Unless the user requests interactive install, each command MUST include `--silent`.

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

### Requirement: Empty generate page has no illustration

When the generate page has no selected apps, it MUST show a title, a short lead, and a path to browse apps. It MUST NOT show a decorative illustration.

#### Scenario: No apps selected
- **WHEN** a user opens the generate page with an empty selection
- **THEN** the page MUST show an empty-state title and a browse-apps action, and MUST NOT show a download illustration

### Requirement: App detail offers instant installer download as the primary action

App 详情页 MUST 在与 Add to list 同一操作行上提供 Download installer。该控件 MUST 是这一行的主操作。Add to list MUST 仍作为次要操作可用。Copy MUST 留在 winget 命令框上，MUST NOT 挪到操作行。版本下拉 MUST 把 Latest 与每一个目录版本（含当前 tip）分开列出。在用户选出某个目录版本之前，以及用户再次选择 Latest 之后，可见版本 MUST 为 `{目录 tip}(latest)`，安装命令、安装命令的 Copy，以及当前命令为安装时的 Download installer MUST 省略钉选版本。用户选出某个目录版本（含当前 tip）之后，可见版本 MUST 为该版本且不带 `(latest)`，安装命令、安装命令的 Copy，以及当前命令为安装时的 Download installer MUST 带上该版本。切到升级命令时，版本下拉 MUST 隐藏，但已选版本 MUST 保留。此时 Download installer 中该 app 的 `command` MUST 为 `upgrade`，并且 MUST 省略包版本。切回安装命令且钉选仍在时，Download installer MUST 再次带上该版本。页面 MUST NOT 打开安装抽屉，也 MUST NOT 展示生成页那套导出 tab。

#### Scenario: Action row order and emphasis
- **WHEN** 用户查看 App 详情页
- **THEN** 操作行 MUST 以 Download installer 为主控件，并以 Add to list 为同一行上的次要控件

#### Scenario: Download uses the selected version
- **WHEN** 用户明确选择了一个版本（含目录 tip）后，在安装命令下点击 Download installer
- **THEN** 下载的 installer 配置中该 app 的 `command` MUST 为 `install`，并且 MUST 带上这个已选版本

#### Scenario: Copy stays on the command
- **WHEN** 用户在选择版本之前查看 App 详情页，且当前命令为安装
- **THEN** Copy MUST 留在命令框上，命令 MUST 为不带 `-v` 的 `winget install -e --id …`，可见版本 MUST 为目录 tip 后接 `(latest)`

#### Scenario: Explicit version includes -v
- **WHEN** 用户在 App 详情页选择了一个版本，且当前命令为安装，然后复制该命令
- **THEN** 命令 MUST 带上该版本的 `-v`，可见版本 MUST 为该版本且不带 `(latest)`

#### Scenario: Upgrade download omits version
- **WHEN** 用户在升级命令下点击 Download installer，无论是否曾经钉选过版本
- **THEN** 下载的 installer 配置中该 app 的 `command` MUST 为 `upgrade`，并且 MUST 不包含包版本

#### Scenario: Install download restores the pin
- **WHEN** 用户钉选了一个版本，切到升级命令后再切回安装命令，然后点击 Download installer
- **THEN** 该 app 的 `command` MUST 为 `install`，并且 MUST 带上原先钉选的版本

### Requirement: App 详情在安装与升级命令之间切换

App 详情的命令区 MUST 用 Install 与 Upgrade 两个 tab 切换同一条命令框和同一个 Copy。默认 tab MUST 为 Install。该选择 MUST 只存在于当前这次页面查看，MUST NOT 写入持久存储。区块标题 MUST 为 `Install or upgrade {name} with winget`，其中 `{name}` 为该应用的显示名称。区块标题 MUST NOT 写成 `{name} with winget`。Install tab MUST 展示安装命令，规则与本能力中详情页安装命令一致。Upgrade tab MUST 展示 `winget upgrade -e --id {id}`，MUST NOT 包含 `-v`。切换 tab MUST 清掉复制成功状态。这些 tab MUST NOT 使用生成页导出 tab 的持久化行为。

#### Scenario: 命令区标题写明安装与升级

- **WHEN** 用户打开已找到应用的详情页，且该应用显示名称为 `WinBox`
- **THEN** 命令区标题 MUST 为 `Install or upgrade WinBox with winget`

#### Scenario: 默认展示安装命令

- **WHEN** 用户打开 App 详情页
- **THEN** 命令区 MUST 显示 Install tab 为选中，并展示该 App 的安装命令与 Copy

#### Scenario: 切换到升级命令

- **WHEN** 用户在 App 详情页选择 Upgrade
- **THEN** 命令框 MUST 改为 `winget upgrade -e --id {id}` 且不带 `-v`，版本下拉 MUST 隐藏，Copy MUST 复制这条升级命令

#### Scenario: 换 tab 清掉复制成功

- **WHEN** 用户复制当前命令后看到复制成功，再切换到另一个命令 tab
- **THEN** 复制成功状态 MUST 被清掉

#### Scenario: 不记住上次的 tab

- **WHEN** 用户在某次查看中选择了 Upgrade，然后重新打开该 App 详情
- **THEN** 命令区 MUST 再次默认停在 Install

### Requirement: 列表卡片不展示 winget 命令

Apps 列表、分类列表、搜索结果和 Pack 内的 App 卡片 MUST NOT 展示 `winget install` 或 `winget upgrade` 命令。用户复制单 App 命令的位置 MUST 仍是 App 详情页。

#### Scenario: 列表卡片没有命令

- **WHEN** 用户浏览 `/apps`、`/category`、搜索结果或 Pack 中的 App 卡片
- **THEN** 这些卡片 MUST NOT 出现 winget 安装命令或升级命令

### Requirement: Instant installer 配置按 app 写入 command

每份 instant installer 配置的 schema 版本 MUST 仍为 `0.0.1`。每个 app MUST 包含 `command`，取值只能是 `install` 或 `upgrade`。`command` 为 `install` 时，包版本 MUST 遵循既有钉选规则：未明确钉选则省略，明确钉选（含等于目录 tip）则写入该版本。`command` 为 `upgrade` 时，该 app MUST 省略包版本。`upgrade` 只允许由单个 App 详情页发出。Generate 页与 Pack 安装抽屉 MUST NOT 写出 `upgrade`，每个 app 的 `command` MUST 为 `install`。App 详情 MUST 按当前命令 tab 写入 `command`。`options` 的拼装 MUST 保持现有规则。按钮文案 MUST 仍为 Download installer。

#### Scenario: Generate 与 Pack 写入 install

- **WHEN** 用户在 Generate 页或 Pack 安装抽屉下载 installer，包括一次下载多个 app
- **THEN** 配置里每个 app 的 `command` MUST 为 `install`，MUST NOT 为 `upgrade`，包版本仍按钉选规则取舍

#### Scenario: 升级省略包版本

- **WHEN** 一份 installer 配置中某个 app 的 `command` 为 `upgrade`
- **THEN** 该 app MUST 不包含包版本

#### Scenario: 未钉选的安装省略包版本

- **WHEN** 一份 installer 配置中某个 app 的 `command` 为 `install`，且该 app 没有明确钉选
- **THEN** 该 app MUST 省略包版本

#### Scenario: schema 版本不变

- **WHEN** 网站提交任意 instant installer 配置
- **THEN** 配置的 schema `version` MUST 为 `0.0.1`

### Requirement: Instant installer download filename formatting

When triggering an instant installer download, the client MUST derive the executable filename using the package identifier (`_id` or `id`), NOT the display name (`name`), to guarantee filesystem-safe ASCII names across all locales. Dots (`.`) in the package identifier MUST be converted to underscores (`_`). When more than one app is selected, the suffix `-etc` MUST be appended before the `.exe` extension.

#### Scenario: Single app installer filename
- **WHEN** a user downloads an instant installer for a single app (e.g., `_id: "Tencent.WeChat"`)
- **THEN** the downloaded filename MUST be `winstall-Tencent_WeChat.exe`

#### Scenario: Multiple apps installer filename
- **WHEN** a user downloads an instant installer for multiple apps where the first app is `Tencent.WeChat`
- **THEN** the downloaded filename MUST be `winstall-Tencent_WeChat-etc.exe`

#### Scenario: Fallback when identifier is missing
- **WHEN** a user downloads an instant installer without an app identifier
- **THEN** the downloaded filename MUST fall back to `winstall-apps.exe`

## References

### WinGet Manifest Schemas
- Version Schema (1.12.0): https://aka.ms/winget-manifest.version.1.12.0.schema.json
- Installer Schema (1.12.0): https://aka.ms/winget-manifest.installer.1.12.0.schema.json
- DefaultLocale Schema (1.12.0): https://aka.ms/winget-manifest.defaultLocale.1.12.0.schema.json
