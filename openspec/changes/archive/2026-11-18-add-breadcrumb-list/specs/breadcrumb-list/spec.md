## Purpose

让分类页、已找到且有货架的 App 详情、Pack 列表与已拿到合集的 Pack 详情在文档中输出 schema.org 的 `BreadcrumbList` JSON-LD，使爬虫与语言模型能读出站点分类与页面层级，而不增加可见面包屑 UI，也不改公开路径。

## ADDED Requirements

### Requirement: BreadcrumbList 使用统一条目形状

每份面包屑结构化数据 MUST 为类型 `application/ld+json` 的独立脚本，其根对象 MUST 使用 schema.org 的 `BreadcrumbList`。该对象 MUST 包含：

- `@context` 为 `https://schema.org`
- `@type` 为 `BreadcrumbList`
- `itemListElement` 为按层级从根到当前页排列的数组

`itemListElement` 中每一项 MUST 为 `ListItem`，且 MUST 包含：

- `@type` 为 `ListItem`
- `position` 为从 1 起的连续整数
- `name` 为该级短标签（MUST NOT 附带文档标题里的 ` - winstall` 或 ` Download | winstall` 后缀）
- `item` 为该级页面的 canonical 绝对地址

同一文档中若另有其它 JSON-LD（例如 App 详情的 `SoftwareApplication`），本能力 MUST 仍输出独立的 `BreadcrumbList` 脚本，MUST NOT 把它并入其它根对象。本能力 MUST NOT 新增可见面包屑导航。本能力 MUST NOT 把任何页面改到既有公开路径以外的地址。

#### Scenario: 根对象与条目字段齐全

- **WHEN** 任一目标页输出面包屑结构化数据
- **THEN** 文档中 MUST 存在一份 `application/ld+json`，其 `@type` 为 `BreadcrumbList`，且每个 `ListItem` 含连续的 `position`、短标签 `name` 与绝对地址 `item`

#### Scenario: 不新增可见面包屑

- **WHEN** 用户打开任一输出了 `BreadcrumbList` 的页面
- **THEN** 页面 MUST NOT 因本能力新增可见的面包屑导航控件

### Requirement: 分类页输出 Apps 浏览层级

在 `/category` 上，系统 MUST 输出一条 `BreadcrumbList`，层级 MUST 为：`winstall`（`/`）→ `Apps`（`/category`）。

在 `/category/<slug>` 且 `<slug>` 为已知货架时，系统 MUST 输出一条 `BreadcrumbList`，层级 MUST 为：`winstall`（`/`）→ `Apps`（`/category`）→ 该货架展示名（`/category/<slug>`）。货架展示名 MUST 与分类页既有 `CATEGORY_LABELS` 一致（例如 `browser` 为 `Browsers`，`development` 为 `Developer Tools`）。

分类页的文档标题、canonical 路径与「页面不展示分类标题」的既有规则 MUST 保持不变。

#### Scenario: All 分类为两级

- **WHEN** 用户打开 `/category`
- **THEN** `BreadcrumbList` 的 `itemListElement` MUST 依次为 `winstall` 指向 `/` 的绝对地址、`Apps` 指向 `/category` 的绝对地址

#### Scenario: 货架分类为三级

- **WHEN** 用户打开 `/category/development`
- **THEN** `BreadcrumbList` MUST 在 `Apps` 之后再有一项，`name` 为 `Developer Tools`，`item` 为 `/category/development` 的绝对地址

### Requirement: 已找到且有货架的 App 详情输出一条货架路径

当 App 详情页已找到对应应用，且该应用在货架顺序中至少有一个已知货架时，系统 MUST 输出恰好一条 `BreadcrumbList`。层级 MUST 为：`winstall`（`/`）→ `Apps`（`/category`）→ 所选货架展示名（`/category/<slug>`）→ 应用显示名称（`/apps/:id`）。

