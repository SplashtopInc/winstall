## MODIFIED Requirements

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
- `https://winstall.app/compare-wingetly`
- `https://winstall.app/privacy`
- `https://winstall.app/sitemap.xml`

`/generate` 的说明 MUST 写明脚本来自当前浏览器里的选择，该页不是目录。Comparisons 相关说明 MUST 提及 Wingetly 与既有三家。文件 MUST NOT 为 sitemap 中的单个 App 或单个 Pack 各写一条链接。除 `/apps` 与 `/packs` 这两个列表入口外，文件 MUST NOT 包含指向某个 `/apps/:id` 或某个 `/packs/:id` 的链接。说明文字里的路径示例 MUST NOT 写成这种详情链接。

#### Scenario: 具体应用不进链接列表

- **WHEN** 检查 `/llms.txt` 里的链接
- **THEN** 不存在指向某一个 App 详情或某一个 Pack 详情的链接

#### Scenario: Wingetly 对照页在链接列表中

- **WHEN** 检查 `/llms.txt` 里的链接
- **THEN** 存在 `https://winstall.app/compare-wingetly` 且带一句英文说明
