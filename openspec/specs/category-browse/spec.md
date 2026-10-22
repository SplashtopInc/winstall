# category-browse Specification

## Purpose

让用户从主导航 Apps 进入分类浏览页，按 API 欢迎度顺序翻看某一分类下的应用，且不替换现有 `/apps` 目录与搜索。

## Requirements

### Requirement: 主导航 Apps 打开分类浏览

系统 MUST 在主导航 Discover 之后放置文案为 Apps 的主链接。激活该链接 MUST 导航到 `/category`。当前路径为 `/category`，或为 `/category/` 加上一个货架 slug 时，主导航该项 MUST 为选中态。货架 slug MUST 为：`browser`、`development`、`documents`、`communication`、`utilities`、`security`、`productivity`、`cloud_storage`、`collaboration`、`entertainment`、`photo`、`game`、`screenshots`、`runtimes`。MUST NOT 在搜索框后放置侧栏 Apps 控件。`/apps` 目录仍可通过搜索进入。

#### Scenario: 第二项 Apps 指向 /category
- **WHEN** 用户查看站点主导航
- **THEN** 第二项文案为 Apps，且目标为 `/category` 而非 `/apps`

#### Scenario: 搜索框后无 Apps 控件
- **WHEN** 用户查看站点主导航
- **THEN** 搜索框后 MUST NOT 展示导航到 `/apps` 的 Apps 控件

#### Scenario: 货架路径上 Apps 为选中态
- **WHEN** 用户位于 `/category/browser`
- **THEN** 主导航 Apps MUST 为选中态

### Requirement: 分类页一次只展示一个分类

在 `/category` 与 `/category/<slug>` 上，系统 MUST 展示固定分类标签（文案左侧为对应 Feather 图标），以及当前分类的应用网格。标签 slug 与顺序 MUST 为：`all`、`browser`、`development`、`documents`、`communication`、`utilities`、`security`、`productivity`、`cloud_storage`、`collaboration`、`entertainment`、`photo`、`game`、`screenshots`、`runtimes`。MUST NOT 包含 `social_media` 或 `others`。路径中没有货架 slug，或 slug 不是上述 14 个货架之一时，默认激活分类 MUST 为 `all`，地址 MUST 为 `/category`。`all` MUST 不做分类过滤，展示全量目录。应用卡片 MUST 使用与 `/apps` 目录相同的列表卡片（既有 `SingleApp` 可选中）。网格中的应用卡片 MUST 只来自当前分类（`all` 为未过滤目录）。页面 MUST NOT 展示分类标题、应用总数或页内搜索框。

#### Scenario: 默认分类为 all
- **WHEN** 用户打开 `/category`
- **THEN** all 标签为激活态，网格中的应用卡片为未按分类过滤的应用

#### Scenario: 切换标签更换网格
- **WHEN** 用户激活 development 标签
- **THEN** 地址为 `/category/development`，网格中的应用卡片仅为 `development` 的应用，且 Load more 从该分类第一页重新开始

### Requirement: 分类标签先收起再展开

系统 MUST 在收起态按一行能放下的数量展示分类标签；一行放不下时 MUST 在该行末尾展示 More。激活 More MUST 展开其余标签并允许换行。激活 Less MUST 收回到单行加 More。若全部标签能在一行放下，MUST NOT 展示 More。若当前分类在收起后会隐藏，系统 MUST 保持展开，直到用户选中仍可见的分类；若用户激活 Less 且当前分类会被隐藏，系统 MUST 将激活分类改为 `all`。

#### Scenario: More 展开其余分类
- **WHEN** 用户激活 More
- **THEN** 十五个分类标签均可见，并允许换行

### Requirement: 分类列表使用分类接口信封

当当前 slug 为 `all` 时，系统 MUST 请求 `GET /apps`，带 `offset` 与 `limit`，MUST NOT 发送分类过滤，MUST NOT 发送 `sort`。当当前 slug 为其余分类时，系统 MUST 请求 `GET /apps/categories/:id`，带 `offset` 与 `limit`，MUST NOT 发送 `sort`。首屏 `limit` MUST 为 59，Load more 的 `limit` MUST 为 60。系统 MUST 使用 `{ total, offset, limit, data }` 中的 `data` 渲染。列表顺序 MUST 为接口返回顺序。`:id` MUST 为当前 slug（必要时 URL 编码）。MUST NOT 把响应当成裸数组。当 `total` 大于当前已展示条数时，MUST 展示 Load more。激活 Load more MUST 追加下一页且不得替换已展示卡片。更换分类 MUST 丢弃上一列表并加载第一页。`total` 为 0 且 `data` 为空时 MUST 展示空网格且 MUST NOT 展示 Load more。请求失败 MUST 展示错误态，且 MUST NOT 留下另一分类的过期列表。

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

首页 MUST 在轮播与 Trending Apps 之间展示标题为 Top Categories 的五个固定分类卡片，slug 与顺序 MUST 为：`browser`、`development`、`documents`、`communication`、`utilities`。展示名 MUST 与分类页 `CATEGORY_LABELS` 一致。MUST NOT 包含 `all`。MUST NOT 展示该板块副标题。激活某一入口 MUST 导航到 `/category/<slug>`，且分类页 MUST 激活对应标签。MUST NOT 为该板块额外请求分类发现接口。

#### Scenario: 首页五个入口
- **WHEN** 用户查看首页
- **THEN** 轮播与 Trending Apps 之间可见标题 Top Categories，以及 Browsers、Developer Tools、Office、Communication、Utilities 五张卡片，且无该板块副标题

#### Scenario: 点击入口选中分类
- **WHEN** 用户激活首页 Developer Tools 入口
- **THEN** 系统导航到 `/category/development`，且 development 标签为激活态

