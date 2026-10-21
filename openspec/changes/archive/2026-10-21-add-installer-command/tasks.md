## 1. 配置拼装

- [x] 1.1 在 `utils/downloadInstantInstaller.js` 为 `buildInstallerConfig` 与 `downloadInstantInstaller` 增加第三参 `command`，缺省 `install`，并写入每个 app
- [x] 1.2 `command` 为 `upgrade` 时不写包 `version`；为 `install` 时仍用 `getPinnedInstallVersion`，schema `version` 保持 `0.0.1`，`options` 拼装不变
- [x] 1.3 在 `test/downloadInstantInstaller.test.js` 覆盖：缺省与显式 `install` 在有钉选时带版本、未钉选时省略版本、`upgrade` 在有钉选时也省略版本，且 schema 仍为 `0.0.1`

## 2. 详情页下载

- [x] 2.1 在 `components/AppDetailView.js` 把当前 `commandTab` 传给 `downloadInstantInstaller`
- [x] 2.2 确认按钮文案仍是 Download installer，升级 tab 仍隐藏版本下拉并保留钉选；切回安装后下载再次带上该钉选

## 3. Generate 与 Pack

- [x] 3.1 确认 `components/AppExport/InstallerExport.js` 的下载与开发预览都不传 `command`，因此每个 app 为 `install`。这两处不传 `upgrade`，升级只从单个 App 详情进入。文件名与 `options` 保持原样
