# category-browse Specification

## Purpose

让用户从主导航 Apps 进入分类浏览页，按 API 欢迎度顺序翻看某一分类下的应用，且不替换现有 `/apps` 目录与搜索。

## Requirements

### Requirement: 主导航 Apps 打开分类浏览

系统 MUST 在主导航 Discover 之后放置文案为 Apps 的主链接。激活该链接 MUST 导航到 `/category`。当前路径为 `/category` 时，主导航该项 MUST 为选中态。MUST NOT 在搜索框后放置侧栏 Apps 控件。`/apps` 目录仍可通过搜索进入。

#### Scenario: 第二项 Apps 指向 /category
- **WHEN** 用户查看站点主导航
- **THEN** 第二项文案为 Apps，且目标为 `/category` 而非 `/apps`

#### Scenario: 搜索框后无 Apps 控件
- **WHEN** 用户查看站点主导航
- **THEN** 搜索框后 MUST NOT 展示导航到 `/apps` 的 Apps 控件

### Requirement: 分类页一次只展示一个分类

在 `/category` 上，系统 MUST 展示固定分类标签，以及仅当前分类的应用网格。标签 slug 与顺序 MUST 为：`browser`、`communication`、`productivity`、`documents`、`collaboration`、`cloud_storage`、`development`、`entertainment`、`utilities`、`security`、`game`、`photo`、`screenshots`、`runtimes`。MUST NOT 包含 `social_media`、`all` 或 `others`。URL 中无有效分类时，默认激活分类 MUST 为 `browser`。应用卡片 MUST 使用与 `/apps` 目录相同的列表卡片（既有 `SingleApp` 可选中）。页面 MUST NOT 展示分类标题、应用总数或页内搜索框。

#### Scenario: 默认分类为 browser
- **WHEN** 用户打开无分类查询的 `/category`
- **THEN** browser 标签为激活态，网格为该分类的应用

#### Scenario: 切换标签更换网格
- **WHEN** 用户激活 development 标签
- **THEN** 网格仅展示 `development` 的应用，且 Load more 从该分类第一页重新开始

### Requirement: 分类标签先收起再展开

系统 MUST 先展示前六个分类标签及 More。激活 More MUST 展开其余标签并允许换行。激活 Less MUST 收回到前六个加 More。若当前分类在收起后会隐藏，系统 MUST 保持展开，直到用户选中仍可见的分类；若用户激活 Less 且当前分类会被隐藏，系统 MUST 将激活分类改为 `browser`。

#### Scenario: More 展开其余分类
- **WHEN** 用户激活 More
- **THEN** 十四个分类标签均可见，并允许换行

### Requirement: 分类列表使用分类接口信封

对当前分类 slug，系统 MUST 请求 `GET /apps/categories/:id`，带 `offset` 与 `limit`，并 MUST 使用 `{ total, offset, limit, data }` 中的 `data` 渲染。MUST NOT 发送 `sort`。列表顺序 MUST 为接口返回顺序。`:id` MUST 为当前 slug（必要时 URL 编码）。MUST NOT 把响应当成裸数组。当 `total` 大于当前已展示条数时，MUST 展示 Load more。激活 Load more MUST 追加下一页且不得替换已展示卡片。更换分类 MUST 丢弃上一列表并加载第一页。`total` 为 0 且 `data` 为空时 MUST 展示空网格且 MUST NOT 展示 Load more。请求失败 MUST 展示错误态，且 MUST NOT 留下另一分类的过期列表。

#### Scenario: Load more 追加下一页
- **WHEN** 某分类应用数超过第一页，且用户激活 Load more
- **THEN** 下一 offset 的应用出现在已有卡片下方，已展示卡片仍在

#### Scenario: 空分类
- **WHEN** 当前 slug 的接口返回 `total` 为 0 且 `data` 为空
- **THEN** 网格为空且不展示 Load more
