# public-pack-limit Specification

## Purpose

按当前登录用户是否为配置的运营账号，决定创建 Pack 与把 Pack 设为 public 时的公开名额。运营账号可以公开到 200 个，其他用户仍是 10 个。

## Requirements

### Requirement: 公开名额按运营账号区分

网站 MUST 通过 `GET /packs/me/quota` 取得当前用户的 `publicCount` 与 `maxPublic`，并以这两个整数作为公开数量和公开名额。运营账号与普通用户的 200 和 10 由该响应的 `maxPublic` 表达，网站 MUST NOT 再自行比较运营账号 id。该请求 MUST 携带 session 签发的 API JWT，形式为 `Authorization: Bearer`。没有可用 JWT 时，网站 MUST NOT 匿名发出该请求。网站 MUST NOT 读取 `PACK_TRENDING_OWNER_USER_ID`，MUST NOT 去掉其空白，MUST NOT 把运营账号 id 写入页面。创建 Pack 弹窗与主人分享勾选 MUST NOT 为这项判断调用 `GET /packs/me`。系统 MUST NOT 改变 `POST /packs` 或 `PATCH /packs/:id` 的请求体。名额请求失败，或成功体不是同时包含整数 `publicCount` 与 `maxPublic` 的对象时，网站 MUST NOT 自行假定名额为 10 或 200，公开勾选 MUST 保持可用。

#### Scenario: 运营账号的名额是 200

- **WHEN** `GET /packs/me/quota` 对当前用户返回 `maxPublic` 为 200
- **THEN** 网站把公开名额当作 200，且不读取 `PACK_TRENDING_OWNER_USER_ID`

#### Scenario: 配置两侧空白仍对上运营账号

- **WHEN** API 因 `PACK_TRENDING_OWNER_USER_ID` 去掉首尾空白后对上当前用户，而使 `GET /packs/me/quota` 返回 `maxPublic` 为 200
- **THEN** 网站把公开名额当作 200，且网站自身不读取、也不 trim 该环境变量

#### Scenario: 其他用户的名额仍是 10

- **WHEN** `GET /packs/me/quota` 对当前用户返回 `maxPublic` 为 10
- **THEN** 网站把公开名额当作 10

#### Scenario: 未配置运营账号时人人都是 10

- **WHEN** API 未配置运营账号，从而使 `GET /packs/me/quota` 返回 `maxPublic` 为 10
- **THEN** 网站把公开名额当作 10，且不读取 `PACK_TRENDING_OWNER_USER_ID`

#### Scenario: 名额数字来自 quota 响应

- **WHEN** 已登录用户打开创建弹窗，且 `GET /packs/me/quota` 返回 `publicCount` 为 3、`maxPublic` 为 10
- **THEN** 网站把公开数量当作 3、公开名额当作 10，且该判断不读取 `PACK_TRENDING_OWNER_USER_ID`

#### Scenario: 名额请求携带 JWT

- **WHEN** 已登录用户打开创建弹窗，或打开一个尚未 public 的自有 Pack 的分享面板，且 session 中有可用的 API JWT
- **THEN** 网站请求 `GET /packs/me/quota`，并在 `Authorization` 中以 `Bearer` 带上该 JWT

#### Scenario: 没有 JWT 时不匿名请求名额

- **WHEN** 创建弹窗或尚未 public 的分享勾选需要名额，且没有可用的 API JWT
- **THEN** 网站不发出不带 `Authorization` 的 `GET /packs/me/quota`

#### Scenario: 创建与分享不为名额调用我的 Pack 列表

- **WHEN** 已登录用户打开创建弹窗，或打开一个尚未 public 的自有 Pack 的分享面板
- **THEN** 网站不为这项判断请求 `GET /packs/me`

#### Scenario: 名额请求失败时不猜测上限

- **WHEN** `GET /packs/me/quota` 失败，或成功体缺少整数 `publicCount` 或 `maxPublic`
- **THEN** 网站不把名额当成 10 或 200，公开勾选保持可用

### Requirement: 创建与分享的公开勾选使用同一名额

创建 Pack 的弹窗，以及主人把尚未 public 的 Pack 设为 public 的分享勾选，MUST 使用同一次 `GET /packs/me/quota` 返回的 `publicCount` 与 `maxPublic`。`publicCount` 小于 `maxPublic` 时，公开勾选 MUST 可用。`publicCount` 大于或等于 `maxPublic`，且正在编辑或分享的 Pack 还不是 public 时，公开勾选 MUST 不可用，提示 MUST 为 `Public pack limit reached (N). Unpublish or delete a pack to continue.`，其中 `N` MUST 为该响应的 `maxPublic`。该 Pack 已经是 public 时，公开勾选 MUST 保持可用，即使 `publicCount` 已经达到 `maxPublic`。名额未满时，创建弹窗的提示 MUST 仍为 `Appears in the public App Packs directory for anyone to discover.`，分享勾选的提示 MUST 仍为 `Anyone with the link will be able to view this pack.`。私有 Pack 的创建与编辑 MUST 不受该名额阻止。这两处 MUST NOT 为这项判断请求 `GET /packs/me`。

#### Scenario: 运营账号在 10 个 public 之后仍可再公开

- **WHEN** `GET /packs/me/quota` 返回 `publicCount` 为 10、`maxPublic` 为 200，并打开创建弹窗或一个尚未 public 的自有 Pack 的分享面板
- **THEN** 公开勾选可用，且提示不是名额已满

#### Scenario: 运营账号达到 200 个后不能再公开

- **WHEN** `GET /packs/me/quota` 返回 `publicCount` 为 200、`maxPublic` 为 200，并打开创建弹窗或一个尚未 public 的自有 Pack 的分享面板
- **THEN** 公开勾选不可用，且提示为 `Public pack limit reached (200). Unpublish or delete a pack to continue.`

#### Scenario: 普通用户达到 10 个后不能再公开

- **WHEN** `GET /packs/me/quota` 返回 `publicCount` 为 10、`maxPublic` 为 10，并打开创建弹窗或一个尚未 public 的自有 Pack 的分享面板
- **THEN** 公开勾选不可用，且提示为 `Public pack limit reached (10). Unpublish or delete a pack to continue.`

#### Scenario: 已经公开的 Pack 不受名额拦截

- **WHEN** `GET /packs/me/quota` 返回的 `publicCount` 已经大于或等于 `maxPublic`，并编辑或分享一个 `visibility` 为 `public` 的自有 Pack
- **THEN** 公开勾选保持可用

#### Scenario: 名额未满时提示保持原句

- **WHEN** `GET /packs/me/quota` 返回的 `publicCount` 小于 `maxPublic`，并打开创建弹窗
- **THEN** 提示为 `Appears in the public App Packs directory for anyone to discover.`
