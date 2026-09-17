## Context

见 proposal.md 的 Why。`formatCount` 已是详情 stats、Like、货架三项、周榜与 carousel 的格式入口；`AddAppPickerCard` 另有几乎相同的 `formatLikeCount`。详情 views / installs 另被 `isShowViewsInstalls`（`WINSTALL_SHOW_VIEWS_INSTALLS` + `_document` meta）挡住。归档后本文件归属 `openspec/specs/engagement-count-format/design.md`。

## Goals / Non-Goals

**Goals:**

- `formatCount` 用 `K`/`M`/`B` 紧凑单位，一位小数，无 `+`。
- 去掉 views/installs 环境开关，stats 成功即画。
- picker 卡与主路径共用同一函数。

**Non-Goals:**

- 不改 stats / like / list payload。
- 不要求 `title` 精确值，不加新 UI。
- 不改分页 `toLocaleString` 总数。
- 不做商店 `10K+` 分桶。

## Decisions

### 1. 只改 `formatCount` 的单位切档，不改调用方布局

**选择：** 在 `utils/engagementStats.js` 中：`< 1000` 返回 `String(value)`；否则按 `1000` / `1e6` / `1e9` 选 `K`/`M`/`B`，`(value / unit).toFixed(1)` 去掉末尾 `.0` 再拼后缀。若系数为 `1000` 则升到下一单位（`999950` 四舍五入后不显示 `1000K`）。`null` / `NaN` 仍返回 `null`。`AddAppPickerCard` 改为 import `formatCount`。

**理由：** 现网已是一位小数 + `K`，缺的是 `M`/`B` 与进位。产品已明确不要 `+`。

**备选：** `COUNT_BUCKETS` + `10K+` — 已否。`Intl.NumberFormat` compact — 语言与去 `.0` 不好控，本仓保持手写。

### 2. 删除 `WINSTALL_SHOW_VIEWS_INSTALLS`

**选择：** 去掉 `isShowViewsInstalls`、`SHOW_VIEWS_INSTALLS_META`、`_document` 的 `winstall-show-views-installs` meta，以及 App/Pack 详情上对 views/installs 行的开关包裹。stats 有值就渲染。若 `parseOnOffEnv` 再无调用方，连同 `test/runtimeConfig.test.js` 中仅测该函数的用例一起删。

**理由：** 开关后续用不上；默认已是开，只增加「关掉就违反详情规范」的分叉。

**备选：** 默认开但保留 env — 否决，用户要求去掉。

### 3. 测试钉死紧凑边界与开关消失

**选择：** `test/engagementApi.test.js`：`0`/`428`/`999` 原样；`1000`→`1K`；`12400`→`12.4K`；`1500000`→`1.5M`；`1e9`→`1B`；`null`→`null`；并覆盖升档（四舍五入后系数为 1000）。详情不再出现 `isShowViewsInstalls()` 条件。

## Risks / Trade-offs

- **[Risk] `12.4K` 仍比精确值短，但比 `10K+` 更像在报读数。** → 接受：产品已选一位小数、不要 `+`。
- **[Risk] 部署环境若曾把开关设为 off，升级后详情会突然出现计数。** → 这是预期；无需迁移开关值。

## Migration Plan

纯前端。部署即生效；曾依赖 `WINSTALL_SHOW_VIEWS_INSTALLS=0` 的环境会开始展示 views/installs。回滚即恢复旧格式与开关。
