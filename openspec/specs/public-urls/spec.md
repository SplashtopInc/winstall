# public-urls Specification

## Purpose

把已经对外公布的 App / Pack 页面路径固定下来，避免改版、SEO 或 slug 化把书签、站内链接和 sitemap 里的地址换掉。

## Requirements

### Requirement: App 详情路径不变

App 详情的公开页面路径 MUST 为 `/apps/:id`。`:id` MUST 为该 App 既有公开标识（与 sitemap 中 `/apps/:id` 使用的标识相同）。系统 MUST NOT 把 App 详情改到其它路径，包括改为单数 `/app/:id`、改为 slug 或名称路径、或把详情挪到新前缀下。系统 MUST NOT 用新路径替换该地址后再从旧路径重定向。站内链接与 sitemap 中的 App 详情地址 MUST 使用 `/apps/:id`。本要求约束的是网站页面路径，不是 winstall-api 的接口路径。

#### Scenario: 打开已有 App 详情地址

- **WHEN** 用户打开某个已公布的 `/apps/:id`
- **THEN** 该地址 MUST 仍然打开对应 App 详情，且 MUST NOT 被替换成另一种详情路径

#### Scenario: 新增指向 App 详情的链接

- **WHEN** 系统生成站内链接或 sitemap 中的 App 详情地址
- **THEN** 该地址 MUST 使用 `/apps/:id`

### Requirement: Pack 详情路径不变

Pack 详情的公开页面路径 MUST 为 `/packs/:id`。`:id` MUST 为该 Pack 既有公开标识（与 sitemap 中 `/packs/:id` 使用的标识相同）。系统 MUST NOT 把 Pack 详情改到其它路径，包括改为单数 `/pack/:id`、改为 slug 或名称路径、或把详情挪到新前缀下。系统 MUST NOT 用新路径替换该地址后再从旧路径重定向。站内链接与 sitemap 中的 Pack 详情地址 MUST 使用 `/packs/:id`。本要求约束的是网站页面路径，不是 winstall-api 的接口路径。

#### Scenario: 打开已有 Pack 详情地址

- **WHEN** 用户打开某个已公布的 `/packs/:id`
- **THEN** 该地址 MUST 仍然打开对应 Pack 详情，且 MUST NOT 被替换成另一种详情路径

#### Scenario: 新增指向 Pack 详情的链接

- **WHEN** 系统生成站内链接或 sitemap 中的 Pack 详情地址
- **THEN** 该地址 MUST 使用 `/packs/:id`

### Requirement: Apps 列表路径不变

Apps 列表的公开页面路径 MUST 为 `/apps`。系统 MUST NOT 将该列表改到其它路径，包括 `/app`、`/applications` 或其它前缀。系统 MUST NOT 用新路径替换该地址后再从 `/apps` 重定向。站内指向 Apps 列表的链接 MUST 使用 `/apps`。地址栏查询参数（例如 `q`）不在本要求内，由其它能力规定。

#### Scenario: 打开 Apps 列表

- **WHEN** 用户打开 `/apps`
- **THEN** 该地址 MUST 仍然打开 Apps 列表，且 MUST NOT 被替换成另一种列表路径

### Requirement: Packs 列表路径不变

Packs 列表的公开页面路径 MUST 为 `/packs`。系统 MUST NOT 将该列表改到其它路径，包括 `/pack`、`/collections` 或其它前缀。系统 MUST NOT 用新路径替换该地址后再从 `/packs` 重定向。站内指向 Packs 列表的链接 MUST 使用 `/packs`。地址栏查询参数（例如 `tab`）不在本要求内，由其它能力规定。

#### Scenario: 打开 Packs 列表

- **WHEN** 用户打开 `/packs`
- **THEN** 该地址 MUST 仍然打开 Packs 列表，且 MUST NOT 被替换成另一种列表路径
