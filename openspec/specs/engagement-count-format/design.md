## Context

互动计数由 `utils/engagementStats.js` 的 `formatCount` 统一格式化：详情 stats、Like、货架终身三项、周榜窗口三项、首页 carousel。App/Pack 详情的 views / installs 在 stats 读成功时始终展示，不再使用 `WINSTALL_SHOW_VIEWS_INSTALLS`。

## Goals / Non-Goals

**Goals:**

- `formatCount` 用 `K`/`M`/`B` 紧凑单位，一位小数，无 `+`。
- picker 卡与主路径共用同一函数。
- 详情 stats 成功即画 views / installs。

**Non-Goals:**

- 不改 stats / like / list payload。
- 不要求 `title` 精确值，不加新 UI。
- 不改分页 `toLocaleString` 总数。
- 不做商店 `10K+` 分桶。

## Decisions

### 1. 只改 `formatCount` 的单位切档，不改调用方布局

**选择：** 在 `utils/engagementStats.js` 中：`< 1000` 返回 `String(value)`；否则按 `1000` / `1e6` / `1e9` 选 `K`/`M`/`B`，`(value / unit).toFixed(1)` 去掉末尾 `.0` 再拼后缀。若系数为 `1000` 则升到下一单位（`999950` 四舍五入后不显示 `1000K`）。`null` / `NaN` 仍返回 `null`。`AddAppPickerCard` 使用同一 `formatCount`。

**理由：** 原先只有 `K`，百万会变成 `1500K`。产品选择一位小数、不要 `+`。

**备选：** Play 式 `10K+` 分桶 — 已否。`Intl.NumberFormat` compact — 语言与去 `.0` 不好控，本仓保持手写。

### 2. 删除 `WINSTALL_SHOW_VIEWS_INSTALLS`

**选择：** 不再提供该环境变量、document meta 或 `isShowViewsInstalls`。stats 有值就渲染。

**理由：** 开关后续用不上；关掉会违反详情规范。

### 3. 测试钉死紧凑边界

**选择：** `test/engagementApi.test.js` 覆盖整数、`1K`/`12.4K`/`1.5M`/`1B`、升档与 `null`。

## Risks / Trade-offs

- **[Risk] `12.4K` 仍比精确值短。** → 接受：产品已选一位小数、不要 `+`。
