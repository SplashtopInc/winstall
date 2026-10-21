## 1. 已找到应用的文档标题

- [x] 1.1 在 `pages/apps/[id].js` 把已找到应用传给 `MetaTags` 的 `title` 改为 `` `${app.name} Download | winstall` ``。不改 `desc`、`path`，不改 `MetaTags` 组件，不新增标题函数
- [x] 1.2 确认未找到应用的文档标题仍是 `App not found | winstall`

## 2. 核对

- [x] 2.1 打开一个已找到应用的详情页，确认文档标题为 `{应用名} Download | winstall`，且 `meta name="title"`、`og:title`、`twitter:title` 为同一字符串；页面主标题仍只显示应用名；meta description 仍以现有 WinGet 导语开头
