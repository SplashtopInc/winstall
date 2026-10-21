## Context

需求见同目录 `spec.md`。

`pages/apps/[id].js` 在应用已找到时把 `` `${app.name} Download | winstall` `` 传给 `components/MetaTags.js` 的 `title`。该组件用这一个字符串写 `<title>`、`meta name="title"`、`og:title` 和 `twitter:title`。未找到时另传 `App not found | winstall`。描述、路径和页面 `h1` 不走这个标题字符串。

## Goals / Non-Goals

**Goals:**

- 已找到应用的文档标题是 `{应用名} Download | winstall`，并经现有 `MetaTags` 写到同一组标题标签。

**Non-Goals:**

- 不拆出只给搜索引擎用的第二套标题。
- 不改描述、canonical、未找到标题、`h1`、分享文案、Pack 详情和其它页面。

## Decisions

### 1. 只改传入 `MetaTags` 的那一个 `title`

**选择：** 在 `pages/apps/[id].js` 把已找到应用的 `title` 写成 `` `${app.name} Download | winstall` ``。不给 `MetaTags` 增加单独的搜索标题参数。

**理由：** 搜索结果使用的是 `<title>`。`og:title` 与 `twitter:title` 和它共用一个字符串。同一字符串也是浏览器标签和书签的名称。搜索结果上方已有站点名，标签页没有，所以保留 ` | winstall`。搜索引擎若在结果里拿掉这段后缀，标签页仍带着站点名。

**备选：** 只改 `<title>`、留下 `og:title` 的旧句子。拒绝，因为要改 `MetaTags` 的接口，而这一处标题就是文档标题。

### 2. 不抽新的标题函数

**选择：** 模板留在页面里，不新增工具模块。

**理由：** 全站其它页面的标题也是直接写在各自的 `MetaTags` 上。这一处没有第二种拼法。

## Risks / Trade-offs

- **[Risk] 搜索引擎仍暂时展示旧标题，或在结果里拿掉 `| winstall`。** → Mitigation：没有站内重定向或兼容标题。重新抓取后文档标题是新句子。结果页去掉站点名后缀可以接受，标签页仍保留它。
- **[Risk] `Download` 让人以为是厂商原安装包。** → Mitigation：页面主按钮已是 Download installer。接受这个用词，不在标题里再解释 winget。

## Migration Plan

改标题字符串后随网站发布。回滚：把 `title` 改回 `Install ${app.name} with WinGet | winstall`。

## Open Questions

无。
