# my-likes Specification

## Purpose

让已登录用户在 `/my/favorites` 查看自己点赞过、且现在仍可访问的 App 与 Pack，并在每次进入该页时重新拉取列表。`/my/likes` 只重定向到该页。

## Requirements

### Requirement: Liked page lives at /my/likes

系统 MUST 在 `/my/likes` 提供当前用户的点赞列表页。该页 MUST NOT 改到其它路径，也 MUST NOT 从其它路径重定向过来。`/my` MUST NOT 提供页面，请求 `/my` 时 MUST NOT 重定向到 `/my/likes`。主导航 MUST NOT 增加指向该页的项。已登录用户的账户菜单 MUST 提供进入 `/my/likes` 的 Liked 项。页面文档 MUST 带 `noindex`。静态 sitemap MUST NOT 包含 `/my/likes`。系统 MUST NOT 恢复 `/users/:id`。

#### Scenario: Signed-in menu opens the page

- **WHEN** 已登录用户从账户菜单激活 Liked
- **THEN** 浏览器打开 `/my/likes`

#### Scenario: Bare /my is not a page

- **WHEN** 客户端请求 `/my`
- **THEN** 响应 MUST NOT 是点赞列表，且 MUST NOT 重定向到 `/my/likes`

#### Scenario: Personal page stays out of the sitemap

- **WHEN** 静态 sitemap 生成
- **THEN** 其中 MUST NOT 有 `/my/likes`

### Requirement: Signed-out visitors see login

未登录用户打开 `/my/likes` 时，系统 MUST 展示登录说明，MUST NOT 请求 `GET /apps/liked` 或 `GET /packs/liked`，MUST NOT 把该状态画成「还没有赞」的空列表。从该登录说明完成登录后，系统 MUST 回到 `/my/likes`。session 尚未就绪时 MUST 展示货架骨架，MUST NOT 先画出登录说明或空列表。

#### Scenario: Anonymous visit does not call the liked APIs

- **WHEN** 未登录用户打开 `/my/likes`
- **THEN** 页面展示登录说明，且 MUST NOT 发出 `GET /apps/liked` 或 `GET /packs/liked`

#### Scenario: Login returns to the liked page

- **WHEN** 未登录用户在 `/my/likes` 的登录说明中完成登录
- **THEN** 登录后的页面是 `/my/likes`

### Requirement: Liked lists use the current user envelope

已登录且 session 就绪后，页面 MUST 向 API origin 请求 `GET /apps/liked` 与 `GET /packs/liked`，并带上 session API JWT 作为 `Authorization: Bearer`。请求 MUST NOT 附带 `AuthKey`、`AuthSecret` 或 `X-User-Id`，MUST NOT 附带查询参数 `userId`。两条成功响应都 MUST 按 `{ total, offset, limit, data }` 渲染。系统 MUST NOT 在服务端代拉这两条列表。每次请求的 `limit` MUST 为 24。系统 MUST NOT 发送 `sort`，MUST NOT 在客户端重排 `data`。

#### Scenario: Signed-in entry requests both first pages

- **WHEN** 已登录用户进入 `/my/likes`
- **THEN** 客户端请求 `GET /apps/liked` 与 `GET /packs/liked`，二者都带 Bearer JWT、`offset` 为 0、`limit` 为 24，且都不带 `userId`

### Requirement: Apps and packs paginate independently

页面 MUST 用 Apps 与 Packs 两个标签展示对应列表。标签上的数量 MUST 来自该列表信封的 `total`。默认显示 Apps。地址栏 MUST NOT 决定当前标签，系统 MUST NOT 把标签、`page` 或 `offset` 写入地址栏。打开带 `page`、`offset` 或标签查询的 `/my/likes` 时，系统 MUST 仍从两条列表的 offset 0 加载，并忽略这些查询。某个标签已展示的条数小于其 `total` 时 MUST 显示 Load more；激活后 MUST 以 `limit` 24 追加下一批，MUST NOT 替换已展示卡片。Load more 进行中 MUST 只把该按钮变为加载态，MUST NOT 用骨架换掉已有卡片。已展示条数达到 `total` 后 MUST NOT 再显示 Load more。系统 MUST NOT 使用 Prev/Next、页码或方向键翻页，MUST NOT 展示当前切片范围或 page x of y。同一次停留中切换标签 MUST 保留每个标签已经加载的卡片。