### Requirement: 分类货架只在第一个应用后展示一条广告

当分类浏览页（`/category` 或 `/category/<货架 slug>`）正在展示应用网格，且能选出一条启用广告时，系统 MUST 在当前已展示列表的第 1 个应用卡片之后插入恰好一张广告。该位置对应应用下标 `index === 0`（从 0 起）。系统 MUST NOT 把广告格算进下标，MUST NOT 在其它下标再插入广告。Load more 追加应用时 MUST NOT 再插入广告。广告 MUST 只占网格的一格，MUST NOT 横跨整行。货架广告卡片的内边距 MUST 与同网格紧凑应用卡片一致（16px；视口不超过 690px 时为 10px）。广告 MUST 使用与 `/apps` 目录列表相同的启用广告池与同一插入位置，同一次浏览会话 MUST 展示同一条创意，活动链接的 `utm_content` MUST 为 `apps-list-a`。尚不能选出启用广告时，系统 MUST NOT 为广告保留空格。骨架、空列表与错误态 MUST NOT 插入广告。更换分类后列表替换，广告 MUST 只跟在新列表的第 1 个应用之后。

#### Scenario: 第一个应用后只有一张广告

- **WHEN** 当前分类已展示应用，且存在启用广告
- **THEN** 广告只出现在第 1 个应用卡片之后，且只占一列

#### Scenario: Load more 不再加广告

- **WHEN** 用户激活 Load more 且下一批应用追加到已展示列表之后
- **THEN** 第 1 个应用之后的那一张广告仍在，追加的应用之后不再出现新广告

#### Scenario: 没有启用广告时不占格

- **WHEN** 分类网格已展示应用，且没有可选的启用广告
- **THEN** 网格只有应用卡片，没有空白广告格

#### Scenario: 换分类后仍只跟在第一个应用后

- **WHEN** 用户从已展示广告的分类切换到另一个分类，且新列表能选出启用广告
- **THEN** 新网格只有一张广告，且跟在该列表第 1 个应用之后

### Requirement: 货架深链使用路径

14 个货架的公开地址 MUST 为 `/category/<slug>`。`<slug>` MUST 与分类标签中除 `all` 以外的 slug 一致，包含下划线，MUST NOT 改写成连字符。All MUST 只使用 `/category`。系统 MUST NOT 把 `/category/all` 当作 All 的稳定地址。站内指向某个货架的链接 MUST 使用对应路径，MUST NOT 使用 `category` 查询参数。用户激活 `all` 时，地址 MUST 为 `/category`。用户激活其它标签时，地址 MUST 为 `/category/<slug>`。分类页 MUST NOT 把 `category` 查询参数写回地址栏。canonical、Open Graph 与 Twitter 的页面地址 MUST 为当前这条路径，MUST NOT 带查询参数。路径多于一段，或唯一一段不是货架 slug 时，系统 MUST 将地址改为 `/category` 并激活 `all`。

#### Scenario: 打开浏览器货架

- **WHEN** 用户打开 `/category/browser`
- **THEN** browser 标签为激活态，且 canonical 为 `/category/browser`

#### Scenario: 下划线 slug 保持原样

- **WHEN** 用户打开 `/category/cloud_storage`
- **THEN** cloud_storage 标签为激活态，地址仍为 `/category/cloud_storage`

#### Scenario: all 路径回到裸分类页

- **WHEN** 用户打开 `/category/all`
- **THEN** 地址变为 `/category`，且 all 标签为激活态

#### Scenario: 无法识别的路径回到 All

- **WHEN** 用户打开 `/category/not-a-shelf`
- **THEN** 地址变为 `/category`，且 all 标签为激活态

### Requirement: 已知旧查询重定向到货架路径

对 `/category` 的文档请求，当查询参数 `category` 为 14 个货架 slug 之一时，系统 MUST 永久重定向到 `/category/<slug>`，且目标地址 MUST NOT 再包含 `category` 查询参数。当该参数为 `all` 时，系统 MUST 永久重定向到 `/category`，且目标地址 MUST NOT 再包含 `category` 查询参数。当该参数不是上述值时，系统 MUST NOT 为此单独立重定向。页面 MUST 忽略该查询并激活 `all`。

#### Scenario: 旧的浏览器查询进入路径

- **WHEN** 浏览器文档请求 `/category?category=browser`
- **THEN** 响应永久重定向到 `/category/browser`，且该地址没有 `category` 查询参数

#### Scenario: 旧的 all 查询回到裸分类页

- **WHEN** 浏览器文档请求 `/category?category=all`
- **THEN** 响应永久重定向到 `/category`，且该地址没有 `category` 查询参数

#### Scenario: 无法识别的查询不重定向

- **WHEN** 浏览器文档请求 `/category?category=nope`
- **THEN** 系统 MUST NOT 将该请求重定向到某个货架路径，页面激活 all

### Requirement: 分类文档标题按货架区分

`/category` 的文档标题 MUST 为 `Apps by Category - winstall`。`/category/<slug>` 的文档标题 MUST 为该 slug 的现有展示名、` - `、然后是 `winstall`。`browser` 的文档标题 MUST 为 `Browsers - winstall`。`development` 的文档标题 MUST 为 `Developer Tools - winstall`。页面上的 `meta name="title"`、Open Graph 标题与 Twitter 标题 MUST 使用这同一字符串。meta description MUST 仍为分类页现有的那一句。页面 MUST NOT 为此增加分类标题。

#### Scenario: All 标题不变

- **WHEN** 用户打开 `/category`
- **THEN** 文档标题 MUST 为 `Apps by Category - winstall`

#### Scenario: 货架标题使用展示名

- **WHEN** 用户打开 `/category/development`
- **THEN** 文档标题 MUST 为 `Developer Tools - winstall`
