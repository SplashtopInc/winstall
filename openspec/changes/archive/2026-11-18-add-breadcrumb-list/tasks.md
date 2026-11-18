## 1. 构建与序列化

- [x] 1.1 新增 `utils/breadcrumbJsonLd.js`：导出构建 `BreadcrumbList` 的纯函数（接受层级条目或页面专用入参），写出 `@context` / `@type` / `itemListElement`；`item` 用 `buildSiteUrl`；任一必要绝对 URL 不可用时返回 `null`；序列化时转义 `</script>`
- [x] 1.2 提供分类 / App 详情 / Pack 列表 / Pack 详情的专用构建入口（或等价参数）：Apps 级指向 `/category`；App 用 `detailShelfSlugs` 第一项；无货架的 App 与缺名的 Pack 返回 `null`
- [x] 1.3 新增 `test/breadcrumbJsonLd.test.js`，覆盖 All 两级、货架三级、App 四级、多货架只取第一条、无货架为 `null`、Pack 两级与三级、以及含 `<` 的名称序列化

## 2. 组件与页面挂载

- [x] 2.1 新增 `components/breadcrumbJsonLd.js`：导出 `BreadcrumbJsonLd`，调用构建函数；无对象返回 `null`；有对象则经 `next/head` 输出 `application/ld+json`
- [x] 2.2 在 `pages/category/[[...slug]].js` 按当前货架挂载面包屑（与 `MetaTags` 的 path / 标题同源）
- [x] 2.3 在 `pages/apps/[id].js` 已找到分支挂载面包屑（与 `AppJsonLd` 并列）；无货架时组件不输出
- [x] 2.4 在 `pages/packs/index.js` 挂载 Packs 两级面包屑
- [x] 2.5 在 `pages/packs/[id].js` 仅在已拿到合集的成功分支挂载；加载中 / 找不到 / 失败分支不挂载

## 3. 验证

- [x] 3.1 运行 `node --test test/breadcrumbJsonLd.test.js`（或仓库既有测试命令）确认通过
- [x] 3.2 确认未改公开路径、未新增可见面包屑 UI、未改动 `SoftwareApplication` 构建逻辑
