## Context

See proposal.md — Why。Generate 与 Pack 安装抽屉已经共用 `ExportApps`（Tab、`AdvancedConfig`、命令拼装、`GenericExport` / `InstallerExport`、`winstall-default-export-tab`、`reportExportDownload`）。`.demo/generate.html` 是视觉源。App 详情的一键复制不在本 change。

## Goals / Non-Goals

**Goals:**

- 在共用的 `ExportApps` 上换皮（方案 A），Generate 与 Pack 抽屉一起跟上 demo
- Generate 只改壳：去插画、空态、`Selected apps (N)` 紧凑卡 + 齿轮蓝点
- 命令拼装留在现有 `handleScriptChange` / `getEffectiveConfig`；展示换行，复制仍用现有 joined string

**Non-Goals:**

- 不拆第二套 Export 组件隔离 Pack
- 不改 App 详情命令格式（`-e --id`，默认不带 `--silent`）
- 不改 download track 契约
- 不把 `.demo` 当运行时代码

## Decisions

### Decision 1: 在 `ExportApps` 上换皮，不 fork

**选择**: 改 `ExportApps`、`GenericExport`、`InstallerExport` 与 `exportApps.module.scss`。`InstallDrawer` 继续只包一层壳。

**理由**: 命令、options、Tab 记忆、track 已经共用；隔离会复制行为。用户已选方案 A。

**备选**: Generate 单独包一层样式、Pack 保持 textarea — 拒绝，两套皮。

### Decision 2: 视觉对齐 demo 与 Pack 列表 Tab

**选择**:

- Tab：描边胶囊，对齐 `packsIndex.module.scss`（透明底、2px 边、未选 opacity 0.55、选中紫边 + `#9b2eff`），不要实心紫 pill
- 顺序与默认：Download installer → Batch → PowerShell → Winget Import；无存储偏好时默认 installer（现逻辑）
- 命令框：详情页那类浅紫底（`#f3eaff`），一行一条；`--id=` 可强调，joiner 放行尾
- 主按钮：现有 `button` / `button.accent` 紫胶囊；Copy 在命令框下方，不进命令框
- Generate 标题用 demo：`Your apps are ready` + winget 提示。数量只在 `Selected apps (N)`。Pack 抽屉标题仍由 `InstallDrawer` 自己写，不改文案
- 空态：`No apps selected` + 去首页/浏览；无 `dl.svg`

**理由**: demo 已拍板；Tab 与 Packs 页同一语言。

**备选**: 实心紫 Tab、命令框内 Copy — 探索时已否。

### Decision 3: 展示换行，复制不改

**选择**: `handleScriptChange` 仍产出 `installs.join(" && ")` / `join(" ; ")`。`GenericExport` 把同一字符串按 joiner 拆成多行显示；clipboard 与 `.bat` / `.ps1` 仍是 joined 原文。Winget Import 仍展示 `winget import --import-file "winstall-….json"`，下载的是 JSON。

**理由**: per-app flags 不能合成官方 `winget install A B C`。复制给终端用单行最稳。

**备选**: 复制也带换行 — 现站与多数终端粘贴已按单行工作，不改。

### Decision 4: Generate 卡收紧，不改全站 `SingleApp`

**选择**: Generate 列表用紧凑卡（图标、名、发行商、版本、齿轮）。优先给 `SingleApp` 加 generate 专用变体或页面级 class，避免改首页/搜索卡。蓝点用已有 `hasCustomScopeInstallOptions(app.installOptions)`（或 `_hasCustomConfig` 等价），颜色 `#2563eb`，钉在齿轮右上角。齿轮仍开 `AppSettingsDrawer`。

**理由**: 全站改 `SingleApp` 会误伤列表页。蓝点定义必须和 drawer「这个 App 覆盖了默认」一致。

**备选**: 新组件只给 Generate — 可以，只要不复制选中/版本逻辑。灰色齿轮底或齿轮+勾 — 已否。

### Decision 5: `AdvancedConfig` 契约不动

**选择**: 折叠的 Default options、scope / interactive / force、Winget Import 时隐藏、Pack 的 `persistHint` / `onDefaultFiltersChange` 都留在现组件。只调间距和位置，使它出现在 Tab 下、命令上。

**理由**: Pack owner 写回 pack defaults 已经接在这条回调上。

**备选**: 按 demo 重写一份 options — 拒绝，行为会漂。

### Decision 6: 下载 DOM 兼容

**选择**: `GenericExport` / `InstallerExport` 换掉 textarea 时，保留现有隐藏下载锚点（`#gsc` 或等价）或改为同文件内创建 object URL，避免依赖页面上另一个 textarea。

**理由**: 现实现 `querySelector("#gsc")` / `textarea`，换皮时最容易静默坏掉下载。

## Risks / Trade-offs

- **[Risk] Pack 抽屉比 Generate 窄，新 Tab + 命令框可能挤** → Mitigation：实现后在 Pack Install 抽屉核对换行；Tab 已是 wrap。不为此再 fork 组件。
- **[Risk] 共用 `winstall-default-export-tab`，Generate 选的 Tab 会带到 Pack 抽屉** → Mitigation：这是现行为，保持。
- **[Risk] 全站改 `SingleApp` 误伤列表** → Mitigation：Decision 4，只收紧 Generate。
- **[Risk] 换皮弄丢 download track 或 installer 请求** → Mitigation：继续走现有 `onExportDownload` / `reportExportDownload`；核对 copy 与 download 都仍触发。

## Migration Plan

前端-only。无 API、无数据迁移。发布即生效；回滚即还原本 change 的页面与 `AppExport` 样式。`.demo` 不参与发布。

## Open Questions

无。方案 A、1/N 同构、命令方言、详情页不在范围，均已定。