#### Scenario: Load more appends the active list

- **WHEN** 已登录用户在 Apps 标签看到的卡片少于该列表 `total`，并激活 Load more
- **THEN** 下一批 App 出现在已有卡片之后，Packs 标签已加载的内容不变，且该次 `GET /apps/liked` 的 `limit` 为 24

#### Scenario: Switching tabs keeps the loaded slice

- **WHEN** 用户在同一次停留中从 Apps 切到 Packs，再切回 Apps
- **THEN** Apps 仍显示切换前已经加载的卡片，且这次切换 MUST NOT 重新请求 `GET /apps/liked`

### Requirement: Entering the page refetches from the first page

每次进入 `/my/likes`（包括从其它站点页面返回，以及浏览器往返缓存恢复该文档）时，系统 MUST 丢弃这次进入之前加载的点赞卡片，并从两条列表的 offset 0 重新请求。MUST NOT 把上一次停留里 Load more 展开的后续页留在屏幕上。用户仍停在 `/my/likes` 时，系统 MUST NOT 因浏览器标签重新可见而重新请求。另一标签页里发生的点赞或取消赞，MUST NOT 被要求在当前这次停留中反映出来。

#### Scenario: Return from detail reloads the first page

- **WHEN** 已登录用户在 `/my/likes` 经 Load more 看到多于 24 条 App，离开到某 App 详情后再回到 `/my/likes`
- **THEN** Apps 列表重新从 `GET /apps/liked` 的 offset 0 渲染，且不再保留离开前多加载的那一批

#### Scenario: Visible browser tab does not refetch

- **WHEN** 已登录用户停在 `/my/likes`，浏览器标签从隐藏变为可见，且期间没有离开该页
- **THEN** 系统 MUST NOT 再次请求 `GET /apps/liked` 或 `GET /packs/liked`

### Requirement: App cards can be selected and packs stay links

Apps 标签的每条 MUST 使用与 `/apps` 紧凑货架相同的应用卡，并 MUST 提供与该货架相同的勾选。勾选 MUST 加入全站安装选择，取消勾选 MUST 从该选择移除。重新拉取点赞列表 MUST NOT 清空全站安装选择。Packs 标签的每条 MUST 使用与 `/packs` 相同的合集轻卡，整卡进入 `/packs/:id`，且 MUST NOT 提供勾选。两条列表的卡片都 MUST NOT 提供点赞或取消点赞。系统 MUST NOT 为这些卡片请求 `GET /apps/:id/stats` 或 `GET /packs/:id/stats`。卡片 MUST NOT 展示点赞发生时间。

#### Scenario: Checking an app joins the site selection

- **WHEN** 已登录用户在 `/my/likes` 的 Apps 标签勾选一个应用
- **THEN** 该应用进入全站安装选择，且页面 MUST NOT 为此调用取消赞接口

#### Scenario: Reloading likes keeps the selection

- **WHEN** 用户已勾选若干应用，随后再次进入 `/my/likes` 使列表重新加载
- **THEN** 这些应用仍留在全站安装选择中

### Requirement: Empty, error, and hidden likes stay distinct

某个列表返回 200 且 `total` 为 0 时，该标签 MUST 展示空态，并提供去浏览 Apps 或 Packs 的路径。请求失败时 MUST 展示既有错误态，MUST NOT 展示空态。空态与错误态都 MUST NOT 解释有多少条点赞因目标不可访问而被隐藏。自己的 private Pack MUST 在卡片上标明 private。public Pack MUST NOT 展示可见性徽章。

#### Scenario: No accessible likes

- **WHEN** 已登录用户的 `GET /apps/liked` 返回 200，`total` 为 0，`data` 为 `[]`
- **THEN** Apps 标签展示空态和去浏览 Apps 的路径，且不出现 Load more

#### Scenario: Failed read is not an empty list

- **WHEN** 已登录用户请求 `GET /packs/liked` 失败
- **THEN** Packs 标签展示错误态，且 MUST NOT 展示「还没有赞」的空态

#### Scenario: Own private pack shows a badge

- **WHEN** `GET /packs/liked` 的某条 `visibility` 为 private
- **THEN** 该卡片标明 private

#### Scenario: Public pack has no visibility badge

- **WHEN** `GET /packs/liked` 的某条 `visibility` 为 public
- **THEN** 该卡片 MUST NOT 展示可见性徽章
