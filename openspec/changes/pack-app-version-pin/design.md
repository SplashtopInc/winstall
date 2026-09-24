## Context

见 `proposal.md` 的 Why。需求见本 change 的 delta specs。现状：`normalizePackDetailApps` 用 `selectedVersion ?? appVersion ?? latestVersion` 填钉；`toAppSnapshot` 总会写出非空 `appVersion`；`getPinnedInstallVersion` / `getCatalogLatestVersion` 会排序 `versions[]` 且在选中版等于 tip 时省略 `-v`。归档后本节并入 `openspec/specs/pack-api-client/design.md`，导出规则同步 `openspec/specs/install-export/design.md`（若尚无文件则创建）。

## Goals / Non-Goals

**Goals:**

- 读路径一个 resolver：有效展示版 + 是否写入 `-v` / installer `version`。
- Pack 写路径能表示空钉；加 app 默认空。
- Generate 仍用 `selectedVersion !== versions[0]` 决定 `-v`，不把 generate 选中列表改成 pack 的 `appVersion` 模型。

**Non-Goals:**

- 不改 winstall-api。
- 不改 App 详情自己的版本选择。
- 不改 `GET /packs` 列表卡（不展示 per-app 版本）。

## Decisions

### 1. 共用 `resolvePackAppVersion`

**选择：** 在 `utils/installVersion.js` 增加 `resolvePackAppVersion(app)`，返回 `{ displayVersion, pinnedVersion }`。`pinnedVersion` 有值才给脚本 `-v` 和 installer `version`。目录 tip 为 **`versions[0]`**（API 已排好，MUST NOT `compareVersion` 再排）；无 `versions[]` 时才回退 payload `latestVersion`。`getPinnedInstallVersion`：Pack 走 resolver；generate 仍「selected !== versions[0]」。

**理由：** 卡片和导出必须同一有效版；generate 的 selectedVersion 总是有值，不能套空钉语义。

**备选：** 一律用 selectedVersion。否决：无法表示未钉住。客户端再排序 versions。否决：与「latest = 第一项」冲突。

### 2. 空钉、非法钉、无列表

**选择：** 缺字段、`null`、`""`、仅空白 → 未钉住。有 `versions[]` 时未钉住展示 `versions[0]`，不带 `-v`。非空 pin 且在列表中 → 钉住（含 pin === `versions[0]`，仍带 `-v`）。非空 pin、列表非空但不含 → 回落 `versions[0]`，不带 `-v`，不自动 PATCH。**没有 `versions[]`（缺省或 `[]`）时信非空 `appVersion`：展示与 `-v` 都用它。**

**理由：** 详情 hydrate 后能核对列表；薄快照 / 写回包没有 versions 时不能把主人刚钉的版本丢掉。

**备选：** 无 versions 也 float。否决：用户已指定信 `appVersion`。

### 3. 写入与 Latest 下拉

**选择：** 未钉住 PATCH：`appVersion` 省略或 `""` 均可（读取时两者都当 latest）。`toAppSnapshot` 未钉住写 `""`。加 app 不设钉。下拉第一项「Latest」value 为 `""`；未钉住时 select 的 value 必须是 `""`，旁边展示文案仍是 `v{versions[0]}`。选具体 version（含等于 `versions[0]` 的那一项）则钉住。`handleVersionChange` MUST 接受空字符串。

**理由：** 空 value 才能区分「跟最新走」和「钉在当前第一项」。

**备选：** 没有 Latest，只能钉不能浮。否决：加进去的 app 无法保持 float。

### 4. Winget Import

**选择：** 有 `pinnedVersion` 才写 JSON `Version`；未钉住省略该键。

**理由：** 与 `-v` 同一规则。

## Risks / Trade-offs

- **[旧 pack 仍把当时 latest 写进 appVersion]** → 会显示为钉住并带 `-v`；数据迁移归 API。
- **[Latest 与列表第一项看起来像两个最新]** → 文案区分：Latest = float；`v{versions[0]}` = 钉在该号。
- **[Trade-off]** Generate 与 Pack 导出规则分叉。

## Migration Plan

只发 Web。回滚：恢复旧规范化与「selected === latest 则省略 `-v`」。

## Open Questions

无。
