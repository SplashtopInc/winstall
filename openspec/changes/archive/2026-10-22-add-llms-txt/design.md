## Context

见 proposal.md 的 Why。现状：`public/robots.txt` 对所有 User-agent 放行，并写死 `Sitemap: https://winstall.app/sitemap.xml`。sitemap 索引下有静态页、全部 App、全部 Pack。`/my/likes` 带 `noindex`，且不在静态 sitemap 里。说明页（about、eli5、compare 系列、privacy）的正文在 HTML 里。本文件不解决 Pack 详情或冷缓存 App 详情的首屏 HTML。

## Goals / Non-Goals

**Goals:**

- 用一份静态 Markdown 告诉代理：站是什么、路径怎么拼、全量地址去哪份 sitemap。
- 把写入范围收成可检查的链接表和排除表。

**Non-Goals:**

- 不生成 `llms-full.txt`，不随目录数据再生。
- 不改 `robots.txt` 的 Allow/Disallow，不在其中声明本文件。代理按约定直接请求 `/llms.txt`。
- 不改公开页面路径，不改 sitemap 的 URL 集合。
- 不在导览里解释页面是服务端渲染还是浏览器拉数据。

## Decisions

### 静态文件，生产 origin 写死

文件放在 `public/llms.txt`。Next 会把它以文本形式放到 `/llms.txt`。正文是策划文案，不读 winstall-api，也不跟请求主机走。

站点链接一律用 `https://winstall.app`，与 `robots.txt` 里的 Sitemap 行同一 origin。若改成 sitemap 那种按请求主机拼接，预览和本地会把错误 origin 写进给模型的文件。

曾考虑用页面路由设置 `text/markdown`。代理读的是正文，静态文件的默认文本类型够用，不为响应头加一条动态路由。

### 写入原则

读者是被指到本站的代理，不是搜索引擎的发现清单。文件要能一次读完。目录枚举留在 sitemap。

1. 结构按常见 `llms.txt` 约定：一级标题是站名，紧接着一段 blockquote 用一两句说明站点，然后是短正文，再按二级标题分组。组内链接写成 `- [标题](绝对 URL): 一句话`。这一句话只写打开后能得到什么，不写口号。
2. 事实只重复公开页面已经成立的说法。About 把本站写成基于 winget 的搜索；ELI5 用 `VideoLAN.VLC` 说明包标识形如 `Publisher.AppName`。可以沿用这个例子，但只放在说明文字里，不做成详情链接。
3. 不抄对比页上的「12,000+」或任何应用总数、Pack 总数。数字会和目录脱节。规模交给 `/apps` 和 sitemap。
4. 路径用文字写清，不把每个 id 做成链接。App 的 `:id` 与 apps sitemap 相同，是 winget 包标识。Pack 的 `:id` 是 Pack 自己的公开标识，不是包标识。
5. 全量枚举只指向 `https://winstall.app/sitemap.xml`。可以在同一句话里说明索引下有 apps 与 packs 两份子 sitemap，不要写出那两份的地址，更不要抄它们的 URL 列表。
6. 英文。公开页面是英文，这份文件的读者也按英文导览来读。
7. 不写密钥、会话、内部 API origin、查询参数。不写 `/my`、`/my/likes`、`/api/`、`/users/`、认证和 installer 回调。
8. 不写实现限制。不要说 Pack 详情在浏览器里拉数据，也不要说 App 详情第一次是骨架。
9. 目录里的应用或 Pack 增减，不改这个文件。说明页增删、改名，或上面这些事实变了，才改。

### 建议的章节和句子

实现时按这个提纲写。句子可以收紧，但不要改链接集合，也不要加具体详情链接。

```markdown
# winstall

> winstall is a free search and script generator for Microsoft's Windows Package Manager (winget). It helps you find a package and copy a winget install command. It does not host or distribute installer binaries.

Pick apps in the browser, then generate a winget script from that selection. An app page is `/apps/` plus the winget package id (Publisher.AppName, for example VideoLAN.VLC). A pack page is `/packs/` plus that pack's own id, which is not a package id. To list every public app and pack URL, read the sitemap index below. This file does not enumerate them.

## Start here

- [Home](https://winstall.app/): Browse the winget repository and start a bulk install.
- [About](https://winstall.app/about): What winstall is, who maintains it, and how package data stays tied to winget.
- [Winget, explained](https://winstall.app/eli5): Plain-language answers about winget, package ids, and safety.

## Find apps

- [Apps](https://winstall.app/apps): Search and browse the catalog. Each result opens an app page at `/apps/` plus the package id.
- [Express](https://winstall.app/express): Pick apps from curated categories for a script.
- [Categories](https://winstall.app/category): Browse apps by category.

## Packs

- [Packs](https://winstall.app/packs): Browse public collections of apps. A pack page is `/packs/` plus that pack's id.

## Script

- [Generate](https://winstall.app/generate): Turn the apps selected in this browser into a winget script. The selection is not listed here, and this page is not the catalog.

## Comparisons

- [Comparisons](https://winstall.app/compare): How winstall differs from Ninite, UniGetUI, and Chocolatey.
- [winstall vs Ninite](https://winstall.app/compare-ninite): Comparison with Ninite.
- [winstall vs Chocolatey](https://winstall.app/compare-chocolatey): Comparison with Chocolatey.
- [winstall vs UniGetUI](https://winstall.app/compare-unigetui): Comparison with UniGetUI.

## Catalog index

- [Sitemap](https://winstall.app/sitemap.xml): Every public app and pack URL, split across the child sitemaps. Use this to enumerate; this file does not.

## Optional

- [Privacy](https://winstall.app/privacy): What the site stores for packs and analytics.
```

`/generate` 留在文件里，是因为生成脚本是产品动作，代理需要知道入口。说明必须写清选择在浏览器里，避免把它当成又一份目录。

## Risks / Trade-offs

- [说明页改了文案，导览仍是旧句子] → 不写数量；改名或增删说明页时同时改 `public/llms.txt`。对比页上的规模数字故意不抄。
- [以后有人把它做成目录导出] → 规格禁止具体 `/apps/:id` 与 `/packs/:id` 链接，也禁止 `/llms-full.txt`。测试锁住链接表。
- [生产域名若变更，文件和 robots.txt 会一起过期] → 与现有 Sitemap 行使用同一写死 origin。本变更不引入第二套域名。
- [代理未必请求这个文件] → 接受。抓取仍然靠 robots.txt、sitemap 和页面 HTML。这份文件只服务主动来读 `/llms.txt` 的代理。

## Migration Plan

增加 `public/llms.txt` 即可。回滚时删掉该文件。没有数据迁移，也不改抓取规则。

## Open Questions

无。链接表、origin 和「不枚举目录」已经定死，不再留到实现时选择。
