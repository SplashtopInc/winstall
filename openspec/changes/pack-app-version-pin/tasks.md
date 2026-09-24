## 1. Resolver

- [x] 1.1 在 `utils/installVersion.js` 增加 `resolvePackAppVersion`：缺省/`""` 未钉住；非法钉（列表非空但不含）回落 `versions[0]`；无 `versions[]` 时信非空 `appVersion`；目录 tip 取 `versions[0]` 不再排序
- [x] 1.2 `getPinnedInstallVersion`：Pack 走 resolver（有效钉必带版本）；generate 仍在 selected ≠ `versions[0]` 时返回版本
- [x] 1.3 扩展 `test/installVersion.test.js` 覆盖空钉、`""`、有效钉（含等于 `versions[0]`）、非法钉、无 versions 时信 pin

## 2. 规范化与写入

- [x] 2.1 改 `normalizePackDetailApps`：保留原始 `appVersion`（缺省与 `""`），catalog `latestVersion` 设为 `versions[0]`
- [x] 2.2 改 `toAppSnapshot`：未钉住写 `""` 或省略；不要用 catalog latest 填空钉
- [x] 2.3 加 app（`AddAppsDialog.js` / `addAppsToPack`）默认不写钉住版本

## 3. 卡片与导出

- [x] 3.1 `PackDetailAppCard.js`：未钉住 select value 为 `""`，展示 `v{versions[0]}`；下拉含 Latest（空值）与 `versions[]`；`pages/packs/[id].js` 允许空字符串 persist
- [x] 3.2 `ExportApps.js`、`downloadInstantInstaller.js`、`generateWingetImport.js` 使用 `getPinnedInstallVersion`
- [x] 3.3 在 Pack 详情核对：未钉住脚本无 `-v` 且卡片为 `versions[0]`；钉住含 `-v`；非法钉回落且不自动 PATCH；无 versions 时信 `appVersion`
