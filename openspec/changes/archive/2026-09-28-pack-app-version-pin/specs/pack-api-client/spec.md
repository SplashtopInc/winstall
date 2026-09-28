## ADDED Requirements

### Requirement: Pack appVersion 决定钉住版本

Pack 详情 `apps[]` 的 `appVersion` MUST 表示是否钉住：字段缺省、`null` 或 `""`（含仅空白）MUST 视为未钉住。目录最新版 MUST 为 `versions[]` 的第一项，MUST NOT 再排序。未钉住且存在 `versions[]` 时，有效版本 MUST 为 `versions[0]`，卡片标签 MUST 为 `v{versions[0]} (latest)`，导出 MUST NOT 带 `-v`。非空 `appVersion` 且该值出现在 `versions[]` 中时，卡片标签 MUST 为 `v{该版本}` 且 MUST NOT 包含 `(latest)`，导出 MUST 带 `-v`，即使该值等于 `versions[0]`。非空、`versions[]` 非空但不含该值时，MUST 与未钉住相同，回落到 `versions[0]`（标签带 `(latest)`，不带 `-v`）；客户端 MUST NOT 为此自动 PATCH 清掉服务端上的原值。`versions[]` 缺省或为空时，非空 `appVersion` MUST 视为有效钉（卡片与导出都用该值）。用户在版本控件里明确选定的版本（含当时的 tip）加入 pack 时 MUST 写入该 `appVersion`。从未选定版本时 MUST 写空。没有版本控件的货架加选 MUST NOT 写入非空 `appVersion`。Pack 详情 Add App 弹窗 MUST 以空 `appVersion` 加入。主人在版本下拉中选择具体版本 MUST 把该值写入 `appVersion`；选择 Latest MUST 把 `appVersion` 写成空。客户端 MUST NOT 再把 pack 元素上的 `latestVersion` 当作钉住版本，也 MUST NOT 把仅用于展示的当前 tip 当成用户选定的版本。

#### Scenario: 空 appVersion 跟最新
- **WHEN** 用户打开 Pack 详情且某 app 的 `appVersion` 缺省或为 `""`，且 `versions[]` 含多个版本
- **THEN** 该卡版本标签 MUST 为 `v{versions[0]} (latest)`

#### Scenario: 有效钉住展示固定版
- **WHEN** 某 app 的 `appVersion` 非空且出现在该元素的 `versions[]` 中
- **THEN** 该卡版本标签 MUST 为 `v{该 appVersion}`，且 MUST NOT 包含 `(latest)`

#### Scenario: 钉住值不在 versions 则回落最新
- **WHEN** 某 app 的 `appVersion` 非空且 `versions[]` 存在但不含该值
- **THEN** 该卡版本标签 MUST 为 `v{versions[0]} (latest)`，且 MUST NOT 因此自动请求更新 pack

#### Scenario: 未选版本加入 pack
- **WHEN** 用户未在版本控件中选定版本就把该 app 加入 pack
- **THEN** 该次写入的快照 `appVersion` MUST 为空

#### Scenario: 选过版本加入 pack
- **WHEN** 用户在版本控件中明确选定一个版本（含当前 tip）后把该 app 加入 pack
- **THEN** 该次写入的快照 `appVersion` MUST 为该版本

#### Scenario: 选择跟最新走则写空
- **WHEN** 主人在版本下拉中选择跟最新走
- **THEN** 随后写入的 `appVersion` MUST 为空

#### Scenario: 无 versions 时信 appVersion
- **WHEN** 某 app 的 `appVersion` 非空且没有 `versions[]` 或列表为空
- **THEN** 该卡展示的版本 MUST 为该 `appVersion`

## MODIFIED Requirements

### Requirement: Pack payloads stay UI-compatible without web-side moderation

Pack payloads returned to the UI MUST remain usable by existing Pack pages: document `_id`, `name`, `description`, `visibility`, `status`, `defaultInstallOptions`, and `apps` elements with `_id` / `name` / `appVersion` (empty meaning unpinned) and catalog version fields (`versions` and/or `latestVersion` as the catalog tip, not a pin). The web app MUST NOT apply a separate local content-moderation gate before create or update; rejected or accepted pack text is determined by the API response.

#### Scenario: Detail page loads without embedded stats
- **WHEN** the pack detail page loads a public pack
- **THEN** the page MUST render pack metadata and apps from the Pack payload without depending on `pack.stats` on that document

#### Scenario: Create uses API validation only
- **WHEN** a signed-in user submits a new pack whose name or description the API rejects
- **THEN** the UI MUST surface the API error and MUST NOT have already accepted the pack via a local moderation pass

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
