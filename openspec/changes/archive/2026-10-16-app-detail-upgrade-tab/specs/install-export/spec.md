## MODIFIED Requirements

### Requirement: App detail offers instant installer download as the primary action

App 详情页 MUST 在与 Add to list 同一操作行上提供 Download installer。该控件 MUST 是这一行的主操作。Add to list MUST 仍作为次要操作可用。Copy MUST 留在 winget 命令框上，MUST NOT 挪到操作行。版本下拉 MUST 把 Latest 与每一个目录版本（含当前 tip）分开列出。在用户选出某个目录版本之前，以及用户再次选择 Latest 之后，可见版本 MUST 为 `{目录 tip}(latest)`，安装命令、安装命令的 Copy，以及 Download installer MUST 省略钉选版本。用户选出某个目录版本（含当前 tip）之后，可见版本 MUST 为该版本且不带 `(latest)`，安装命令、安装命令的 Copy，以及 Download installer MUST 带上该版本。切到升级命令时，版本下拉 MUST 隐藏，但已选版本 MUST 保留，Download installer MUST 仍使用该钉选。页面 MUST NOT 打开安装抽屉，也 MUST NOT 展示生成页那套导出 tab。

#### Scenario: Action row order and emphasis
- **WHEN** 用户查看 App 详情页
- **THEN** 操作行 MUST 以 Download installer 为主控件，并以 Add to list 为同一行上的次要控件

#### Scenario: Download uses the selected version
- **WHEN** 用户明确选择了一个版本（含目录 tip）后点击 Download installer，无论当前命令 tab 是安装还是升级
- **THEN** 下载的 installer MUST 针对该 App 的这个已选版本

#### Scenario: Copy stays on the command
- **WHEN** 用户在选择版本之前查看 App 详情页，且当前命令为安装
- **THEN** Copy MUST 留在命令框上，命令 MUST 为不带 `-v` 的 `winget install -e --id …`，可见版本 MUST 为目录 tip 后接 `(latest)`

#### Scenario: Explicit version includes -v
- **WHEN** 用户在 App 详情页选择了一个版本，且当前命令为安装，然后复制该命令
- **THEN** 命令 MUST 带上该版本的 `-v`，可见版本 MUST 为该版本且不带 `(latest)`

## ADDED Requirements

### Requirement: App 详情在安装与升级命令之间切换

App 详情的命令区 MUST 用 Install 与 Upgrade 两个 tab 切换同一条命令框和同一个 Copy。默认 tab MUST 为 Install。该选择 MUST 只存在于当前这次页面查看，MUST NOT 写入持久存储。区块标题 MUST NOT 写成 “Install {name} with winget”。Install tab MUST 展示安装命令，规则与本能力中详情页安装命令一致。Upgrade tab MUST 展示 `winget upgrade -e --id {id}`，MUST NOT 包含 `-v`。切换 tab MUST 清掉复制成功状态。这些 tab MUST NOT 使用生成页导出 tab 的持久化行为。

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
