## MODIFIED Requirements

### Requirement: 列表卡片为 Hub 轻卡

`/packs` 上的合集卡 MUST 随内容决定高度，MUST NOT 使用固定像素高度整卡撑开。卡片 MUST 在左上展示合集身份符号（pack/stack），右侧为名称（最多一行，溢出省略）与次行应用数量。若列表条目带有可用于展示的作者字段，次行 MUST 可附带作者；若无该字段，MUST NOT 为作者额外请求接口。描述 MUST 固定占两行高度（不足两行仍保留该高度，超出省略）；无描述时 MUST 仍保留描述占位高度。当列表条目带有 app 快照时，卡片 MUST 在描述与 footer 之间展示最多 6 个 app 图标预览；超出部分 MUST 用溢出计数标明。无 app 快照时 MUST NOT 保留空图标行。My Packs 的卡片 MUST 用文字徽章标明 private 或 public。Public Packs 的卡片 MUST NOT 展示可见性。Footer MUST 展示相对更新时间。当统计展示开关打开时，footer MUST 在同一行再展示终身 views、downloads、likes，数字格式遵循 `engagement-count-format`。开关关闭时，footer MUST NOT 展示这三项。系统 MUST NOT 使用 “Last updated” 加完整日历日期作为该行主文案。

#### Scenario: 名称单行省略

- **WHEN** 某个 pack 名称超过一行宽度
- **THEN** 名称 MUST 单行展示并以省略号截断，MUST NOT 换到第二行

#### Scenario: 无描述的卡片仍保留描述高度

- **WHEN** 某个 pack 没有描述
- **THEN** 卡片 MUST 仍保留两行描述占位高度，使图标行与 footer 与有描述的卡片对齐

#### Scenario: 有 app 时展示图标预览

- **WHEN** 用户在 `/packs` 查看一张含有多个 app 的合集卡
- **THEN** 卡片 MUST 展示一排 app 图标预览（最多 6 个），超出时 MUST 标明溢出数量

#### Scenario: My Packs 徽章标明可见性

- **WHEN** 用户在 My Packs 看到一个 private pack
- **THEN** 卡片以文字标明 private，而不是仅靠图标

#### Scenario: 开关关闭时 footer 不展示计数

- **WHEN** 统计展示开关关闭，且用户查看 `/packs` 上的合集卡
- **THEN** footer MUST 仍展示相对更新时间，且 MUST NOT 展示 views、downloads、likes
