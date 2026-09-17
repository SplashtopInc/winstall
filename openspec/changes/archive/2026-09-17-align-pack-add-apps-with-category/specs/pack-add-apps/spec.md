## Purpose

让 Pack 所有者在详情页通过 Add Apps 弹窗按分类浏览并加入应用，同时保留搜索作为覆盖分类网格的查找出口。

## ADDED Requirements

### Requirement: 弹窗默认按分类浏览

在 Pack 详情的 Add Apps 弹窗中，当搜索框没有已提交查询时，系统 MUST 在工具行右侧提供分类下拉（slug 与顺序为 `all`、`browser`、`development`、`documents`、`communication`、`utilities`、`security`、`productivity`、`cloud_storage`、`collaboration`、`entertainment`、`photo`、`game`、`screenshots`、`runtimes`），左侧为搜索框，并展示仅当前分类的应用网格。默认选中分类 MUST 为 `all`。`all` MUST 不做分类过滤。网格 MUST 为四列（窄视口自适应），每批 MUST 请求 `limit` 为 56。当 `total` 大于已展示条数时 MUST 展示 Load more；激活 Load more MUST 追加下一页且不得替换已展示卡片。更换分类 MUST 丢弃上一列表并从该分类第一页重新加载。系统 MUST NOT 在弹窗中展示分类标签条、Prev/Next 翻页按钮、左右键翻页提示或「第 x 页」计数条。关闭后再次打开 MUST 回到 `all` 且空搜索。

#### Scenario: 打开弹窗默认 all

- **WHEN** 用户打开 Add Apps 弹窗且搜索框为空
- **THEN** 分类下拉显示 All，网格为未按分类过滤的应用，且出现 Load more 当全量目录超过第一批

#### Scenario: 切换分类重置列表

- **WHEN** 用户在分类下拉中选择 development 且搜索框没有已提交查询
- **THEN** 网格仅展示 `development` 的应用，且 Load more 从该分类第一页重新开始

### Requirement: 搜索覆盖分类网格

弹窗 MUST 保留搜索框，并与分类下拉同一行（左搜索、右分类）。当存在已提交的关键词查询（含 `tags:`、`name:`、`desc:`）时，系统 MUST 用 `GET /apps/search` 的结果替换分类网格，MUST NOT 把当前分类作为搜索过滤条件，且分类下拉 MUST 显示 `All`（与全站搜索结果一致，不得继续显示被盖住的分类名）。当查询为 `publisher:` 前缀时，系统 MUST 用 `GET /publishers/:id` 的结果替换分类网格，下拉同样 MUST 显示 `All`。搜索与 publisher 列表 MUST 用 Load more 按信封 `offset`/`limit`/`total` 追加。更改查询 MUST 丢弃上一列表并从 offset 0 重新加载。分类下拉 MUST 仍可见；从下拉选择任一分类 MUST 清空搜索并加载该类。清空搜索框 MUST 回到清空前记住的选中分类。系统 MUST NOT 在搜索态恢复 Prev/Next 翻页。

#### Scenario: 关键词搜索盖过分类

- **WHEN** 用户在弹窗中提交不含 publisher 前缀的关键词搜索，且搜索前分类为 browser
- **THEN** 网格展示全站搜索命中而非 browser 分类应用，分类下拉显示 All，且可用 Load more 看完 `total`

#### Scenario: 点分类退出搜索

- **WHEN** 用户在搜索结果中从分类下拉选择 utilities
- **THEN** 搜索框被清空，网格为 utilities 分类应用，且 Load more 从该分类第一页开始

#### Scenario: 清空搜索回到原分类

- **WHEN** 用户在 browser 分类下发起搜索后清空搜索框
- **THEN** 网格回到 browser 分类浏览，分类下拉显示 Browsers
### Requirement: 加入选择卡对齐货架皮且不并入目录卡

弹窗应用网格 MUST 使用独立的加入选择卡，MUST NOT 把目录列表卡的全局勾选集用于加入 pack。卡片 MUST 展示与 compact 目录卡一致的身份区（图标、名称、发行商）、最多两行描述，以及只读终身 views、downloads、likes。点击未加入 pack 的卡片 MUST 在弹窗本地选择集中切换选中。已在当前 pack 中的应用 MUST 标明已加入且 MUST NOT 再被选中。底部选择条 MUST 仍将本地选中项一次性加入 pack。切分类或搜索 MUST NOT 丢弃尚未加入的本地选中项。

#### Scenario: 已加入不可再选

- **WHEN** 某应用已在当前 pack 中且出现在弹窗网格
- **THEN** 该卡标明已加入，激活它 MUST NOT 把它加入弹窗选择集

#### Scenario: 切分类保留未提交选择

- **WHEN** 用户选中若干尚未加入 pack 的应用后切换分类
- **THEN** 底部选择条仍显示这些选中项
