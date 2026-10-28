## ADDED Requirements

### Requirement: Free-text install options stay inside the generated command

每个应用的 `override`、`log`、`location` 只有在能安全放进 Batch 与 PowerShell 的双引号参数时，才可以进入该应用的有效安装参数。含有双引号、命令分隔符、重定向、cmd 转义、环境变量展开、PowerShell 子表达式或转义字符、换行或其他控制字符的值 MUST 被丢掉。`override` 最长 512 个字符。`log` 与 `location` 最长 260 个字符，并且 MUST 是一条 Windows 绝对路径（盘符路径或 UNC）。括号可以保留，以便 `C:\Program Files (x86)` 这类路径和带括号的安装参数仍然可用。被丢掉的字段 MUST NOT 出现在 Batch、PowerShell 或 instant installer 的 `options` 里。同一应用的其余开关、其余应用的命令，以及 Winget Import JSON MUST 保持不变。设置里再次读到这些值时，非法字段 MUST 为空，合法字段 MUST 仍在。

#### Scenario: Quote-breaking override is omitted from scripts

- **WHEN** 某个应用的 `override` 为 `x" & calc & echo "`，用户导出 Batch 或 PowerShell
- **THEN** 该应用的命令 MUST NOT 包含 `--override`，也 MUST NOT 包含 `calc`

#### Scenario: PowerShell subexpression is omitted from scripts

- **WHEN** 某个应用的 `override`、`log` 或 `location` 为 `$(calc)`，用户导出 Batch 或 PowerShell
- **THEN** 对应命令 MUST NOT 包含该字段，也 MUST NOT 包含 `calc`

#### Scenario: Non-path log and location are omitted

- **WHEN** 某个应用的 `log` 或 `location` 不是 Windows 绝对路径，或长于 260 个字符
- **THEN** Batch、PowerShell 与 instant installer 配置 MUST NOT 包含该字段

#### Scenario: Safe override and path are kept

- **WHEN** 某个应用的 `override` 为 `/quiet`，且 `location` 为 `C:\Program Files (x86)\Apps`
- **THEN** Batch 与 PowerShell MUST 包含这两个参数，instant installer 的 `options` MUST 包含同样的值

#### Scenario: Other flags and apps stay

- **WHEN** 一个应用的 `override` 非法，同时它带有 `--force`，且另一个应用的安装参数全部合法
- **THEN** 前一个应用的命令 MUST 仍包含 `--force`，后一个应用的命令 MUST 仍包含它自己的合法参数

#### Scenario: Stored unsafe values are empty in the editor

- **WHEN** 用户再次打开一个已保存非法 `override`、合法 `log` 路径的应用设置
- **THEN** override 输入 MUST 为空，log 输入 MUST 仍为那条路径
