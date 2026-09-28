## MODIFIED Requirements

### Requirement: 首页读取周热度榜

首页生成或再验证时，系统 MUST 向运行时 API origin 请求 `GET /apps/trending` 与 `GET /packs/trending`。这些请求 MUST 省略 `Authorization`、`AuthKey` 和 `AuthSecret`。首页 MUST NOT 用 analytics track 或日桶聚合自行算名次。某一侧读取失败 MUST 视为该侧 `data` 为空数组，且 MUST NOT 因此让整页失败。

#### Scenario: 首页读取两个 trending 接口

- **WHEN** 首页正在生成或再验证，且已配置 API origin
- **THEN** 系统 MUST 在该 origin 上调用 `GET /apps/trending` 与 `GET /packs/trending`，且不带用户或服务凭证

#### Scenario: trending 失败不导致首页空白

- **WHEN** 任一 trending 请求失败
- **THEN** 首页 MUST 仍渲染导航、轮播（若有幻灯片）及其余可用区块，并将失败的那一侧视为无条目
