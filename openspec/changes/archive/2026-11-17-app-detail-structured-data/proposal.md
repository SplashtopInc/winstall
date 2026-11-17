## Why

App 详情页目前只有标题、描述与 canonical，没有 schema.org 的 `SoftwareApplication` 结构化数据。爬虫与语言模型无法从 HTML 直接读出「这是 Windows 软件、包标识与版本是什么、发行方是谁」。本站已有详情字段与 `/eli5` 的 JSON-LD 先例，适合在已找到应用的详情页补上这份目录身份标记。

## What Changes

- 每个已找到的 App 详情页（`/apps/:id`）在文档头输出一份 `SoftwareApplication` 的 `application/ld+json`
- 新增独立组件 `<AppJsonLd app={app} />`，由页面在已找到应用时挂载；未找到与骨架回退不输出
- 构建逻辑放在纯函数中：固定输出 `name`、`url`、`operatingSystem`、`identifier`；有值才写描述、版本、发行方、主页、许可证、最低系统、分类、图标、修改时间
- 第一版不写 `offers`、`aggregateRating`、`review`、`downloadUrl`；`applicationCategory` 只写货架 slug 能一对一落到 Google 支持类型的项
- 不改文档标题、meta description、canonical 路径与可见 UI

## Capabilities

### New Capabilities

- `app-detail-structured-data`: 已找到的 App 详情页输出 `SoftwareApplication` JSON-LD，规定字段取舍、输出时机与组件边界

### Modified Capabilities

- （无）标题、描述与公开路径仍分别由 `app-detail-title`、`public-urls` 规定，本变更不改其需求

## Impact

- 受影响代码：`pages/apps/[id].js`；新增 `components/appJsonLd.js`、`utils/appJsonLd.js` 与对应 `node --test` 用例
- 不影响 winstall-api、安装导出、列表页、Pack 详情
- 不引入新依赖；不改变 `/apps/:id` 公开路径
