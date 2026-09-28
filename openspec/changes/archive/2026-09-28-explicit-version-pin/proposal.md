## Why

选中 app 时，界面几乎总会带上当前最新版，但分不清「用户没选过」和「用户指定了版本」。Generate 脚本在选中版等于 tip 时省略 `-v`，加进 pack 时却一律写成空 `appVersion`，用户在 Generate 上选过的版本进不了数据库。空钉和钉在当前 tip 的卡片看起来也一样。

## What Changes

- 用户没有改过版本：不写钉（无 `appVersion` 或 `""`）。Generate 脚本与 Winget Import 不带版本；卡片展示 `v{versions[0]} (latest)`。
- 用户在版本控件里选定某个版本（含正好等于当前 tip 的那一项）：把该号写入 `appVersion`。脚本与 Import 带该版本；卡片只显示版本号，**不**带 `(latest)`。
- Generate 与 Pack 主人卡片提供 Latest（空值），用来从钉回到空钉。
- 从选中列表加入已有 pack 时，把上述 `appVersion` 写入 pack 快照。没有版本控件的入口（货架加选、Pack 的 Add App 弹窗）仍是空钉。
- App 详情页下拉与 Generate、Pack 一致：Latest 单独一项，最新版号另列一项。未选 Latest 时命令不带 `-v`；选定具体版本（含当前 tip）后带 `-v`。

## Capabilities

### New Capabilities

- （无）

### Modified Capabilities

- `install-export`: Generate / Pack 导出以及 App 详情命令按「是否明确选过版本」决定 `-v`；空钉显示 `(latest)`，明确钉住（含钉在 tip）不显示。
- `pack-api-client`: 选中列表上的明确版本在加入 pack 时写入 `appVersion`；Pack 卡片用同一套空钉 / 钉住展示。

## Impact

- `components/PackDetailAppCard.js`：空钉标签为 `v{version} (latest)`；Generate 也走空钉下拉。
- `pages/generate.js`：改版本时写入或清空 `appVersion`，并接受 Latest 的空值。
- `components/AppDetailView.js`：下拉 Latest 与 `v{版本号}` 分开；未选 Latest 时命令不带 `-v`，选定版本后带 `-v`。`components/SingleApp.js` 仍只在用户改过版本时写入 `appVersion`。
- `components/SelectionBar.js` 经现有 `toAppSnapshot` 持久化已有的 `appVersion`。`components/AddAppsDialog.js` 继续强制空钉。
- `utils/ensureAppBasics.js` 补全 `versions[]` 时不得把默认 latest 写成钉，也不得清掉已有 `appVersion`。
- 不改 Pack API 字段。`pack-app-version-pin` 仍未归档；本 change 的 delta 以当前主 spec 为基准写成最终行为。后归档 `pack-app-version-pin` 时不得用旧 delta 盖掉本要求。
