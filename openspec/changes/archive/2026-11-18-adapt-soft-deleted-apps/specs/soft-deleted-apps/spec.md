## Purpose

在 API 已对下架应用返回 `deletedAt` 的前提下，让详情、收藏与 Pack 详情用同一套「已下架」语义展示墓碑页与 Removed 标记，并与真正缺失目录文档的 Unavailable 区分。

## ADDED Requirements

### Requirement: Soft-deleted app detail shows a tombstone

当 `GET /apps/:id` 成功且响应 `deletedAt` 非空时，系统 MUST 在公开路径 `/apps/:id` 上渲染墓碑页，MUST NOT 渲染可安装详情，MUST NOT 改走 `App not found`。墓碑页 MUST 展示应用名称、图标（若有）、发行商（若有）、描述或短描述（若有），以及可见的 **Removed** 标记。墓碑页 MUST 标明该应用已从 winget 下架，并展示 `deletedAt` 对应的下架日期。墓碑页 MUST NOT 展示 winget 安装 / 升级命令框、版本选择、Download installer 或 Add to list。墓碑页 MAY 保留 Like。文档 MUST 带 `noindex`。仅当库中不存在该 `_id`（API 404 或等价未找到）时，系统 MUST 继续使用既有 `App not found` 页。

#### Scenario: Soft-deleted detail is a tombstone

- **WHEN** 用户打开 `/apps/:id`，且 API 返回该应用且 `deletedAt` 非空
- **THEN** 页面为墓碑页，含 **Removed** 与下架说明，且 MUST NOT 出现 winget 命令框、Download installer 或 Add to list

#### Scenario: Missing app still uses not-found

- **WHEN** 用户打开 `/apps/:id`，且 API 判定该应用不存在
- **THEN** 页面 MUST 仍为既有 `App not found`，MUST NOT 渲染墓碑页

### Requirement: Favorites apps mark soft-deleted cards

`/my/favorites` 的 Apps 标签 MUST 继续渲染 `GET /apps/liked` 返回的软删除应用（`deletedAt` 非空）。每张此类卡片 MUST 在应用名旁展示 **Removed**。整卡（或名称区域）MUST 仍可进入 `/apps/:id` 墓碑页。此类卡片 MUST NOT 提供加入全站安装选择的勾选。未下架卡片（`deletedAt` 为 `null` 或键缺失）MUST NOT 展示 **Removed**。

#### Scenario: Soft-deleted favorite shows Removed

- **WHEN** 已登录用户在 Apps 标签看到一条 `deletedAt` 非空的应用
- **THEN** 该卡含 **Removed**，可进入该应用详情，且 MUST NOT 提供勾选

#### Scenario: Active favorite has no Removed

- **WHEN** 已登录用户在 Apps 标签看到一条未下架应用
- **THEN** 该卡 MUST NOT 展示 **Removed**

### Requirement: Pack detail distinguishes Removed from Unavailable

`GET /packs/:id` 返回的 `apps` 中，目录仍有文档且 `deletedAt` 非空的元素 MUST 在 Pack 详情卡片上展示 **Removed**，MUST 仍可进入 `/apps/:id` 墓碑页，MUST 可保留描述等目录补齐字段，MUST NOT 使用 **Unavailable** 文案。`available` 为 `false`（目录无文档）的元素 MUST 继续使用既有 Unavailable 展示，MUST NOT 链到应用详情，MUST NOT 展示 **Removed**。Pack 安装入口与安装抽屉的应用集合 MUST 排除软删除与 Unavailable 应用；若排除后无可安装应用，安装入口 MUST 不可用。

#### Scenario: Soft-deleted pack app shows Removed and links

- **WHEN** Pack 详情某应用 `available` 为 true 且 `deletedAt` 非空
- **THEN** 该卡展示 **Removed**，可进入该应用详情，且 MUST NOT 进入 Pack 安装列表

#### Scenario: Missing catalog app stays Unavailable

- **WHEN** Pack 详情某应用 `available` 为 false
- **THEN** 该卡展示 Unavailable，MUST NOT 链到应用详情，且 MUST NOT 展示 **Removed**
