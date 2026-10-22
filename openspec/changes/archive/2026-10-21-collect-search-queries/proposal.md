## Why

产品要知道用户在全局搜索框里实际提交了哪些词。winstall-api 已在带 `X-Search-Record: 1` 的 `GET /apps/search` 上旁路写入搜索记录，但网站现在的结果请求不带这个头，也不带登录身份，所以集合一直是空的。

## What Changes

- 全局搜索框在回车提交或点击 “View all results” 之后，只给紧接着的那一次应用搜索结果请求加上 `X-Search-Record: 1`。
- 该次请求在 session API JWT 未过期时附带 `Authorization: Bearer`。未登录、令牌缺失或已过期时省略该头，搜索照常展示。
- 同一地址再次提交、刷新、分享链接、OpenSearch、Load more，以及建议、点进应用、Add Apps、Pack 预览搜索，都不带这个头。
- 搜索 URL、分页信封和结果展示保持不变。不新增上报接口，不改本地 Recent。

## Capabilities

### New Capabilities

- `search-query-collection`: 把全局搜索框的一次提交记到 winstall-api 已有的搜索记录上，并带上可用的用户身份。

### Modified Capabilities

- （无）

## Impact

- 前端：`components/SearchDialog.js` 在两次提交动作上留下一次性标记；`pages/apps.js` 只在对应的第一页 `GET /apps/search` 上消费该标记；`utils/fetchWinstallAPI.js` 为这一次请求附上未过期的 session API JWT。
- API：沿用已上线的 `GET /apps/search` 与请求头 `X-Search-Record`。不改查询参数，不读响应里的记录结果。`tags:` 与 `publisher:` 是否落库仍由 API 现有规则决定。
- 公开路径不变。`/apps?q=` 仍是结果页地址。
