## MODIFIED Requirements

### Requirement: Found app detail document title uses the app name and Download

已找到且未软删除的应用详情页文档标题 MUST 为该应用的显示名称、一个半角空格、单词 `Download`、然后是 ` | winstall`。完整形式为 `{显示名称} Download | winstall`。`Download` 的大小写 MUST 固定为该写法。竖线两侧各 MUST 有一个半角空格。标题 MUST NOT 包含 `with WinGet`。页面上的 `meta name="title"`、Open Graph 标题与 Twitter 标题 MUST 使用这同一字符串。已找到但已软删除（`deletedAt` 非空）的应用 MUST NOT 使用该 `Download` 标题格式；其标题规则由本能力「Soft-deleted app detail document title」约定。

#### Scenario: WinBox document title

- **WHEN** 用户打开已找到且未软删除的应用，且该应用显示名称为 `WinBox`
- **THEN** 文档标题 MUST 为 `WinBox Download | winstall`

#### Scenario: Old winget sentence is gone

- **WHEN** 用户打开任意已找到且未软删除应用的详情页
- **THEN** 文档标题 MUST NOT 包含 `with WinGet`

### Requirement: Title change stays on the found-app document title

本次「Download」标题格式 MUST 只作用于已找到且未软删除应用的详情页文档标题。应用不存在时，文档标题 MUST 仍为 `App not found | winstall`。已找到且未软删除时，页面主标题 MUST 仍只显示应用名称。此类页面的 meta description MUST 仍以 `Install {应用名} via WinGet. Copy the winget install command instantly.` 开头，并后接该应用的完整描述或短描述。软删除详情的标题与 description 由本能力「Soft-deleted app detail document title」与 `soft-deleted-apps` 约定，MUST NOT 套用上述 Install 导语。

#### Scenario: Missing app keeps its title

- **WHEN** 详情页判定该应用不存在
- **THEN** 文档标题 MUST 为 `App not found | winstall`

#### Scenario: Visible heading stays the app name

- **WHEN** 用户打开已找到且未软删除应用的详情页，且该应用显示名称为 `WinBox`
- **THEN** 页面主标题 MUST 为 `WinBox`

#### Scenario: Description is unchanged

- **WHEN** 用户打开已找到且未软删除应用的详情页
- **THEN** meta description MUST 仍以 `Install ` 与 ` via WinGet. Copy the winget install command instantly.` 这段现有导语开头

## ADDED Requirements

### Requirement: Soft-deleted app detail document title

已找到且已软删除的应用详情页文档标题 MUST 为 `{显示名称} | winstall`，MUST NOT 包含 `Download`。页面主标题 MUST 仍为该应用显示名称。meta description MUST NOT 以 `Install {应用名} via WinGet` 安装导语开头，MUST 说明该应用已从 winget 下架或已不可安装。

#### Scenario: Soft-deleted title omits Download

- **WHEN** 用户打开已找到但 `deletedAt` 非空的应用，且显示名称为 `Atom`
- **THEN** 文档标题 MUST 为 `Atom | winstall`，且 MUST NOT 包含 `Download`
