## Why

App 详情已经能复制 `winget install`，刚合并的升级命令只是贴在下面的一段文字，不能复制，标题也仍写着安装。列表卡片上的安装命令写在 `SingleApp` 的 `large` 分支里，没有任何页面传入 `large`，用户看不到，也不该出现在扫列表的卡片上。

## What Changes

- App 详情的命令区用 **Install** / **Upgrade** 两个 tab 切换同一条命令框和同一个 Copy。默认是 Install。选择只留在当前页，不写入 localStorage。
- Install 保持现有命令：未钉版本时 `winget install -e --id {id}`，钉了版本才加 `-v`。版本选择器只在 Install tab 出现。
- Upgrade 显示 `winget upgrade -e --id {id}`，不加 `-v`，不跟版本选择器。
- 两条 Copy 都记该 App 的 `download`。沿用按 App id 的去重，短时间内连点两条只记一笔。
- 换 tab 时清掉 “Copied!”。
- 区块标题不再写成 “Install {name} with winget”。
- 删掉 `SingleApp` 里只在 `large` 时出现的安装命令和升级命令。列表、搜索、分类、Pack 卡片不展示 winget 命令。
- **不做** 生成页或 Pack 导出的升级命令，也不把详情页改成生成页那套导出 tab。

## Capabilities

### New Capabilities

- （无）

### Modified Capabilities

- `install-export`: App 详情用 Install / Upgrade tab 切换命令；版本钉选只作用于安装命令和 instant installer；列表卡片不展示 winget 命令。
- `detail-engagement`: 复制详情页升级命令与复制安装命令一样计入该 App 的 download，且同一次去重窗口内只记一笔。

## Impact

- **代码**：`components/AppDetailView.js`、`styles/appDetail.module.scss`；`components/SingleApp.js` 删除不可达的命令块。`utils/trackAppStats.js` 的 download 去重保持按 App id，不按命令拆开。
- **API**：无新接口。仍是 `POST /analytics/track` 的 app `download`。
- **外部**：无。