所选货架 MUST 为该应用货架列表按既有货架顺序排列后的第一项。系统 MUST NOT 为同一 App 详情输出多条 `BreadcrumbList`。中间级 MUST 使用 `/category` 与 `/category/<slug>`，MUST NOT 用 `/apps` 充当 Apps 这一级。

当应用没有任何已知货架时，系统 MUST NOT 输出 `BreadcrumbList`。未找到应用或仍处于尚未拿到应用数据的回退加载态时，系统 MUST NOT 输出 `BreadcrumbList`。已找到应用时，既有 `SoftwareApplication` JSON-LD、文档标题与 `/apps/:id` 公开路径规则 MUST 保持不变。

#### Scenario: 单货架应用写出四级

- **WHEN** 用户打开已找到应用的详情页，显示名称为 `VLC`，公开标识为 `VideoLAN.VLC`，且货架仅含 `browser`
- **THEN** 文档中 MUST 存在一份 `BreadcrumbList`，末两项 `name` 依次为 `Browsers` 与 `VLC`，对应 `item` 为 `/category/browser` 与 `/apps/VideoLAN.VLC` 的绝对地址

#### Scenario: 多货架只取货架顺序第一条

- **WHEN** 已找到应用的分类包含 `documents`、`development` 与 `game`
- **THEN** `BreadcrumbList` MUST 恰好一条，货架级 `name` MUST 为 `Developer Tools`（货架顺序中 `development` 先于 `documents` 与 `game`），且 MUST NOT 再为 `Office` 或 `Games` 另写一份 `BreadcrumbList`

#### Scenario: 无货架不输出面包屑

- **WHEN** 已找到应用的分类不含任何已知货架
- **THEN** 文档 MUST NOT 包含 `@type` 为 `BreadcrumbList` 的 JSON-LD

#### Scenario: 未找到与骨架回退不输出面包屑

- **WHEN** 详情页判定应用不存在，或仍在回退加载且尚未拿到应用数据
- **THEN** 文档 MUST NOT 包含 `@type` 为 `BreadcrumbList` 的 JSON-LD

### Requirement: Pack 列表与已拿到合集的详情输出 Packs 层级

在 `/packs` 上，系统 MUST 输出一条 `BreadcrumbList`，层级 MUST 为：`winstall`（`/`）→ `Packs`（`/packs`）。My Packs / Public 标签与页内搜索 MUST NOT 成为面包屑层级。

当 Pack 详情页已成功拿到合集数据并展示该合集时，系统 MUST 输出一条 `BreadcrumbList`，层级 MUST 为：`winstall`（`/`）→ `Packs`（`/packs`）→ 合集名称（`/packs/:id`）。合集名称 MUST 为该 Pack 的 `name`。公开、未列出与私人合集只要页面已展示该合集，MUST 使用同一条层级规则。

当 Pack 详情仍在加载、判定找不到、或加载失败时，系统 MUST NOT 输出 `BreadcrumbList`。本能力 MUST NOT 把 Pack 详情改到 `/packs/:id` 以外的路径，MUST NOT 改动文档标题既有规则。

#### Scenario: Pack 列表为两级

- **WHEN** 用户打开 `/packs`
- **THEN** `BreadcrumbList` 的 `itemListElement` MUST 依次为 `winstall` 指向 `/` 的绝对地址、`Packs` 指向 `/packs` 的绝对地址

#### Scenario: 已拿到合集写出三级

- **WHEN** 用户打开已拿到合集的 Pack 详情，合集名称为 `Dev Essentials`，公开标识为某 `:id`
- **THEN** 文档中 MUST 存在一份 `BreadcrumbList`，末项 `name` 为 `Dev Essentials`，`item` 为该页 `/packs/:id` 的绝对地址

#### Scenario: 加载中找不到或失败不输出

- **WHEN** Pack 详情仍在加载、判定找不到，或加载失败
- **THEN** 文档 MUST NOT 包含 `@type` 为 `BreadcrumbList` 的 JSON-LD
