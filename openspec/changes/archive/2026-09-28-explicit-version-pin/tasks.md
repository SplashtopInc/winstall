## 1. 卡片标签

- [x] 1.1 在 `components/PackDetailAppCard.js` 中，空钉时可见版本为 `v{tip} (latest)`，非空 `appVersion`（含等于 tip）只显示 `v{版本号}`；下拉与只读文案都覆盖到

## 2. 选中列表上的钉

- [x] 2.1 在 `pages/generate.js` 打开空钉下拉，版本变更接受空字符串：Latest 写 `appVersion: ""`，选定具体版本则写入该号
- [x] 2.2 在 `components/AppDetailView.js` 与 `components/SingleApp.js` 中，仅当用户改过版本控件时才把 `appVersion` 写入已选 app；初次加入不写非空钉
- [x] 2.3 在 `utils/ensureAppBasics.js` 补全版本列表时保留已有 `appVersion`，且不要因补上 tip 而新建钉

## 3. 写入 pack 与导出

- [x] 3.1 确认 `components/SelectionBar.js` 经现有快照会带上选中对象的 `appVersion`；`components/AddAppsDialog.js` 仍强制空钉
- [x] 3.2 确认 Generate / Pack 的脚本、instant installer 与 Winget Import：空钉省略版本，明确钉（含等于 tip）带上该版本

## 4. App 详情

- [x] 4.1 在 `components/AppDetailView.js` 中，Latest 与最新版号分成两项；未选 Latest 时命令、复制、installer 不带 `-v`；选定具体版本（含 tip）后带 `-v`
