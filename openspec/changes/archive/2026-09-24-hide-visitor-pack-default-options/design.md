## Context

See proposal.md — Why。Pack 详情已用 `isOwner` 拦截 `defaultInstallOptions` 的 PATCH；Install 抽屉仍通过共用的 `ExportApps` → `AdvancedConfig` 展示 Default Options。Generate 也走同一套 `ExportApps`，隐藏逻辑必须默认不影响 Generate。

## Goals / Non-Goals

**Goals:**

- 用单一布尔标志控制是否渲染 Default Options，避免复制一份 Pack 专用导出面。
- 隐藏时仍把 pack 的 `initialFilters` 喂给脚本拼装。
- 保留现有 `isOwner` persist 门控作为第二道防护。

**Non-Goals:**

- 不为访客做「仅本次导出」的本地改选项。
- 不改 per-app `installOptions` 卡片齿轮（访客本就看不到）。
- 不改 Pack API 字段或 PATCH 契约。

## Decisions

### 1. 标志从 Pack 页传入，Generate 保持默认可见

**选择：** `pages/packs/[id].js` 把 `allowDefaultOptions={isOwner}` 传给 `InstallDrawer` → `ExportApps`。未传或为 true 时行为与今天相同（Generate 不传）。为 false 时不渲染 `AdvancedConfig`，且不调用 `onDefaultFiltersChange`。

**备选：** 在 `AdvancedConfig` 内根据 persistHint 猜测 — 易碎。只在 Pack 页条件渲染另一套导出 — 会分叉命令面。

### 2. 隐藏编辑器，不忽略 pack 默认

**选择：** `ExportApps` 继续用 `initialFilters`（来自 pack 的 `defaultInstallOptions`）生成 bat / ps1 / installer。访客看到的脚本是作者设定，只是不能改。

**备选：** 访客强制 `DEFAULT_INSTALL_FILTERS` — 会丢掉作者为 public pack 配好的 silent/scope/force。

### 3. Winget Import 路径不变

**选择：** `.json` tab 本来就不渲染 Default Options。`allowDefaultOptions === false` 时所有 tab 都不渲染该块，与 Import 的「无选项」外观一致。

## Risks / Trade-offs

- [访客无法为本机临时改 interactive] → 产品选择；需要自定义则 Copy 成自己的 pack。
- [共用 `ExportApps` 漏传标志导致 Generate 也被藏] → 默认 `allowDefaultOptions` 为 true。
- [只藏 UI、persist 回归时访客仍可能写入] → 保持 `handleDefaultFiltersChange` 的 `isOwner` 早退，且访客不绑定 `onDefaultFiltersChange`。

## Migration Plan

仅前端。无需数据迁移。回滚即恢复始终渲染 `AdvancedConfig`。
