## Why

站点已经用 `robots.txt` 放开抓取，并用 sitemap 列出全部公开 URL。代理若被指到 winstall，仍然缺少一份能一次读完的说明：这个站是什么、公开路径怎么拼、全量目录该去哪份文件。`llms.txt` 只补这张短导览。它不参与允不允许抓，也不代替 sitemap。

## What Changes

- 在网站根提供 `/llms.txt`：英文 Markdown，说明 winstall 是基于 winget 的搜索与批量安装脚本工具，并链接少量说明页与列表入口。
- 文件写明 App / Pack 的公开路径模式，并把全量枚举指到现有 sitemap。不逐条列出应用或 Pack。
- 不提供把目录正文拼成一份的 `llms-full.txt`。
- 不改 `robots.txt` 的抓取规则，不改 `/apps/:id`、`/packs/:id`、`/apps`、`/packs`。个人页、登录态和 API 不进入该文件。

## Capabilities

### New Capabilities

- `llms-txt`：网站根的策划导览。规定文件位置、读者、应包含的说明与路径模式、应排除的地址，以及它与 sitemap 的分工。

### Modified Capabilities

- （无）

## Impact

- 新增静态文件 `public/llms.txt`。不新增随目录数据再生的路由，也不读取 winstall-api。
- 说明页增删或改名时要同时改这份文件。应用或 Pack 数据变化不必改它。
- 公开页面路径、sitemap、`robots.txt` 的 Allow/Disallow 保持现状。
