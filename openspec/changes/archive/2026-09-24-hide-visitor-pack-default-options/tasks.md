## 1. 导出面隐藏开关

- [x] 1.1 在 `components/AppExport/ExportApps.js` 增加 `allowDefaultOptions`（默认 true）；为 false 时不渲染 `AdvancedConfig`，且不把变更回传给 `onDefaultFiltersChange`
- [x] 1.2 在 `components/InstallDrawer.js` 透传 `allowDefaultOptions`

## 2. Pack 详情接线

- [x] 2.1 在 `pages/packs/[id].js` 向 `InstallDrawer` 传入 `allowDefaultOptions={isOwner}`；非所有者不传 `onDefaultFiltersChange`
- [x] 2.2 确认访客仍用 pack 的 `initialFilters` 生成脚本；所有者路径与 persist 门控不变
- [x] 2.3 确认 `pages/generate.js` 不传该标志，Default Options 仍可见（Winget Import 除外）
