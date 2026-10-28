## Why

Pack 作者可以把任意字符串存进某个应用的 `override`、`log` 或 `location`。导出 Batch / PowerShell 时，这些值被放进双引号、不做转义，访客复制或下载后执行会在自己的 Windows 上跑到作者写入的命令。Instant installer 配置走同一份字符串。需要在读入和导出时丢掉不能安全放进命令行的值。

## What Changes

- `override`、`log`、`location` 在规范化时按允许字符和长度检查。含 shell 元字符、控制字符，或超出长度的值被丢掉，其余安装选项保留。
- `log` 与 `location` 还须像一条 Windows 路径。不像路径的值同样丢掉。
- Batch、PowerShell 和 instant installer 配置只使用规范化之后的值。被丢掉的字段不出现在命令或 `options` 里。
- 设置抽屉保存时走同一套规范化，因此界面写回的选项也不会带上这些字符串。已保存在 Pack 或本地选择里的非法值在读取时丢掉。
- Winget Import JSON、默认安装开关（scope / silent / interactive / force）和版本钉选规则不变。

## Capabilities

### New Capabilities

- （无）

### Modified Capabilities

- `install-export`：每个应用的 `override`、`log`、`location` 必须先通过安全校验才进入 Batch、PowerShell 和 instant installer。未通过的值被省略，不中断其余应用的导出。

## Impact

- 前端：`utils/installOptions.js` 的规范化；`components/AppExport/ExportApps.js` 在拼 Batch / PowerShell 前再拒绝同一类值。设置抽屉、Pack 读写和 instant installer 已调用规范化，不单独改界面。
- 已保存的非法 `override` / `log` / `location` 在导出和再次打开设置时消失。合法的安装参数、路径和其余开关保持原样。
- 不改 winstall-api，也不改公开 URL。外部 builder 收到的配置里不再带被丢掉的字段。
