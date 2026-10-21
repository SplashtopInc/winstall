## Why

搜索结果里 App 详情的标题现在是 `Install {应用名} with WinGet | winstall`。搜软件的人先打应用名，再带 `download`，WinGet 这个词把大多数人筛掉了。标题改成应用名在前、`Download` 在后，并以 ` | winstall` 结尾，和这类搜索的用词一致，也和页面上的 Download installer 主按钮一致。站点名留给浏览器标签。

## What Changes

- 已找到应用的详情页文档标题改为 `{应用名} Download | winstall`。站点名留在标题里，给浏览器标签和书签用；搜索结果仍可能自行拿掉这段后缀。
- 同一标题字符串继续交给现有 `MetaTags`，因此 `meta name="title"`、`og:title`、`twitter:title` 一起变成这个句子。
- 不改 meta description、未找到应用时的标题、页面 `h1`、分享文案，以及 Pack 详情和其它页面的标题。

## Capabilities

### New Capabilities

- `app-detail-title`：已找到应用的详情页文档标题使用 `{应用名} Download | winstall`。

### Modified Capabilities

- （无）详情计数、点赞、公开 URL 与安装导出的既有要求不变。

## Impact

- 前端：`pages/apps/[id].js` 里已找到应用时传给 `MetaTags` 的 `title`。
- API、数据与公开路径 `/apps/:id` 不变。
- 搜索引擎已收录的旧标题会在重新抓取后换成新标题，没有站内兼容层。
