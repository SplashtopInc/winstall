## Context

动机见 `proposal.md`。现状：`pages/apps/[id].js` 在已找到应用时用 `MetaTags` 写标题、描述与 canonical；`slimAppForDetailPage` 已保留 name、描述、homepage、icon、latestVersion、license、minOS、publisher、categories、updatedAt 等字段。全站仅 `/eli5` 有 `application/ld+json`（`FAQPage`）先例。详情页无评价数据，目录也无法稳定区分免费与付费。公开路径固定为 `/apps/:id`（`public-urls`）；标题格式由 `app-detail-title` 规定。

## Goals / Non-Goals

**Goals:**

- 已找到的详情页输出一份可测的 `SoftwareApplication` JSON-LD
- 用独立组件挂载，页面调用为 `<AppJsonLd app={app} />`
- 字段构建与序列化可被 `node --test` 覆盖

**Non-Goals:**

- 不追求 Google Software App 富结果（不做虚构评分或统一 `offers.price: 0`）
- 不改 `MetaTags` 接口，不把 JSON-LD 塞进 `AppDetailView`
- 不改 Pack 详情、列表页、API 或可见 UI 文案
- 不新增 npm 依赖

## Decisions

### 1. 组件 + 纯函数两层

**选择：** `components/appJsonLd.js` 导出 `AppJsonLd`，内部调用 `utils/appJsonLd.js` 的 `buildAppJsonLd(app)`。组件负责：无有效对象则返回 `null`；有则用 `next/head` 写 `<script type="application/ld+json">`。页面仅在已找到分支渲染 `<AppJsonLd app={app} />`。

**理由：** 与 `gtmSnippet` 一致——文件名 `lowerCamelCase`，组件名 PascalCase。`MetaTags` 是全站文档头；`AppDetailView` 含用户选中版本，不宜成为 JSON-LD 数据源。构建放在 `utils`，才能用现有 `node --test`（组件文件含 JSX，测试不直接跑组件）。

**备选：** 内联在 `pages/apps/[id].js`；拒绝，难测且页面会变厚。塞进 `MetaTags`；拒绝，污染全站接口。

### 2. 目录身份优先，不做富结果必填项

**选择：** 固定写 `name`、`url`、`operatingSystem: "Windows"`、`identifier`。有值才写描述、版本、发行方、`sameAs`、`softwareRequirements`、`license`、`dateModified`、`image`。不写 `offers`、`aggregateRating`、`review`、`downloadUrl`。

**理由：** Google 富结果还要求 `offers.price` 与评价；本站无真实评价，统一标价 0 会误标商业软件。本变更目标是爬虫可读的目录身份，与 `/llms.txt`「不托管安装包」一致。

**备选：** 对 freeware / open source 写 `price: 0`；第一版拒绝，许可证字符串不可靠。

### 3. `applicationCategory` 严格映射

**选择：** 仅映射：`browser`→`BrowserApplication`，`development`→`DeveloperApplication`，`communication`→`CommunicationApplication`，`utilities`→`UtilitiesApplication`，`security`→`SecurityApplication`，`entertainment`→`EntertainmentApplication`，`game`→`GameApplication`。按 `detailShelfSlugs` / 货架顺序取第一个可映射项；对不上则省略。

**理由：** Google 推荐值是封闭列表；硬猜 `documents`、`runtimes` 等会标错类别。

### 4. URL、版本与图标边界

**选择：**

- `url`：用与 `MetaTags` 相同的站点 origin + `/apps/{_id}`（`getSiteOrigin` / `buildSiteUrl`）
- `softwareVersion`：只用目录 `latestVersion`，不用下拉选中版本
- `sameAs`：原始 `homepage`，不加 `?ref=winstall`
- `image`：若 `icon` 已是 `http(s)` 则直接用；否则用与列表页相同的图标基址拼绝对 URL；拼不出则省略
- 序列化时转义 `</script>`，避免描述截断脚本

**理由：** SSR/ISR HTML 里的标记必须稳定，不能随客户端选中版本变化；追踪参数不应进入厂商 `sameAs`。

### 5. 不抽进 `MetaTags`

**选择：** 详情页与 `MetaTags` 并列挂载 `AppJsonLd`。

**理由：** 标题规格继续只经 `MetaTags`；结构化数据失败或省略不影响标题与 canonical。

## Risks / Trade-offs

- **[Risk] 无评分/`offers`，Google 不会出软件富结果。** → Mitigation：有意为之；规格写明禁止虚构字段。
- **[Risk] 部分应用缺 homepage / icon / categories，JSON-LD 较瘦。** → Mitigation：核心四字段始终有；可选字段有值才写。
- **[Risk] 图标基址或 origin 在构建环境为空，导致缺 `url`/`image`。** → Mitigation：`url` 依赖既有站点 origin 配置（与 canonical 同源）；origin 不可用时组件返回 `null` 或不写不完整对象（实现时保证无 `name`+可解析 `url` 则不输出）。`image` 可单独省略。
- **[Risk] 描述含 `</script>` 破坏 HTML。** → Mitigation：序列化转义；用含恶意片段的样本测。

## Migration Plan

随网站发布即可；爬虫下次抓取后生效。回滚：去掉页面上的 `<AppJsonLd />` 并删除组件与 utils。无数据迁移。

## Open Questions

无。
