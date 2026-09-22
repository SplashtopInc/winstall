# pack-list-browse Specification

## Purpose

让用户在 `/packs` 的 Public 列表用 Load more 连续浏览公开合集，并用 Hub 式轻卡扫描名称、规模、描述与基础 meta。

## Requirements

### Requirement: Public 列表用搜索与 Load more

Public Packs MUST 提供按名称或描述搜索的输入。查询字符串去掉首尾空白后长度小于 3 时，系统 MUST NOT 把该输入当作 API 的 `q` 发给 `GET /packs`，且 MUST 提示需要至少 3 个字符。达到 3 个字符时，系统 MUST 请求 `GET /packs`，带 `q`、`offset`、`limit`，并用 `{ total, offset, limit, data }` 渲染。生效中的搜索 MUST 留在页内状态，MUST NOT 写入地址栏的 `q`。系统 MUST 继续忽略或剥除地址栏中的 `q` 与 `page`，MUST NOT 把它们当作列表分页或搜索的来源。更换搜索 MUST 丢弃已展示列表并从 offset 0 重新加载。当 `total` 大于已展示条数时 MUST 展示 Load more；激活 Load more MUST 追加下一批且不得替换已展示卡片。系统 MUST NOT 在 Public Packs 展示 Prev/Next，MUST NOT 用左右方向键翻列表。焦点在搜索输入内时，方向键 MUST 只作用于输入。无命中时 MUST 提供清空搜索以回到未过滤公共列表的路径。系统 MUST NOT 在客户端重排 API 返回顺序。本要求 MUST NOT 改变默认 tab（无查询时仍为 My Packs），MUST NOT 为切换 My / Public 写入 URL。

#### Scenario: 短输入不发搜索

- **WHEN** 用户在公共搜索框输入少于 3 个非空白字符
- **THEN** 系统 MUST NOT 用该字符串作为 `GET /packs` 的 `q`，并 MUST 提示至少 3 个字符

#### Scenario: Load more 追加公共合集

- **WHEN** 公开合集总数超过第一批且用户激活 Load more
- **THEN** 下一批出现在已有卡片下方，已展示卡片仍在

#### Scenario: 空搜索可回到全部

- **WHEN** 公共搜索无命中且用户清空搜索
- **THEN** 网格回到未带 `q` 的公共列表

### Requirement: 列表卡片为 Hub 轻卡

`/packs` 上的合集卡 MUST 随内容决定高度，MUST NOT 使用固定像素高度整卡撑开。卡片 MUST 在左上展示合集身份符号（pack/stack），右侧为名称（最多一行，溢出省略）与次行应用数量。若列表条目带有可用于展示的作者字段，次行 MUST 可附带作者；若无该字段，MUST NOT 为作者额外请求接口。描述 MUST 固定占两行高度（不足两行仍保留该高度，超出省略）；无描述时 MUST 仍保留描述占位高度。当列表条目带有 app 快照时，卡片 MUST 在描述与 footer 之间展示最多 6 个 app 图标预览；超出部分 MUST 用溢出计数标明。无 app 快照时 MUST NOT 保留空图标行。My Packs 的卡片 MUST 用文字徽章标明 private 或 public。Public Packs 的卡片 MUST NOT 展示可见性。Footer MUST 在同一行展示相对更新时间以及终身 views、downloads、likes；数字格式遵循 `engagement-count-format`。系统 MUST NOT 使用 “Last updated” 加完整日历日期作为该行主文案。

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
