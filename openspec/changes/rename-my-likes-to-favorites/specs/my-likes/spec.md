## MODIFIED Requirements

### Requirement: Liked page lives at /my/likes

系统 MUST 在 `/my/favorites` 提供当前用户的点赞列表页。请求 `/my/likes` 时 MUST 重定向到 `/my/favorites`，且 MUST 保留原查询字符串。除 `/my/likes` 外，系统 MUST NOT 从其它路径重定向到该页。`/my` MUST NOT 提供页面，请求 `/my` 时 MUST NOT 重定向到 `/my/favorites` 或 `/my/likes`。主导航 MUST NOT 增加指向该页的项。主题按钮之后 MUST 有一颗只显示心形图标的 Favorites 控件，MUST NOT 展示可见文案 Favorites，可访问名称 MUST 为 Favorites。已登录时激活该控件 MUST 进入 `/my/favorites`。未登录时激活该控件 MUST 打开登录弹窗，且 MUST NOT 先进入 `/my/favorites`；从该弹窗完成登录后 MUST 回到 `/my/favorites`。账户菜单 MUST NOT 包含 Favorites 项。页面文档 MUST 带 `noindex`。静态 sitemap MUST NOT 包含 `/my/favorites` 或 `/my/likes`。系统 MUST NOT 恢复 `/users/:id`。

#### Scenario: Signed-in heart opens the page

- **WHEN** 已登录用户激活主题按钮后面的 Favorites 图标
- **THEN** 浏览器打开 `/my/favorites`，且账户菜单 MUST NOT 包含 Favorites 项

#### Scenario: Signed-out heart opens login

- **WHEN** 未登录用户激活主题按钮后面的 Favorites 图标
- **THEN** 系统 MUST 打开登录弹窗，且 MUST NOT 先进入 `/my/favorites`

#### Scenario: Bare /my is not a page

- **WHEN** 客户端请求 `/my`
- **THEN** 响应 MUST NOT 是点赞列表，且 MUST NOT 重定向到 `/my/favorites` 或 `/my/likes`

#### Scenario: Personal page stays out of the sitemap

- **WHEN** 静态 sitemap 生成
- **THEN** 其中 MUST NOT 有 `/my/favorites` 或 `/my/likes`

#### Scenario: Old likes path redirects

- **WHEN** 客户端请求 `/my/likes`
- **THEN** 响应重定向到 `/my/favorites`，且 MUST NOT 在 `/my/likes` 展示点赞列表

### Requirement: Signed-out visitors see login

未登录用户打开 `/my/favorites` 时，系统 MUST 展示登录说明，MUST NOT 请求 `GET /apps/liked` 或 `GET /packs/liked`，MUST NOT 把该状态画成空列表。从该登录说明完成登录后，系统 MUST 回到 `/my/favorites`。session 尚未就绪时 MUST 展示货架骨架，MUST NOT 先画出登录说明或空列表。

#### Scenario: Anonymous visit does not call the liked APIs

- **WHEN** 未登录用户打开 `/my/favorites`
- **THEN** 页面展示登录说明，且 MUST NOT 发出 `GET /apps/liked` 或 `GET /packs/liked`

#### Scenario: Login returns to the liked page

- **WHEN** 未登录用户在 `/my/favorites` 的登录说明中完成登录
- **THEN** 登录后的页面是 `/my/favorites`

### Requirement: Liked lists use the current user envelope

已登录且 session 就绪后，页面 MUST 向 API origin 请求 `GET /apps/liked` 与 `GET /packs/liked`，并带上 session API JWT 作为 `Authorization: Bearer`。请求 MUST NOT 附带 `AuthKey`、`AuthSecret` 或 `X-User-Id`，MUST NOT 附带查询参数 `userId`。两条成功响应都 MUST 按 `{ total, offset, limit, data }` 渲染。系统 MUST NOT 在服务端代拉这两条列表。每次请求的 `limit` MUST 为 24。系统 MUST NOT 发送 `sort`，MUST NOT 在客户端重排 `data`。

#### Scenario: Signed-in entry requests both first pages

- **WHEN** 已登录用户进入 `/my/favorites`
- **THEN** 客户端请求 `GET /apps/liked` 与 `GET /packs/liked`，二者都带 Bearer JWT、`offset` 为 0、`limit` 为 24，且都不带 `userId`

### Requirement: Apps and packs paginate independently

页面 MUST 用 Apps 与 Packs 两个标签展示对应列表。标签上的数量 MUST 来自该列表信封的 `total`。默认显示 Apps。地址栏 MUST NOT 决定当前标签，系统 MUST NOT 把标签、`page` 或 `offset` 写入地址栏。打开带 `page`、`offset` 或标签查询的 `/my/favorites` 时，系统 MUST 仍从两条列表的 offset 0 加载，并忽略这些查询。某个标签已展示的条数小于其 `total` 时 MUST 显示 Load more；激活后 MUST 以 `limit` 24 追加下一批，MUST NOT 替换已展示卡片。Load more 进行中 MUST 只把该按钮变为加载态，MUST NOT 用骨架换掉已有卡片。已展示条数达到 `total` 后 MUST NOT 再显示 Load more。系统 MUST NOT 使用 Prev/Next、页码或方向键翻页，MUST NOT 展示当前切片范围或 page x of y。同一次停留中切换标签 MUST 保留每个标签已经加载的卡片。

