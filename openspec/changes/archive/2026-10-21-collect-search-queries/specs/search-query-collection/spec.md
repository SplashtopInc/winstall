## Purpose

让全局搜索框的一次提交，在随后那次应用搜索结果请求上留下搜索词；登录令牌仍有效时，同一请求带上用户身份。

## ADDED Requirements

### Requirement: A global search submission marks one results request

用户在全局搜索框按下回车且当前没有高亮的应用建议，或点击 “View all results” 时，系统 MUST 打开 `/apps?q=`，其中 `q` 为 trim 后的输入。若该地址与当前结果地址不同，系统 MUST 在随后加载的第一页 `GET /apps/search` 上发送请求头 `X-Search-Record`，其 trim 后的值 MUST 为 `1`。该请求的 `offset` MUST 为 0，`q`、字段过滤参数与 `limit` MUST 与未采集时的同一搜索一致。一次提交 MUST 只产生一个带该头的请求。系统 MUST NOT 为采集另发请求，也 MUST NOT 改公开路径 `/apps` 或 `/apps?q=`。

#### Scenario: Enter opens results and marks the first search

- **WHEN** 用户在全局搜索框输入非空词，没有高亮的应用建议，按下回车，且当前不在该词的结果地址
- **THEN** 浏览器打开该词的 `/apps?q=`，并且随后的第一页 `GET /apps/search` 带 `X-Search-Record: 1`、`offset` 为 0

#### Scenario: View all results marks the first search

- **WHEN** 用户在全局搜索框点击 “View all results”，且当前不在该词的结果地址
- **THEN** 浏览器打开该词的 `/apps?q=`，并且随后的第一页 `GET /apps/search` 带 `X-Search-Record: 1`

#### Scenario: Highlighted suggestion does not mark a search

- **WHEN** 用户在全局搜索框用回车打开当前高亮的应用建议
- **THEN** 浏览器打开该应用详情，且 MUST NOT 发出带 `X-Search-Record` 的请求

#### Scenario: The same results address does not search again

- **WHEN** 用户提交的词与当前 `/apps?q=` 相同
- **THEN** 系统 MUST NOT 再发 `GET /apps/search`，也 MUST NOT 留下可被之后某次访问带上的记录标记

#### Scenario: One submission produces one marked request

- **WHEN** 一次提交触发结果页加载第一页
- **THEN** 带 `X-Search-Record: 1` 的 `GET /apps/search` 只有一个，同一次加载中的其它结果请求 MUST NOT 带该头

### Requirement: The marked request carries a fresh session JWT

带 `X-Search-Record: 1` 的那次 `GET /apps/search`，在 session API JWT 存在且未过期时 MUST 附带 `Authorization: Bearer`，值为该 JWT。未登录、令牌缺失或已过期时，该请求 MUST 省略 `Authorization`，并仍展示搜索结果。任何搜索请求 MUST NOT 附带 `AuthKey`、`AuthSecret` 或 `X-User-Id`。未带 `X-Search-Record` 的 `GET /apps/search` MUST 省略 `Authorization`。

#### Scenario: Signed-in submission sends the session JWT

- **WHEN** 已登录用户提交一次会打标记的搜索，且 session API JWT 未过期
- **THEN** 那次 `GET /apps/search` 同时带 `X-Search-Record: 1` 和 `Authorization: Bearer`

#### Scenario: Signed-out submission omits Authorization

- **WHEN** 未登录用户提交一次会打标记的搜索
- **THEN** 那次 `GET /apps/search` 带 `X-Search-Record: 1`，且省略 `Authorization`

#### Scenario: Expired JWT is omitted and results still render

- **WHEN** 已登录用户提交一次会打标记的搜索，且 session API JWT 已过期
- **THEN** 那次 `GET /apps/search` 省略 `Authorization`，结果页仍按搜索信封展示

### Requirement: Unrelated searches stay unmarked

下列请求 MUST NOT 带 `X-Search-Record`：全局搜索的输入建议、`/apps` 的 Load more、Add Apps 对话框里的搜索、Pack 内添加应用的预览搜索、刷新、分享链接或 OpenSearch 直接打开的 `/apps?q=`。点击最近搜索只填入输入框时 MUST NOT 发搜索请求。`publisher:` 提交后的结果请求 MUST 仍是 `GET /publishers/:id`，且 MUST NOT 为了采集另发 `GET /apps/search`。`tags:`、`name:`、`desc:` 的查询参数形状保持不变；若该次提交会打标记，头只加在既有的第一页 `GET /apps/search` 上。

#### Scenario: Load more is unmarked

- **WHEN** 用户在 `/apps` 的搜索结果上加载更多
- **THEN** 该次 `GET /apps/search` 的 `offset` 大于 0，且不带 `X-Search-Record`

#### Scenario: A shared results link is unmarked

- **WHEN** 用户直接打开或刷新一个 `/apps?q=` 地址，而不是从当次全局搜索提交进来
- **THEN** 第一页 `GET /apps/search` 不带 `X-Search-Record`

#### Scenario: Add Apps search is unmarked

- **WHEN** 用户在 Add Apps 对话框里搜索应用
- **THEN** 其 `GET /apps/search` 不带 `X-Search-Record`，也不带 `Authorization`

#### Scenario: Publisher submission does not invent a search record

- **WHEN** 用户在全局搜索框提交 `publisher:` 查询
- **THEN** 结果来自 `GET /publishers/:id`，且没有任何请求带 `X-Search-Record`

### Requirement: Search presentation is unchanged by collection

采集 MUST NOT 改变搜索结果的渲染。成功响应仍按 `{ total, offset, limit, data }` 展示。系统 MUST NOT 读取或依赖响应中的记录结果。采集失败或搜索失败时，结果页 MUST 保持现有的错误表现，且 MUST NOT 为同一次提交再补一个带记录头的请求。全局搜索提交时，本地最近搜索 MUST 仍写入该 trim 后的词。

#### Scenario: Marked and unmarked searches render the same envelope

- **WHEN** 带 `X-Search-Record: 1` 的第一页搜索返回成功信封
- **THEN** 结果页展示该信封中的应用，展示方式与未带该头时相同

#### Scenario: A failed marked search is not retried for collection

- **WHEN** 带记录头的第一页搜索失败
- **THEN** 页面使用现有错误表现，且 MUST NOT 自动再发一次带 `X-Search-Record` 的请求
