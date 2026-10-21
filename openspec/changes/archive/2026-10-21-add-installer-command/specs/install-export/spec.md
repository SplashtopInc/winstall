## MODIFIED Requirements

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

## ADDED Requirements

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
