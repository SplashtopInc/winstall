## Context

动机见 `proposal.md`。需求见 `specs/breadcrumb-list/spec.md`。

现状：App 详情已有 `components/appJsonLd.js` + `utils/appJsonLd.js` 输出 `SoftwareApplication`；`/eli5` 另有 FAQPage。分类页、Pack 列表与 Pack 详情尚无 JSON-LD。导航上 Apps 指向 `/category`，Packs 指向 `/packs`；应用详情公开路径固定为 `/apps/:id`（`public-urls`）。货架展示名与顺序在 `utils/categoryShelfPath.js`（`CATEGORY_LABELS`、`detailShelfSlugs`、`SHELF_SLUGS`）。Pack 详情为客户端取数后再渲染标题与主体（`pages/packs/[id].js`），首屏 HTML 尚无合集名。

## Goals / Non-Goals

**Goals:**

- 用可测的纯函数构建 `BreadcrumbList`，再用 lowerCamelCase 组件经 `next/head` 输出 `application/ld+json`
- 分类、App 详情（有货架）、Pack 列表、Pack 详情（已拿到合集）挂载同一套形状
- App 多货架只取 `detailShelfSlugs` 的第一项

**Non-Goals:**

- 不做可见面包屑导航
- 不改公开 URL、sitemap、主导航、文档标题规则
- 不改 `SoftwareApplication` 字段，不把面包屑并进 `@graph`
- 不把 Pack 详情改为服务端渲染；不新增 npm 依赖
- 不覆盖 `/apps` 搜索目录、Express、Compare、Favorites 等页

## Decisions

### 1. 独立能力，复用 App JSON-LD 分层

**选择：** 新增 `utils/breadcrumbJsonLd.js`（构建与序列化）与 `components/breadcrumbJsonLd.js`（`BreadcrumbJsonLd`，经 `next/head` 写脚本）。页面传入已经算好的 `items`（或等价的小型 props），组件在无有效列表时返回 `null`。序列化转义 `</script>`，与 `serializeAppJsonLd` 同策略（可抽共享转义，也可各写一份短函数）。

**理由：** 与 `appJsonLd` 一致——文件名 lowerCamelCase，组件名 PascalCase；纯函数可用 `node --test`。不塞进 `MetaTags`，避免全站接口膨胀。

**备选：** 扩展 `AppJsonLd` 顺带写面包屑——拒绝，Pack/分类不是 SoftwareApplication。内联各页面——拒绝，难测且重复。

### 2. 浏览树而非地址树

**选择：** Apps 这一级的 `item` 一律为 `/category`（展示名 `Apps`），货架为 `/category/<slug>`。App 详情末级才是 `/apps/:id`。Packs 这一级为 `/packs`，合集为 `/packs/:id`。根级 `name` 为 `winstall`，`item` 为 `/`。

**理由：** 主导航与分类浏览已经把「找应用」教成 `/category` 树；用 `/apps` 当中间级会丢掉分类，也和主导航 Apps 目标不一致。

**备选：** `winstall → Apps(/apps) → App`——拒绝，分类进不去。发行方或 Express 分组进链——拒绝，不是这 14 个货架。

### 3. App 多货架只取第一条

**选择：** `const slug = detailShelfSlugs(app.categories)[0]`；有则四级链，无则不输出。不输出多条 `BreadcrumbList`。

**理由：** 产品已拍板「仅放第一条」。货架顺序与详情页 Browse 链接、`applicationCategory` 取序同源，但面包屑用全部 14 个货架的展示名，不复用仅 7 项的 schema.org `applicationCategory` 映射。

**备选：** 每个货架一条——已否决。

### 4. Pack 与分类的挂载时机

**选择：**

- 分类页：与当前 `activeSlug` / `categoryDocumentTitle` 同源，随货架路径输出
- Pack 列表：页面稳态即可输出两级链
- Pack 详情：仅在 `pack` 已成功设置且正在渲染详情主体时输出；`loading` / `notFound` / `error` 分支不挂载
- App 详情：与 `AppJsonLd` 相同，仅已找到分支；另加「有货架」条件

**理由：** Pack 详情本就客户端取数；面包屑与标题、`h1` 同一轮出现，避免空名或错误名。不为私人合集单独关面包屑：能打开页面即已有合集名。

**备选：** 仅 public 才写——拒绝，额外可见性分叉无 SEO 收益，且私人页本就不在 sitemap。

### 5. 标签与 URL 边界

**选择：** `name` 用短标签（`winstall` / `Apps` / `CATEGORY_LABELS[slug]` / `app.name` / `Packs` / `pack.name`）。`item` 用 `buildSiteUrl` 得到的绝对地址；任一必要 `item` 无法得到绝对 http(s) URL 时整份不输出。不把文档标题整串拷进 `name`。

**理由：** 与 Google BreadcrumbList 常见形态一致；标题规格继续只经 `MetaTags`。

## Risks / Trade-offs

- **[Risk] App 只留第一条货架，其它货架对爬虫不可见。** → Mitigation：有意取舍；详情页仍保留全部 Browse 链接与 `SoftwareApplication.applicationCategory`（若可映射）。
- **[Risk] Pack 详情首屏 HTML 无面包屑，依赖客户端水合后插入。** → Mitigation：与现有标题行为一致；本变更不强制 SSR Pack。
- **[Risk] 分类页 shallow 切换货架后 JSON-LD 需跟着变。** → Mitigation：组件随 `activeSlug` props 重渲染；与 `MetaTags` 标题切换同一数据源。
- **[Risk] 描述或合集名含 `</script>`。** → Mitigation：序列化转义 `<`。

## Migration Plan

随网站发布即可；爬虫下次抓取后生效。回滚：去掉各页 `<BreadcrumbJsonLd />` 并删除组件与 utils。无数据迁移。

## Open Questions

无。
