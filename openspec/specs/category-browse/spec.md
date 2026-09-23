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

在 `/category` 上，系统 MUST 展示固定分类标签（文案左侧为对应 Feather 图标），以及当前分类的应用网格。标签 slug 与顺序 MUST 为：`all`、`browser`、`development`、`documents`、`communication`、`utilities`、`security`、`productivity`、`cloud_storage`、`collaboration`、`entertainment`、`photo`、`game`、`screenshots`、`runtimes`。MUST NOT 包含 `social_media` 或 `others`。URL 中无有效分类时，默认激活分类 MUST 为 `all`。`all` MUST 不做分类过滤，展示全量目录。应用卡片 MUST 使用与 `/apps` 目录相同的列表卡片（既有 `SingleApp` 可选中）。网格中的应用卡片 MUST 只来自当前分类（`all` 为未过滤目录）。页面 MUST NOT 展示分类标题、应用总数或页内搜索框。

#### Scenario: 默认分类为 all
- **WHEN** 用户打开无分类查询的 `/category`
- **THEN** all 标签为激活态，网格中的应用卡片为未按分类过滤的应用

#### Scenario: 切换标签更换网格
- **WHEN** 用户激活 development 标签
- **THEN** 网格中的应用卡片仅为 `development` 的应用，且 Load more 从该分类第一页重新开始

### Requirement: 分类标签先收起再展开

系统 MUST 在收起态按一行能放下的数量展示分类标签；一行放不下时 MUST 在该行末尾展示 More。激活 More MUST 展开其余标签并允许换行。激活 Less MUST 收回到单行加 More。若全部标签能在一行放下，MUST NOT 展示 More。若当前分类在收起后会隐藏，系统 MUST 保持展开，直到用户选中仍可见的分类；若用户激活 Less 且当前分类会被隐藏，系统 MUST 将激活分类改为 `all`。

#### Scenario: More 展开其余分类
- **WHEN** 用户激活 More
- **THEN** 十五个分类标签均可见，并允许换行

### Requirement: 分类列表使用分类接口信封

当当前 slug 为 `all` 时，系统 MUST 请求 `GET /apps`，带 `offset` 与 `limit`，MUST NOT 发送分类过滤，MUST NOT 发送 `sort`。当当前 slug 为其余分类时，系统 MUST 请求 `GET /apps/categories/:id`，带 `offset` 与 `limit`，MUST NOT 发送 `sort`。系统 MUST 使用 `{ total, offset, limit, data }` 中的 `data` 渲染。列表顺序 MUST 为接口返回顺序。`:id` MUST 为当前 slug（必要时 URL 编码）。MUST NOT 把响应当成裸数组。当 `total` 大于当前已展示条数时，MUST 展示 Load more。激活 Load more MUST 追加下一页且不得替换已展示卡片。更换分类 MUST 丢弃上一列表并加载第一页。`total` 为 0 且 `data` 为空时 MUST 展示空网格且 MUST NOT 展示 Load more。请求失败 MUST 展示错误态，且 MUST NOT 留下另一分类的过期列表。

#### Scenario: Load more 追加下一页
- **WHEN** 某分类应用数超过第一页，且用户激活 Load more
- **THEN** 下一 offset 的应用出现在已有卡片下方，已展示卡片仍在

#### Scenario: All 使用全量目录
- **WHEN** 用户激活 all 标签
- **THEN** 系统 MUST 请求 `GET /apps` 且 MUST NOT 请求 `GET /apps/categories/all`

#### Scenario: 空分类
- **WHEN** 当前 slug 的接口返回 `total` 为 0 且 `data` 为空
- **THEN** 网格为空且不展示 Load more

### Requirement: 首页展示五个常用分类入口

首页 MUST 在轮播与 Trending Apps 之间展示标题为 Top Categories 的五个固定分类卡片，slug 与顺序 MUST 为：`browser`、`development`、`documents`、`communication`、`utilities`。展示名 MUST 与分类页 `CATEGORY_LABELS` 一致。MUST NOT 包含 `all`。MUST NOT 展示该板块副标题。激活某一入口 MUST 导航到 `/category?category=<slug>`，且分类页 MUST 激活对应标签。MUST NOT 为该板块额外请求分类发现接口。

#### Scenario: 首页五个入口
- **WHEN** 用户查看首页
- **THEN** 轮播与 Trending Apps 之间可见标题 Top Categories，以及 Browsers、Developer Tools、Office、Communication、Utilities 五张卡片，且无该板块副标题

#### Scenario: 点击入口选中分类
- **WHEN** 用户激活首页 Developer Tools 入口
- **THEN** 系统导航到 `/category?category=development`，且 development 标签为激活态

### Requirement: 分类货架按目录节奏插入广告

当 `/category` 正在展示应用网格，且能选出一条启用广告时，系统 MUST 在已展示应用列表中每个满足 `index % 15 === 0` 的应用卡片之后插入一张广告。`index` MUST 是该应用在当前已展示列表中的下标（从 0 起），MUST NOT 把广告格算进下标，MUST NOT 按每一批 Load more 从 0 重计。广告 MUST 只占网格的一格，MUST NOT 横跨整行。一批 56 个应用且能选出启用广告时，网格 MUST 有 4 张广告、共 60 格。广告 MUST 使用与 `/apps` 目录列表相同的启用广告池，同一次浏览会话 MUST 展示同一条创意，活动链接的 `utm_content` MUST 为 `apps-list-a`。尚不能选出启用广告时，系统 MUST NOT 为广告保留空格。骨架、空列表与错误态 MUST NOT 插入广告。更换分类后列表替换，下标 MUST 按新列表重新计算。

#### Scenario: 满批 56 个应用插入 4 张广告

- **WHEN** 当前分类已展示 56 个应用，且存在启用广告
- **THEN** 广告出现在第 1、16、31、46 个应用卡片之后，网格共 60 格，且每张广告只占一列

#### Scenario: Load more 按下标续插

- **WHEN** 用户激活 Load more 且下一批应用追加到已展示列表之后
- **THEN** 已展示应用与其广告仍在，新广告只出现在追加后仍满足 `index % 15 === 0` 的应用之后

#### Scenario: 没有启用广告时不占格

- **WHEN** 分类网格已展示应用，且没有可选的启用广告
- **THEN** 网格只有应用卡片，没有空白广告格

#### Scenario: 换分类后节奏重算

- **WHEN** 用户从已展示广告的分类切换到另一个分类，且新列表能选出启用广告
- **THEN** 新网格的第一张广告跟在该列表第 1 个应用之后
