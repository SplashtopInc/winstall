## MODIFIED Requirements

### Requirement: Detail pages show lifetime view and download counts

当统计展示开关打开时，App 详情与 Pack 详情 MUST 展示该资源在 winstall-api stats 上的终身浏览与下载（安装）次数。这些页面 MUST NOT 从 App 或 Pack 文档内嵌的 `stats` 对象读取计数。本能力 MUST NOT 用 stats 接口去填列表、目录或周榜卡片。`SingleApp` 上来自列表字段的终身计数由 `app-card-engagement` 规定。`PackCard` 上来自列表字段的终身计数由 `pack-card-engagement` 规定。Trending Apps 与 Featured Packs 使用周榜 payload 上的 `viewCount`、`downloadCount`、`likeCount`，由 `home-trending` 规定。stats 读取失败 MUST NOT 挡住详情页其余内容；读取失败时 MAY 不展示计数。开关打开且读取成功时，页面 MUST 展示这些计数。开关关闭时，页面 MUST NOT 展示浏览或下载次数，且 MUST NOT 请求 `GET /apps/:id/stats` 或 `GET /packs/:id/stats`。展示出的每个数字 MUST 遵循 `engagement-count-format` 的紧凑单位（小于 1000 为精确整数，大于或等于 1000 为一位小数的 `K` / `M` / `B`，不加 `+`）。

#### Scenario: App detail shows stats

- **WHEN** 统计展示开关打开，且用户打开 App 详情且 stats 读取成功
- **THEN** 页面 MUST 展示该 App 的终身浏览与下载次数

#### Scenario: Pack detail shows stats

- **WHEN** 统计展示开关打开，且用户打开 Pack 详情且 stats 读取成功
- **THEN** 页面 MUST 展示该 Pack 的终身浏览与下载次数

#### Scenario: Stats failure does not hide the page

- **WHEN** 详情页的 stats 读取失败
- **THEN** 页面 MUST 仍渲染身份、安装操作与其它既有内容，且 MUST NOT 依赖计数才能使用

#### Scenario: Lists omit engagement counts

- **WHEN** 用户查看首页、Apps 列表或 Packs 列表
- **THEN** 这些表面 MUST NOT 把 `GET /apps/:id/stats` 或 `GET /packs/:id/stats` 的计数当作本能力的展示来源

#### Scenario: 开关关闭时详情不请求 stats

- **WHEN** 统计展示开关关闭，且用户打开 App 或 Pack 详情
- **THEN** 页面 MUST NOT 展示浏览或下载次数，且 MUST NOT 请求 `GET /apps/:id/stats` 或 `GET /packs/:id/stats`
