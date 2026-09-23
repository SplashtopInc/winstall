## MODIFIED Requirements

### Requirement: 分类页一次只展示一个分类

在 `/category` 上，系统 MUST 展示固定分类标签（文案左侧为对应 Feather 图标），以及当前分类的应用网格。标签 slug 与顺序 MUST 为：`all`、`browser`、`development`、`documents`、`communication`、`utilities`、`security`、`productivity`、`cloud_storage`、`collaboration`、`entertainment`、`photo`、`game`、`screenshots`、`runtimes`。MUST NOT 包含 `social_media` 或 `others`。URL 中无有效分类时，默认激活分类 MUST 为 `all`。`all` MUST 不做分类过滤，展示全量目录。应用卡片 MUST 使用与 `/apps` 目录相同的列表卡片（既有 `SingleApp` 可选中）。网格中的应用卡片 MUST 只来自当前分类（`all` 为未过滤目录）。页面 MUST NOT 展示分类标题、应用总数或页内搜索框。

#### Scenario: 默认分类为 all
- **WHEN** 用户打开无分类查询的 `/category`
- **THEN** all 标签为激活态，网格中的应用卡片为未按分类过滤的应用

#### Scenario: 切换标签更换网格
- **WHEN** 用户激活 development 标签
- **THEN** 网格中的应用卡片仅为 `development` 的应用，且 Load more 从该分类第一页重新开始

## ADDED Requirements

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
