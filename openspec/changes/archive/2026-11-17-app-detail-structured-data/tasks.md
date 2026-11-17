## 1. 构建函数与单测

- [x] 1.1 新增 `utils/appJsonLd.js`：实现 `buildAppJsonLd(app)`，无有效 `name` 或无法得到详情 canonical `url` 时返回 `null`；否则返回含 `@context`、`@type`、`name`、`url`、`operatingSystem`、`identifier` 的对象
- [x] 1.2 在同一模块实现有值才写入的可选字段（`description`、`softwareVersion`、`author`/`publisher`、`sameAs`、`softwareRequirements`、`license`、`dateModified`、`image`）以及货架→`applicationCategory` 严格映射；永不写入 `offers`、`aggregateRating`、`review`、`downloadUrl`
- [x] 1.3 新增 `test/appJsonLd.test.js`：覆盖核心字段、可选字段省略、分类映射与省略、禁止字段不出现、`</script>` 安全序列化（若序列化辅助函数与构建同文件则一并测）

## 2. 组件与页面挂载

- [x] 2.1 新增 `components/appJsonLd.js`：导出 `AppJsonLd`，调用 `buildAppJsonLd`；无对象返回 `null`；有对象则经 `next/head` 输出 `application/ld+json`（序列化时转义 `</script>`）
- [x] 2.2 在 `pages/apps/[id].js` 的已找到应用分支挂载 `<AppJsonLd app={app} />`；未找到与骨架回退分支不挂载

## 3. 验证

- [x] 3.1 运行相关 `node --test`（至少 `test/appJsonLd.test.js`）并确认通过
- [x] 3.2 本地打开一个已找到详情页与一个未找到详情页，确认仅前者 HTML 含 `SoftwareApplication`，且标题仍为 `{名称} Download | winstall`
