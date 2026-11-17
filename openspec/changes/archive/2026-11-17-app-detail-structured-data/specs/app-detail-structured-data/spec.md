## Purpose

让已找到的 App 详情页在文档中带上 schema.org 的 `SoftwareApplication` JSON-LD，使爬虫与语言模型能读出该页对应的 Windows 软件身份、包标识与目录元数据，而不冒充评价或价格富结果。

## ADDED Requirements

### Requirement: 已找到的 App 详情输出 SoftwareApplication JSON-LD

当 App 详情页已找到对应应用时，系统 MUST 在该文档中输出一份类型为 `application/ld+json` 的结构化数据，其根对象 MUST 使用 schema.org 的 `SoftwareApplication`。该对象 MUST 包含：

- `@context` 为 `https://schema.org`
- `@type` 为 `SoftwareApplication`
- `name` 为该应用的显示名称
- `url` 为该详情页的 canonical 绝对地址（路径为 `/apps/:id`，`:id` 为该应用公开标识）
- `operatingSystem` 为 `Windows`
- `identifier` 为该应用的 winget 包标识（与公开路径中的 `:id` 相同）

当字段在目录数据中有非空值时，该对象 MUST 再包含对应属性；无值时 MUST 省略该属性，而不是写成空字符串：

- `description`：优先完整描述，否则短描述
- `softwareVersion`：目录最新版本
- `author` 与 `publisher`：发行方名称（组织）
- `sameAs`：厂商主页绝对地址（不得附带本站追踪查询参数）
- `softwareRequirements`：最低系统要求
- `license`：优先许可证 URL，否则许可证名称
- `dateModified`：目录更新时间
- `image`：应用图标的绝对地址（无法得到绝对地址时 MUST 省略）

`applicationCategory` MUST 仅在该应用货架分类能一对一映射到下列类型之一时写出，且 MUST 取货架顺序中第一个可映射项：`BrowserApplication`、`DeveloperApplication`、`CommunicationApplication`、`UtilitiesApplication`、`SecurityApplication`、`EntertainmentApplication`、`GameApplication`。无法映射时 MUST 省略 `applicationCategory`。

该对象 MUST NOT 包含 `offers`、`aggregateRating`、`review` 或 `downloadUrl`。

#### Scenario: 已找到应用写出核心字段

- **WHEN** 用户打开已找到应用的详情页，且该应用显示名称为 `VLC`、公开标识为 `VideoLAN.VLC`
- **THEN** 文档中 MUST 存在一份 `application/ld+json`，其 `@type` 为 `SoftwareApplication`，`name` 为 `VLC`，`identifier` 为 `VideoLAN.VLC`，`operatingSystem` 为 `Windows`，且 `url` MUST 为该页 `/apps/VideoLAN.VLC` 的 canonical 绝对地址

#### Scenario: 有值的可选字段出现，无值的省略

- **WHEN** 已找到应用带有最新版本与发行方，但没有厂商主页
- **THEN** JSON-LD MUST 包含 `softwareVersion` 与发行方信息，且 MUST NOT 包含 `sameAs`

#### Scenario: 可映射货架写出 applicationCategory

- **WHEN** 已找到应用的货架分类按货架顺序包含 `development`
- **THEN** JSON-LD 的 `applicationCategory` MUST 为 `DeveloperApplication`

#### Scenario: 不可映射货架不写 applicationCategory

- **WHEN** 已找到应用的货架分类仅包含无法一对一映射的项（例如仅 `runtimes`）
- **THEN** JSON-LD MUST NOT 包含 `applicationCategory`

#### Scenario: 不冒充价格、评价或本站下载包

- **WHEN** 用户打开任意已找到应用的详情页
- **THEN** 该页的 `SoftwareApplication` JSON-LD MUST NOT 包含 `offers`、`aggregateRating`、`review` 或 `downloadUrl`

### Requirement: 未找到与骨架回退不输出该结构化数据

当详情页判定应用不存在，或仍处于尚未拿到应用数据的回退加载态时，系统 MUST NOT 输出 `SoftwareApplication` 的 `application/ld+json`。已找到应用时，文档标题、meta description、canonical 路径与页面主标题的既有规则 MUST 保持不变；本能力 MUST NOT 把 App 详情改到 `/apps/:id` 以外的路径。

#### Scenario: 应用不存在时没有 SoftwareApplication

- **WHEN** 详情页判定该应用不存在
- **THEN** 文档 MUST NOT 包含 `@type` 为 `SoftwareApplication` 的 JSON-LD

#### Scenario: 骨架回退时没有 SoftwareApplication

- **WHEN** 详情页仍在回退加载且尚未拿到应用数据
- **THEN** 文档 MUST NOT 包含 `@type` 为 `SoftwareApplication` 的 JSON-LD

#### Scenario: 公开路径与标题规格不受影响

- **WHEN** 用户打开已找到应用的详情页
- **THEN** 地址 MUST 仍为 `/apps/:id`，且文档标题 MUST 仍符合既有「`{显示名称} Download | winstall`」规则
