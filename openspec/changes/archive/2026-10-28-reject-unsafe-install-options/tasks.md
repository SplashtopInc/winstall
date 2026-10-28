## 1. 规范化

- [x] 1.1 在 `utils/installOptions.js` 增加共享判断：`override` 为 trim 后 1–512 字符且不含 shell 元字符或控制字符；`log` 与 `location` 为 1–260 字符、满足同一字符限制，并且是盘符或 UNC 绝对路径。括号保留
- [x] 1.2 `normalizeInstallOptions` 只保留通过判断的 `override`、`log`、`location`。不通过的字段不写入结果，其余开关保持原样

## 2. 导出命令

- [x] 2.1 `components/AppExport/ExportApps.js` 的 `buildFilterString` 在写入 `--override`、`--log`、`--location` 前调用同一判断。不通过则跳过该参数，仍使用现有双引号。Batch 与 PowerShell 继续共用这一段参数文本

## 3. 测试

- [x] 3.1 在 `test/installOptions.test.js` 覆盖：`x" & calc & echo "` 与 `$(calc)` 被丢掉且拼出的参数不含 `calc`；非路径或超长的 `log` / `location` 被丢掉；`/quiet` 与 `C:\Program Files (x86)\Apps` 被保留
- [x] 3.2 覆盖非法 `override` 不影响同一应用的 `--force`，以及 `installOptionsToDrawerConfig` 对非法 `override` 给出空字符串、对合法 `log` 原样返回
- [x] 3.3 用 `buildInstallerConfig` 确认非法 `override` 不进入 instant installer 的 `options`，合法 `location` 会进入
