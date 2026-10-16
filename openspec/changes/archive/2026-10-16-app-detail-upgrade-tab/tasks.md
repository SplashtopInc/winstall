## 1. 详情页命令切换

- [x] 1.1 在 `components/AppDetailView.js` 用 Install / Upgrade 两个 tab 切换同一条命令框，默认 Install，状态不写入 localStorage
- [x] 1.2 标题改为 `{name} with winget`。版本选择器只在 Install tab 显示；升级命令固定为 `winget upgrade -e --id {id}`，不带 `-v`；切到升级时保留已选版本，Download installer 仍使用该钉选
- [x] 1.3 在 `styles/appDetail.module.scss` 为 tab 补样式，沿用现有 `.cmd` / `.cmdCopy`。窄屏仍是命令在上、Copy 整行在下。去掉升级命令上的行内 `marginTop`

## 2. 复制与计数

- [x] 2.1 Copy 按当前 tab 写入对应命令。复制成功态在切换 tab 时清掉
- [x] 2.2 安装与升级的 Copy 都调用 `trackAppStats(id, "download")`。不改 `utils/trackAppStats.js` 的按 App id 去重

## 3. 列表卡片

- [x] 3.1 删除 `components/SingleApp.js` 里只在 `large` 时渲染的安装说明和 `Copy`（含升级命令）。保留 `large` 的其余布局

## 4. 核对

- [x] 4.1 打开 App 详情：默认是安装命令；切换后是不带 `-v` 的升级命令；版本控件只在安装页出现；换 tab 后 “Copied!” 消失
- [x] 4.2 确认 `/apps`、分类、搜索结果和 Pack 卡片上没有 winget 命令；生成页与 Pack 导出命令不变
