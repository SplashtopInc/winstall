## Why

App 详情的主路径是复制 winget 命令；不会开终端的人没有出口。Generate 已有 instant installer，但要先选进清单才看得到。把同一条下载放到详情操作行，并做成主按钮，让单 App 快速安装真正落在详情页。

## What Changes

- App 详情操作行增加 **Download installer**，与 **Add to list** 并列。
- **Download installer** 用现有紫主按钮样式；**Add to list** 改为次要（描边/次要按钮）。Copy 仍在命令框内。
- 按钮文案与 Generate Tab 一致：`Download installer`。需要消歧义时用现有 tip：*Download the instant installer and run!*
- 点击即走现有 `/api/installer` 单 App 下载；版本用详情页当前选中版本。不打开 Pack 那种抽屉，不改命令方言。
- 下载成功后按现有详情 Copy 一样记一次 app `download` track。
- **不做** 详情页 Default options / 多导出 Tab。
- **不做** 把详情命令改成 Generate 的 `--id=` + `--silent` 格式。
- **不做** 官网安装包直链。

## Capabilities

### New Capabilities

- （无）

### Modified Capabilities

- `install-export`: App 详情提供与 Generate 同一套 instant installer 下载，作为操作行主按钮。
- `detail-engagement`: App 详情的 installer 下载计入该 App 的 lifetime download（与 Copy 一样，一次下载一条 track）。

## Impact

- **代码**：`AppDetailView` 操作行；复用 `InstallerExport` 的下载逻辑或抽一小段调用 `/api/installer`。`trackAppStats` / 现有 download track。样式：`appDetail.module.scss`（主/次按钮对调）。
- **API**：无新接口。沿用 `/api/installer`。
- **外部**：无。
