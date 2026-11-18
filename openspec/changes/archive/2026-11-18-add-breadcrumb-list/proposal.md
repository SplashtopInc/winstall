## Why

分类页、App 详情与 Pack 页目前没有描述站点层级的结构化数据。爬虫与语言模型只能从路径猜测「这一页在目录树的哪一层」，无法稳定读出「Apps → 货架 → 应用」或「Packs → 合集」。站内已有 `/eli5` 的 FAQPage 与 App 详情的 `SoftwareApplication` 先例，适合补上 `BreadcrumbList`，专门表达分类与页面层级，而不改公开 URL，也不加可见面包屑 UI。

## What Changes

- 在 `/category`、`/category/<slug>`、已找到且有货架的 `/apps/:id`、`/packs`、已拿到合集的 `/packs/:id` 输出一份 schema.org `BreadcrumbList` 的 `application/ld+json`
- App 详情多货架时只取货架顺序中的第一条；无货架则不输出面包屑
- Pack 详情仅在成功拿到合集后输出；加载中、找不到、加载失败不输出
- 不新增可见面包屑导航；不改公开路径、文档标题规则，也不改现有 `SoftwareApplication` JSON-LD

## Capabilities

### New Capabilities

- `breadcrumb-list`: 为分类、App 详情与 Pack 页面输出描述站点层级的 `BreadcrumbList` JSON-LD

### Modified Capabilities

- （无）本变更只新增结构化数据，不修改既有能力的需求条文

## Impact

- 触及页面：`pages/category/[[...slug]].js`、`pages/apps/[id].js`、`pages/packs/index.js`、`pages/packs/[id].js`
- 新增或扩展与 `appJsonLd` 同风格的组件与纯函数（lowerCamelCase），用 `node --test` 覆盖构建逻辑
- 复用 `CATEGORY_LABELS`、`detailShelfSlugs`、`buildSiteUrl`；不新增 npm 依赖
- 不改 winstall-api、sitemap、主导航或页面可见布局
