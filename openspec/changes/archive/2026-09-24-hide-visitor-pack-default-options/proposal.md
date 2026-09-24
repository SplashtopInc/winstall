## Why

访客打开别人的 public pack 并点 Install 时，抽屉里仍能展开 Default Options。写入虽已按所有者拦截，但控件看起来像在改这个 pack。应对外隐藏编辑器，避免误改观感，同时继续用 pack 已存的默认选项生成脚本。

## What Changes

- 非所有者（含未登录）打开 Pack Install 抽屉时，不展示 Default Options。
- 导出脚本仍按该 pack 已保存的 `defaultInstallOptions`（以及各 app 上已有的 `installOptions`）拼装，访客不能在抽屉里改写这些值。
- 所有者安装自己的 pack 时，Default Options 行为不变：可编辑并防抖写入 pack。
- Generate 页的 Default Options 不变。
- 访客若要自定义选项，仍走「Add to my packs」再改自己的副本。

## Capabilities

### New Capabilities

- （无）

### Modified Capabilities

- `install-export`: Pack Install 抽屉不再对非所有者展示 default-options 控件；脚本仍应用 pack 已存默认。

## Impact

- `pages/packs/[id].js` 向 `InstallDrawer` / `ExportApps` 传入是否可编辑默认选项。
- `components/InstallDrawer.js`、`components/AppExport/ExportApps.js`、`components/AppExport/AdvancedConfig.js`：按标志隐藏 Default Options。
- 不改 Pack API、不改 persist 门控（非 owner 仍不得 PATCH `defaultInstallOptions`）。
- Generate 与 App 详情导出路径不受影响。
