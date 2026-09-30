## Purpose

用运行时环境变量决定网站是否展示 App 与 Pack 的浏览、下载、点赞数字，默认关闭，打开后才按各表面既有规则显示。

## ADDED Requirements

### Requirement: 统计展示由运行时开关控制

系统 MUST 从运行时环境变量 `WINSTALL_SHOW_STATS` 读取统计展示开关。未设置、空白、`0` 或 `false`（忽略大小写）时开关 MUST 为关。`1` 或 `true`（忽略大小写）时开关 MUST 为开。其它值 MUST 视为关。浏览器 MUST 从文档 meta 读取该开关，MUST NOT 依赖构建期公开环境变量。开关关闭时，网站 MUST NOT 展示 App 或 Pack 的浏览、下载或点赞次数（含 `0`）。开关打开时，各表面 MUST 按该表面既有规则展示这些数字。本开关 MUST NOT 隐藏 Like 按钮，也 MUST NOT 改变点赞或取消点赞。

#### Scenario: 未配置时不展示计数

- **WHEN** `WINSTALL_SHOW_STATS` 未设置或为空
- **THEN** 统计展示开关 MUST 为关，且页面 MUST NOT 展示浏览、下载或点赞次数

#### Scenario: 显式关闭

- **WHEN** `WINSTALL_SHOW_STATS` 为 `0` 或 `false`
- **THEN** 统计展示开关 MUST 为关

#### Scenario: 显式打开

- **WHEN** `WINSTALL_SHOW_STATS` 为 `1` 或 `true`
- **THEN** 统计展示开关 MUST 为开，已有计数规则的表面 MUST 展示对应数字

#### Scenario: 浏览器不读构建期变量

- **WHEN** 页面在已设置 `WINSTALL_SHOW_STATS` 的运行中服务器上生成或再验证
- **THEN** 文档 meta MUST 反映该运行时值，浏览器 MUST 按该值决定是否展示计数
