## Context

见 proposal.md 的 Why。配置在 `utils/downloadInstantInstaller.js` 的 `buildInstallerConfig` 里拼出来，schema 版本是 `"0.0.1"`。每个 app 现有 `name`、`id`、可选的包 `version`、`options`。`version` 来自 `getPinnedInstallVersion`：未钉选时该函数返回 `undefined`，序列化后键消失。

两条下载入口共用这个函数。`components/AppDetailView.js` 的 Download installer 传当前 app 和 `DEFAULT_INSTALL_FILTERS`，不看 `commandTab`。`components/AppExport/InstallerExport.js` 给 Generate 和 Pack 用，开发环境的配置预览也调用同一个 `buildInstallerConfig`。`pages/api/installer.js` 原样把 `config` 交给 builder。

## Goals / Non-Goals

**Goals:**

- 每个 app 写入 `command`，一次下载里的 app 使用同一个动词。
- `upgrade` 只从单个 App 详情传入，并且不写包 `version`。`install` 继续走现有钉选。
- 详情页把当前 tab 传进下载。Generate 与 Pack 固定 `install`。

**Non-Goals:**

- 不给 Generate、Pack 或多 App 下载加升级。`upgrade` 只服务单个 App 详情。
- 不改复制出去的 winget 文本、按钮文案、文件名、`options` 拼装，以及 `pages/api/installer.js` 的转发。
- 不在本仓库实现 builder 对 `winget upgrade` 的执行。
- 不升 schema 版本。

## Decisions

1. **`command` 写在每个 app 上，取值 `install` 或 `upgrade`。**
   - `buildInstallerConfig(apps, filters, command = "install")` 与 `downloadInstantInstaller` 增加同一个第三参。函数把这个值抄到每个 app。调用方一次只传一个动词。
   - 缺省 `"install"`，所以 `InstallerExport` 的下载和开发预览不用改调用方式，预览里也会出现 `command`。
   - **理由**：builder 按 app 循环。`upgrade` 只从单个 App 详情传入。Generate 与 Pack 使用缺省 `install`。
   - **备选**：写在配置顶层。整次下载一个动词时够用，但和按 app 执行的循环分开了。

2. **`upgrade` 不写包 `version`。界面钉选留着。**
   - `command === "upgrade"` 时不调用钉选结果，对象上不放 `version`。
   - `command === "install"` 时仍用 `getPinnedInstallVersion`。未钉选得到 `undefined`，序列化后没有该键。
   - `AppDetailView` 把 `commandTab` 作为第三参传入。切回 Install 时同一份钉选再次进入配置。
   - **理由**：升级命令本身不带 `-v`。钉选只服务安装，藏起下拉时不必清掉，方便切回来。

3. **schema 保持 `"0.0.1"`，网站始终写 `command`。**
   - builder 与网站一起发布。每份配置都带 `command`。
   - 本仓库只发出 `install` 与 `upgrade`。`upgrade` 只从单个 App 详情进入。
   - **理由**：builder 同步升级，字段加在现有 schema 上，版本号不变。函数第三参缺省 `install`，只是 Generate 与 Pack 的调用方式。

## Risks / Trade-offs

- [Risk] `InstallerExport` 忘了把 `command` 放进开发预览，和真实下载不一致 → Mitigation：预览与下载共用 `buildInstallerConfig`，缺省即为 `install`。

## Migration Plan

网站与 builder 一起发布。builder 按 `command` 执行；`upgrade` 不读包版本。回滚时两边一起回到只安装。

## Open Questions

无。
