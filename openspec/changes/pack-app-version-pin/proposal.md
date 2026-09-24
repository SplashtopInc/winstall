## Why

Pack API 已把快照上的 `latestVersion` 改为 `appVersion`：空表示未钉住、跟目录最新；有值表示固定版本。Web 仍把 `latestVersion` 当成钉，卡片和安装脚本都会把「未指定」做成假钉，或在钉住版等于目录 tip 时丢掉 `-v`。

## What Changes

- Pack 详情 app 卡与 Pack 安装导出共用同一套有效版本：`appVersion` 缺省或 `""` 视为未钉住，展示/安装用 `versions[0]`；有值且在 `versions[]` 里用该值；有值、列表非空但不含该值则回落 `versions[0]`；**没有 `versions[]` 时信 `appVersion`**。
- 未钉住的导出 MUST NOT 带 `-v`；已钉住（即使等于 `versions[0]`）MUST 带 `-v`。Instant installer 同一规则。Generate 导出仍按 selected ≠ catalog latest，不套 pack 空钉模型。
- 写入快照用 `appVersion`：新加入 pack 的 app 默认空（跟最新）；主人选具体版本则钉住；选跟最新走则写空（省略或 `""`）。
- 不再把 pack payload 的 `latestVersion` 当作钉住版本。目录最新固定为 `versions[]` 第一项。

## Capabilities

### New Capabilities

- （无）

### Modified Capabilities

- `pack-api-client`：详情卡展示与读写以 `appVersion` 为准，空钉跟 latest，非法钉回落 latest。
- `install-export`：Pack / generate 导出按有效钉决定是否带 `-v`，钉住即写出固定版本。

## Impact

- `utils/installVersion.js`、`utils/packHelpers.js`（`normalizePackDetailApps`、`toAppSnapshot`）
- `components/PackDetailAppCard.js`、`pages/packs/[id].js`、`components/AddAppsDialog.js`
- `components/AppExport/ExportApps.js`、`utils/downloadInstantInstaller.js`、`utils/generateWingetImport.js`
- `test/installVersion.test.js`
- 不改 winstall-api
