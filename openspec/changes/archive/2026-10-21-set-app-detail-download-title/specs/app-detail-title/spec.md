## Purpose

规定已找到应用的详情页文档标题使用「应用名 Download | winstall」，让搜索结果先露出应用名，并让浏览器标签仍能认出站点。

## ADDED Requirements

### Requirement: Found app detail document title uses the app name and Download

已找到应用的详情页文档标题 MUST 为该应用的显示名称、一个半角空格、单词 `Download`、然后是 ` | winstall`。完整形式为 `{显示名称} Download | winstall`。`Download` 的大小写 MUST 固定为该写法。竖线两侧各 MUST 有一个半角空格。标题 MUST NOT 包含 `with WinGet`。页面上的 `meta name="title"`、Open Graph 标题与 Twitter 标题 MUST 使用这同一字符串。

#### Scenario: WinBox document title

- **WHEN** 用户打开已找到的应用，且该应用显示名称为 `WinBox`
- **THEN** 文档标题 MUST 为 `WinBox Download | winstall`

#### Scenario: Old winget sentence is gone

- **WHEN** 用户打开任意已找到应用的详情页
- **THEN** 文档标题 MUST NOT 包含 `with WinGet`

### Requirement: Title change stays on the found-app document title

本次标题格式 MUST 只作用于已找到应用的详情页文档标题。应用不存在时，文档标题 MUST 仍为 `App not found | winstall`。已找到应用时，页面主标题 MUST 仍只显示应用名称。meta description MUST 仍以 `Install {应用名} via WinGet. Copy the winget install command instantly.` 开头，并后接该应用的完整描述或短描述。

#### Scenario: Missing app keeps its title

- **WHEN** 详情页判定该应用不存在
- **THEN** 文档标题 MUST 为 `App not found | winstall`

#### Scenario: Visible heading stays the app name

- **WHEN** 用户打开已找到应用的详情页，且该应用显示名称为 `WinBox`
- **THEN** 页面主标题 MUST 为 `WinBox`

#### Scenario: Description is unchanged

- **WHEN** 用户打开已找到应用的详情页
- **THEN** meta description MUST 仍以 `Install ` 与 ` via WinGet. Copy the winget install command instantly.` 这段现有导语开头