#### Scenario: Load more appends the active list

- **WHEN** 已登录用户在 Apps 标签看到的卡片少于该列表 `total`，并激活 Load more
- **THEN** 下一批 App 出现在已有卡片之后，Packs 标签已加载的内容不变，且该次 `GET /apps/liked` 的 `limit` 为 24

#### Scenario: Switching tabs keeps the loaded slice

- **WHEN** 用户在同一次停留中从 Apps 切到 Packs，再切回 Apps
- **THEN** Apps 仍显示切换前已经加载的卡片，且这次切换 MUST NOT 重新请求 `GET /apps/liked`

### Requirement: Entering the page refetches from the first page

每次进入 `/my/favorites`（包括从其它站点页面返回，以及浏览器往返缓存恢复该文档）时，系统 MUST 丢弃这次进入之前加载的点赞卡片，并从两条列表的 offset 0 重新请求。MUST NOT 把上一次停留里 Load more 展开的后续页留在屏幕上。用户仍停在 `/my/favorites` 时，系统 MUST NOT 因浏览器标签重新可见而重新请求。另一标签页里发生的点赞或取消赞，MUST NOT 被要求在当前这次停留中反映出来。

#### Scenario: Return from detail reloads the first page

- **WHEN** 已登录用户在 `/my/favorites` 经 Load more 看到多于 24 条 App，离开到某 App 详情后再回到 `/my/favorites`
- **THEN** Apps 列表重新从 `GET /apps/liked` 的 offset 0 渲染，且不再保留离开前多加载的那一批

#### Scenario: Visible browser tab does not refetch

- **WHEN** 已登录用户停在 `/my/favorites`，浏览器标签从隐藏变为可见，且期间没有离开该页
- **THEN** 系统 MUST NOT 再次请求 `GET /apps/liked` 或 `GET /packs/liked`

### Requirement: App cards can be selected and packs stay links

Apps 标签的每条 MUST 使用与 `/apps` 紧凑货架相同的应用卡，并 MUST 提供与该货架相同的勾选。勾选 MUST 加入全站安装选择，取消勾选 MUST 从该选择移除。重新拉取点赞列表 MUST NOT 清空全站安装选择。Packs 标签的每条 MUST 使用与 `/packs` 相同的合集轻卡，整卡进入 `/packs/:id`，且 MUST NOT 提供勾选。两条列表的卡片都 MUST NOT 提供点赞或取消点赞。系统 MUST NOT 为这些卡片请求 `GET /apps/:id/stats` 或 `GET /packs/:id/stats`。卡片 MUST NOT 展示点赞发生时间。

#### Scenario: Checking an app joins the site selection

- **WHEN** 已登录用户在 `/my/favorites` 的 Apps 标签勾选一个应用
- **THEN** 该应用进入全站安装选择，且页面 MUST NOT 为此调用取消赞接口

#### Scenario: Reloading likes keeps the selection

- **WHEN** 用户已勾选若干应用，随后再次进入 `/my/favorites` 使列表重新加载
- **THEN** 这些应用仍留在全站安装选择中

## ADDED Requirements

### Requirement: 收藏架文案使用 Favorites

导航 Favorites 控件的可访问名称、页面主标题、文档标题，以及标签列表的无障碍名称，MUST 为 Favorites。该控件 MUST NOT 展示可见文字 Favorites。副标题与文档描述 MUST 为 “Your favorite apps and packs.”。未登录时的登录说明标题 MUST 为 “Sign in to see your favorite apps and packs.”。Apps 空态标题 MUST 为 “No apps yet”，其说明 MUST 为 “Like an app from its page. It will show up here.”。Packs 空态标题 MUST 为 “No packs yet”，其说明 MUST 为 “Like a pack from its page. It will show up here.”。列表加载失败时，Apps 的说明 MUST 为 “Could not load apps.”，Packs 的说明 MUST 为 “Could not load packs.”。上述文案 MUST NOT 包含单词 liked。详情上的 Like 与 Unlike MUST 保持不变。

#### Scenario: 菜单与标题叫 Favorites

- **WHEN** 已登录用户打开 `/my/favorites`
- **THEN** 页面主标题是 Favorites，副标题是 “Your favorite apps and packs.”，且导航上的 Favorites 控件没有可见文字 Favorites

#### Scenario: 未登录说明不说 liked

- **WHEN** 未登录用户打开 `/my/favorites`
- **THEN** 登录说明标题是 “Sign in to see your favorite apps and packs.”

#### Scenario: 空态仍用 Like 说明放入方式

- **WHEN** 已登录用户的 `GET /apps/liked` 返回 200，且 `total` 为 0
- **THEN** Apps 空态标题是 “No apps yet”，说明是 “Like an app from its page. It will show up here.”
