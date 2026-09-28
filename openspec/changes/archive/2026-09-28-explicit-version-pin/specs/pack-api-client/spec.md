## MODIFIED Requirements

### Requirement: Pack 详情直接消费补齐后的 apps

Pack 详情页 MUST 用 `GET /packs/:id` 响应中的 `apps[]` 渲染 app 卡片（含快照字段以及 `desc`、`versions`、`updatedAt`、`available`）。该页 MUST NOT 再为列表中的每个 app 请求 `GET /apps/:id`，MUST NOT 请求 `GET /apps/:id/stats` 或其它目录接口来补卡片。`available` 为 `false` 的元素 MUST 仍留在列表原位，并以不可用状态展示。`appVersion` 缺省或为 `""` 时，卡片版本标签 MUST 为 `v{目录 tip} (latest)`（有 `versions[]` 时 tip 为第一项）。非空 `appVersion` 时，标签 MUST 为 `v{该版本}` 且 MUST NOT 包含 `(latest)`，即使该值等于目录 tip。主人可改版本时，下拉 MUST 提供空值 Latest 以回到空钉，选定具体版本 MUST 把该值写入 `appVersion`。本要求 MUST NOT 改变 `GET /packs`、`GET /packs/me`、`GET /packs/trending` 的列表消费方式，也 MUST NOT 改变 `/generate` 为选中 app 拉取目录详情的方式。

#### Scenario: 打开详情不再按 app 拉目录
- **WHEN** 用户打开某个 Pack 详情页且 `GET /packs/:id` 成功
- **THEN** 页面用该响应的 `apps[]` 画出卡片，且 MUST NOT 对这些 app 再请求 `GET /apps/:id`

#### Scenario: 下架 app 按 available 展示
- **WHEN** 详情 `apps[]` 中某元素 `available` 为 `false`
- **THEN** 该卡 MUST 仍出现在原位，并以不可用状态展示，且 MUST NOT 因此使整页当作 Pack 不存在

#### Scenario: 详情 app 卡不展示 like
- **WHEN** 用户查看 Pack 详情上的 app 卡片
- **THEN** 该卡 MUST NOT 展示该 app 的 like 数，且客户端 MUST NOT 为该数请求目录或 stats

#### Scenario: generate 上的同款卡也不展示 like
- **WHEN** 用户在 `/generate` 查看选中 app 的卡片
- **THEN** 该卡 MUST NOT 展示 like 数

#### Scenario: 空钉显示 latest
- **WHEN** Pack 卡片上某 app 的 `appVersion` 为 `""` 且目录 tip 为 `1.2.3`
- **THEN** 版本标签 MUST 为 `v1.2.3 (latest)`

#### Scenario: 钉在 tip 不显示 latest
- **WHEN** Pack 卡片上某 app 的 `appVersion` 非空且等于目录 tip
- **THEN** 版本标签 MUST NOT 包含 `(latest)`

## ADDED Requirements

### Requirement: 选中列表的明确版本写入 appVersion

把选中列表加入已有 pack 时，若某 app 带有用户在版本控件里明确选定的版本，该次快照的 `appVersion` MUST 为该版本（含等于当时目录 tip 的选择）。若用户从未在版本控件中选定版本，该次 `appVersion` MUST 为空。没有版本控件的货架加选 MUST NOT 写入非空 `appVersion`。Pack 详情 Add App 弹窗 MUST 以空 `appVersion` 加入新 app。同一 app 再次加入 MUST 用这次选择覆盖该 id 的快照，因此一次空钉加入 MUST 清掉原先的钉。客户端 MUST NOT 把仅用于展示的当前 tip 当成用户选定的版本。

#### Scenario: 未选版本加入 pack
- **WHEN** 用户未改过版本就把该 app 加入已有 pack
- **THEN** 写入的 `appVersion` MUST 为空

#### Scenario: 选过版本加入 pack
- **WHEN** 用户在版本控件中选定 `1.0.0` 后把该 app 加入已有 pack
- **THEN** 写入的 `appVersion` MUST 为 `1.0.0`

#### Scenario: 选定当前 tip 也写入
- **WHEN** 用户在版本控件中明确选定当前目录 tip 后把该 app 加入已有 pack
- **THEN** 写入的 `appVersion` MUST 为该 tip，且 MUST NOT 为空

#### Scenario: Add App 弹窗仍为空钉
- **WHEN** 所有者从 Pack 详情的 Add App 弹窗加入一个 app
- **THEN** 该次写入的 `appVersion` MUST 为空
