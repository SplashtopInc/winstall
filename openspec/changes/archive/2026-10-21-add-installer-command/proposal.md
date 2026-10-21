## Why

Instant installer 的配置只有包和开关，没有动词。builder 收到之后只会跑 `winget install`。App 详情已经能在 Install / Upgrade 之间切换复制出去的命令，但 Download installer 仍按安装去打 exe，而且升级 tab 上仍把钉选版本写进配置。用户复制的是升级，下到的是安装。

## What Changes

- Instant installer 配置的每个 app 增加 `command`，取值 `install` 或 `upgrade`。网站始终写入该字段。`upgrade` 只由单个 App 详情页发出。
- App 详情的 Download installer 跟随当前命令 tab。Install 仍按现有钉选规则带或不带 `version`。Upgrade 写入 `command: "upgrade"`，并省略 `version`，即使界面上仍留着钉选。
- 切回 Install 且钉选还在时，下载再次带上该版本。版本下拉在 Upgrade 上继续隐藏，钉选状态继续保留。
- Generate 与 Pack 的 installer 每条 app 都写 `install`。这两处不支持 upgrade，钉选规则不变。
- 配置的 `version` 仍为 `"0.0.1"`。按钮文案仍是 Download installer。`options` 的拼装不变。

## Capabilities

### New Capabilities

- （无）

### Modified Capabilities

- `install-export`：单个 App 详情在升级 tab 下载的 installer 使用 `command: "upgrade"` 且不带包版本。所有 instant installer 配置按 app 写入 `command`，Generate 与 Pack 只写 `install`。

## Impact

- 前端：`utils/downloadInstantInstaller.js` 的配置拼装；`components/AppDetailView.js` 把当前命令 tab 传进下载。Generate 与 Pack 仍走 `components/AppExport/InstallerExport.js`，只是配置里多一个 `install`。
- 外部 installer builder 与网站同步升级，按 `command` 执行。没有旧 builder 兼容层。`upgrade` 只出现在单个 App 详情的下载里。
- 公开路径不变。不改复制出去的 winget 命令文本。
