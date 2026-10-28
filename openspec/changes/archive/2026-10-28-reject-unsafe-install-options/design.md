## Context

见 proposal.md 的 Why，以及本 change 的 `specs/install-export/spec.md`。`override`、`log`、`location` 在 `utils/installOptions.js` 的 `normalizeInstallOptions` 里只做 trim。`utils/getEffectiveConfig.js`、设置抽屉的读写、Pack 快照都调用这个函数。`components/AppExport/ExportApps.js` 的 `buildFilterString` 再把这三个值放进双引号，Batch 与 PowerShell 共用同一段参数文本。Instant installer 经 `getEffectiveConfig` 把同一份值写进 `options`。

## Goals / Non-Goals

**Goals:**

- 非法的 `override`、`log`、`location` 在规范化时丢掉，导出命令和 installer `options` 里不再出现。
- 导出拼接处再用同一套判断，避免调用方绕过规范化把原文字符串塞进命令。
- 合法的 `/quiet` 与 `C:\Program Files (x86)\...` 继续出现在命令和配置里。

**Non-Goals:**

- 不为 cmd 和 PowerShell 各写一套转义。非法值直接省略。
- 不改 Winget Import JSON、版本钉选、scope / silent / interactive / force。
- 不在设置抽屉里加错误提示。非法值保存或再次打开时为空。
- 不改 winstall-api，也不回写已经存进 Pack 的旧数据。

## Decisions

1. **在 `normalizeInstallOptions` 丢掉非法字符串，而不是转义后保留。**
   - `override`：trim 后长度 1–512，且不含 shell 元字符或控制字符。
   - `log`、`location`：trim 后长度 1–260，先满足同样的字符限制，再匹配 Windows 绝对路径（`C:\...` 或 `\\server\share\...`，分隔符允许 `\` 与 `/`）。
   - 元字符集合：`"`、`&`、`|`、`<`、`>`、`^`、`%`、`;`、反引号、`$`，以及换行和其他控制字符。括号保留。
   - **理由**：规格要求这些值不能从引号里逃出来。省略比分别给 Batch 和 PowerShell 做转义更不容易漏掉一种 shell。`$(calc)` 因 `$` 被丢掉；`C:\Program Files (x86)\Apps` 因括号被保留而仍可用。
   - **备选**：按 shell 转义后照常输出。不采用：Batch 与 PowerShell 规则不同，当前两条脚本共用一段文本。

2. **导出时复用同一判断，再拼进现有双引号。**
   - 把“这个值能否进入命令”放在 `utils/installOptions.js`，`ExportApps` 的 `buildFilterString` 在写入 `--override`、`--log`、`--location` 前调用它。不通过则跳过该参数。
   - `getEffectiveConfig` 已经调用规范化，installer 配置不用单独再写一遍。
   - **理由**：设置抽屉、Pack 快照和 installer 都从规范化受益。命令拼接是最后一处直接插值，需要自己的检查。
   - **备选**：只改 `ExportApps`。不采用：抽屉和 installer 仍会读到并提交原文字符串。

3. **设置抽屉不增加校验 UI。**
   - `drawerConfigToInstallOptions` 与 `installOptionsToDrawerConfig` 已经经过规范化。非法 `override` 保存后为空；合法 `log` 路径原样回到输入框。
   - **理由**：规格只要求再次打开时非法字段为空、合法字段仍在。

## Risks / Trade-offs

- [Risk] 含 `%`、`&` 或 `$` 的真实安装参数或路径（例如 `%TEMP%`）会被丢掉。→ Mitigation：这类字符正是命令注入点。用户需要写成展开后的路径，或去掉对应参数。
- [Risk] 只测规范化、导出仍手写插值，第二处检查会漏。→ Mitigation：`buildFilterString` 必须调用共享判断；测试覆盖 `x" & calc & echo "` 与 `$(calc)` 不会进入拼出来的参数。
- [Risk] 260 个字符截断少数超长路径。→ Mitigation：与规格一致；超长值省略，不截断后继续使用。

## Migration Plan

发布前端即可。已保存的非法值在下次读取时被忽略，不迁移数据库。回滚时恢复原来的 trim-only 规范化。

## Open Questions

无。
