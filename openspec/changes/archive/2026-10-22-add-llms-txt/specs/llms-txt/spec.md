## Purpose

在网站根提供一份给语言模型阅读的短导览，说明 winstall 是什么、公开页面路径如何组成，以及全量目录应去现有 sitemap 读取。

## ADDED Requirements

### Requirement: 网站根提供可匿名读取的导览

系统 MUST 在 `/llms.txt` 返回一份 Markdown 文本文档。未登录客户端 MUST 能读到正文。该地址 MUST NOT 重定向到其它路径，也 MUST NOT 要求会话、凭据或查询参数。

#### Scenario: 匿名读取导览

- **WHEN** 未登录的客户端请求 `/llms.txt`
- **THEN** 响应成功，正文是 Markdown，且不依赖会话

### Requirement: 导览用英文说明站点身份

正文 MUST 为英文。正文 MUST 说明 winstall 是基于 Windows Package Manager（winget）的免费搜索与批量安装脚本工具，安装命令由用户机器上的 winget 执行。正文 MUST 说明可以把已选应用生成 winget 脚本。正文 MUST NOT 把本站写成安装包或二进制文件的托管方。正文 MUST NOT 写入会随目录变化的应用总数或 Pack 总数。

#### Scenario: 读者得知安装不由本站分发

- **WHEN** 读取 `/llms.txt`
- **THEN** 正文说明可以复制 winget 安装命令或生成脚本，且本站不托管安装包

#### Scenario: 不写会过期的目录规模

- **WHEN** 读取 `/llms.txt`
- **THEN** 正文不出现应用总数或 Pack 总数

### Requirement: 写明公开路径模式并指向 sitemap

正文 MUST 说明 App 详情路径为 `/apps/:id`，Pack 详情路径为 `/packs/:id`，列表路径为 `/apps` 与 `/packs`。`:id` MUST 与 sitemap 中对应详情使用的公开标识一致。正文 MUST 说明 Pack 的 `:id` 不是 winget 包标识。文件中的站点链接 MUST 使用 `https://winstall.app` 绝对 URL。正文 MUST 链接 `https://winstall.app/sitemap.xml`，并说明全量公开 URL 以该 sitemap 索引及其子 sitemap 为准。

#### Scenario: 需要枚举全部应用或 Pack

- **WHEN** 读者需要全部 App 或 Pack 的地址
- **THEN** 导览指向 `https://winstall.app/sitemap.xml`，而不是在本文件中展开这些地址

### Requirement: 链接限于说明页与列表入口

文件 MUST 以下列绝对 URL 作为链接，且每条链接 MUST 带一句英文说明，描述打开后能得到什么：

- `https://winstall.app/`
- `https://winstall.app/about`
- `https://winstall.app/eli5`
- `https://winstall.app/apps`
- `https://winstall.app/express`
- `https://winstall.app/category`
- `https://winstall.app/packs`
- `https://winstall.app/generate`
- `https://winstall.app/compare`
- `https://winstall.app/compare-ninite`
- `https://winstall.app/compare-chocolatey`
- `https://winstall.app/compare-unigetui`
- `https://winstall.app/privacy`
- `https://winstall.app/sitemap.xml`

`/generate` 的说明 MUST 写明脚本来自当前浏览器里的选择，该页不是目录。文件 MUST NOT 为 sitemap 中的单个 App 或单个 Pack 各写一条链接。除 `/apps` 与 `/packs` 这两个列表入口外，文件 MUST NOT 包含指向某个 `/apps/:id` 或某个 `/packs/:id` 的链接。说明文字里的路径示例 MUST NOT 写成这种详情链接。

#### Scenario: 具体应用不进链接列表

- **WHEN** 检查 `/llms.txt` 里的链接
- **THEN** 不存在指向某一个 App 详情或某一个 Pack 详情的链接

### Requirement: 排除个人数据与接口

正文与链接 MUST NOT 包含 `/my`、`/my/likes`、`/api/`、`/users/`、认证相关地址、installer 回调，以及任何需要登录才能阅读的地址。正文 MUST NOT 包含密钥、会话或内部 API origin。链接 MUST NOT 带查询参数。

#### Scenario: 个人点赞页不出现

- **WHEN** 读取 `/llms.txt`
- **THEN** 正文不包含 `/my/likes`

### Requirement: 不发布目录拼接文件

系统 MUST NOT 提供把应用或 Pack 页面正文合并而成的 `/llms-full.txt`。

#### Scenario: 没有全量拼接文件

- **WHEN** 客户端请求 `/llms-full.txt`
- **THEN** 站点不返回目录拼接文档
