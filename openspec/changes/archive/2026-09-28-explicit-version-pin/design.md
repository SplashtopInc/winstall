## Context

见 proposal.md — Why。选中对象上的 `selectedVersion` 会在加入列表和补全目录时被填成当前 tip，不能当作「用户选过」。`getPinnedInstallVersion` 已区分：对象上有 `appVersion` 键则按 Pack 钉住规则（空钉省略 `-v`，非空钉即使等于 tip 也带 `-v`）；没有该键则按 Generate「选中版 === tip 则省略 `-v`」。`toAppSnapshot` 只在有 `appVersion` 键时写入该值，否则写 `""`。卡片可见文案是 `.versionLabel`，下拉本身是透明层。

## Goals / Non-Goals

**Goals:**

- 只用「用户改过版本控件」写入非空 `appVersion`。
- Generate 与 Pack 卡片共用同一套标签：空钉 `v{tip} (latest)`，明确钉住不带该后缀。
- 选中列表加入 pack 时原样持久化这个钉。

**Non-Goals:**

- 不在 Add App 弹窗或货架卡上加版本选择。
- 不改 Pack API 字段，不迁移已存的钉。

## Decisions

### 1. 明确钉 = 对象上的 `appVersion`

**选择：** 用户在版本控件里选定某号时，把该字符串写入选中对象的 `appVersion`（同时保留展示用的 `selectedVersion`）。选 Latest 时把 `appVersion` 写成 `""`。从未改过控件则不要这个非空值（键可以不存在）。禁止用「`selectedVersion` 非空」或「`selectedVersion` !== tip」推断钉。

**理由：** 自动填上的 tip 和用户点中的 tip 必须分开。点中 tip 仍是钉，脚本带 `-v`，标签不带 `(latest)`。

**备选：** 只有选了非 tip 才写 `appVersion`。否决：用户已确定选过的版本绝不按 tip 展示。

### 2. Generate 卡片走空钉下拉

**选择：** Generate 的 `PackDetailAppCard` 打开 `allowUnpinnedVersion`，从而用 `resolvePackAppVersion`，并显示 Latest（value `""`）。`pages/generate.js` 的版本变更必须接受空字符串：空则 `appVersion: ""`，非空则 `appVersion` 为该号。

**理由：** 没有 Latest，用户一旦选定就无法回到空钉。可见标签加在 `.versionLabel`（以及只读 `<span>`）上，不要改透明 `<select>` 的配色。

**备选：** 只改标签、不提供 Latest。否决：无法从钉回到 float。

### 3. 详情加入列表只在 onChange 时写钉

**选择：** `components/AppDetailView.js` 的下拉把 Latest（空值）和每个目录版本（含 tip，文案 `v{版本号}`）分开，与 Generate / Pack 卡片一致。未选时选中 Latest，命令、复制和 instant installer 不带 `-v`，信息区仍显示 `{tip} (latest)`。选定具体版本（含等于 tip 的那一项）写入 `appVersion`，命令带 `-v`。`components/SingleApp.js` 仍只在用户改过版本控件时写入 `appVersion`。

**理由：** 详情页默认停在 tip 不是一次选择；点中具体版本号才是钉。

### 4. 入库沿用快照，弹窗继续强制空钉

**选择：** `components/SelectionBar.js` 不另写版本规则，靠选中对象上的 `appVersion` 经 `toAppSnapshot` 入库。`components/AddAppsDialog.js` 继续 `{ appVersion: "" }`。`utils/ensureAppBasics.js` 补 `versions[]` 时保留已有 `appVersion`，且不得因为补上了 tip 而新建钉。

**理由：** 持久化路径已经认 `appVersion` 键。弹窗没有版本控件。

### 5. 标签格式

**选择：** 空钉固定为 `v{tip} (latest)`（`v` 前缀，括号前有空格）。明确钉住为 `v{版本号}`。

**理由：** 与现有卡片 `v{displayVersion}` 和详情选项里的 ` (latest)` 一致。

## Risks / Trade-offs

- [再次把同一 app 以空钉加入会清掉 pack 里原来的钉] → 沿用按 id 覆盖；在 spec 里写明，不做保留旧钉的特例。
- [详情命令框与选中列表分叉] → 已取消：详情页命令、复制和 installer 与空钉 / 明确钉同一规则。
- [后归档 `pack-app-version-pin` 用旧 delta 覆盖主 spec] → 归档那个 change 前先改它的 delta，或先归档本 change 再合并，避免展示规则被旧正文盖掉。
- [旧的 session 选中只有 `selectedVersion`] → 没有 `appVersion` 时仍当空钉，不会把历史默认 tip 写成钉。

## Migration Plan

仅前端。无需数据迁移。回滚即恢复「选中版等于 tip 省略 `-v`」且加入 pack 一律空 `appVersion`，并去掉 `(latest)` 标签。
