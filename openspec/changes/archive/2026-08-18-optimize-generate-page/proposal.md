## Why

Generate 页信息结构偏旧（插画、textarea、列表标题与命令区脱节），安装类型与命令不好一眼扫清。v2.4 需求 3 要改进该页体验；视觉与信息顺序已在 `.demo/generate.html` 对齐。单 App 一键复制属于 App 详情，不在本 change。

## What Changes

- 按 `.demo/generate.html` 重排 Generate：**类型 Tab → Default options → 命令/下载 → Selected apps (N)**。去掉右侧插画。空态无插画，引导去浏览 App。
- Generate **不区分** 1 个或 N 个 App：同一套版式，只改命令行数和列表张数。
- 命令规则保持现站：每 App 一条 `winget install --id=… -e [options]`；Batch 用 `&&`，PowerShell 用 `;`。框内一行一条，复制仍是现有单行拼接。默认 `--silent`；`--interactive` / `--force` / `--scope` 与 per-app 覆盖照旧。
- 类型 Tab 用 Pack 列表那套描边胶囊（Download installer → Batch → PowerShell → Winget Import）；默认 Download installer。
- 选中 App 用紧凑卡（图标 / 名 / 发行商 / 版本 / 齿轮）；该 App 覆盖了默认 option 时，齿轮右上角蓝点。
- **共用路径（方案 A）**：上述 Tab、options、命令框与操作按钮落在 `ExportApps`（及 `GenericExport` / `InstallerExport`）。Pack 详情的 `InstallDrawer` 共用这份组件，会一起换皮。命令拼装、Default options、localStorage 默认 Tab、export download track **不改契约**。
- **不做** App 详情一键复制（需求 3 后半句，已有 `winget install -e --id …`）。
- **不做** 官方 `winget install A B C` 多 id 语法。
- **不做** 需求 1、2、4–7（track/like、搜索分页、JWT、Next 16、分类、Pack 迁 API）。

## Capabilities

### New Capabilities

- `install-export`: Generate 页与 Pack 安装抽屉共用的导出面：类型 Tab、Default options、命令展示与复制/下载、Generate 选中列表与空态。1 个与 N 个 App 同一套结构。

### Modified Capabilities

- （无）`detail-engagement` 的 generate / pack export download track 契约不变。

## Impact

- **代码**：`pages/generate.js`（壳、空态、选中列表）；`components/AppExport/ExportApps.js`、`GenericExport.js`、`InstallerExport.js` 与 `styles/exportApps.module.scss`（共用导出皮）；Generate 选中卡样式（复用或收紧 `SingleApp`）。`InstallDrawer` 本身几乎只是壳，会随 `ExportApps` 换皮，一般不必另写交互。
- **API**：无新接口。installer 下载与 `reportExportDownload` 保持现路径。
- **外部**：无。`.demo/generate.html` 是视觉源，不入库除非另说。
- **连带**：打开 Pack 详情 Install 抽屉即可看到同一套 Tab / 命令框 / 按钮。
