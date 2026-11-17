# Spec Delta

## Purpose

约束 Service Worker 的运行时缓存：带用户凭证的请求及其响应绝不写入或读取本地缓存，避免登录后的私有数据在同一浏览器里泄露给其他用户或在登出后残留。

## ADDED Requirements

### Requirement: 带 Authorization 的请求不得被缓存

Service Worker MUST 对任何带 `Authorization` 请求头的 GET 请求只走网络：MUST NOT 把响应写入任何缓存，MUST NOT 从任何缓存读取响应来满足该请求，网络失败时 MUST 直接失败而不是回退到缓存。该判断 MUST 只依据请求头，MUST NOT 依赖请求的 origin 或构建期的 API 地址。该规则的优先级 MUST 高于所有其他运行时缓存规则。

#### Scenario: 登录后读取我的 Pack 不进缓存
- **WHEN** 已登录用户的浏览器请求 API 的 `GET /packs/me`，请求带 `Authorization: Bearer`
- **THEN** 响应 MUST NOT 出现在任何 Cache Storage 缓存中

#### Scenario: 其他带凭证的读取同样不进缓存
- **WHEN** 浏览器请求 `GET /packs/me/quota`、`GET /apps/liked`、`GET /packs/liked`、`GET /packs/:id/like`，或 owner 读取私有 Pack 的 `GET /packs/:id`，且请求带 `Authorization`
- **THEN** 这些响应 MUST NOT 出现在任何 Cache Storage 缓存中

#### Scenario: 离线时不回退到旧的私有数据
- **WHEN** 用户先前已请求过 `GET /packs/me`，之后网络不可用或请求超时，浏览器再次发出带 `Authorization` 的 `GET /packs/me`
- **THEN** 该请求 MUST 失败，MUST NOT 返回任何先前缓存的响应

#### Scenario: 换账号后读不到上一位用户的数据
- **WHEN** 用户 A 登出，用户 B 在同一浏览器登录，并在网络不可用时请求 `GET /packs/me`
- **THEN** 该请求 MUST 失败，MUST NOT 返回用户 A 的数据

#### Scenario: 判断不依赖 API origin
- **WHEN** 一个带 `Authorization` 的 GET 请求发往任意 origin（包括运行时配置的 `WINSTALL_API_BASE` 之外的 origin）
- **THEN** 该请求 MUST 同样只走网络且不被缓存

#### Scenario: 规则优先于默认缓存策略
- **WHEN** 带 `Authorization` 的跨源 GET 请求本来会命中默认的跨源缓存规则
- **THEN** 该请求 MUST 由只走网络的规则处理，MUST NOT 进入默认的跨源缓存

### Requirement: 不带凭证的公共请求保持现有缓存行为

本能力 MUST NOT 改变不带 `Authorization` 的请求的缓存策略。公共 API 读取（如 `GET /apps/trending`、公共 Pack 列表、匿名 `GET /packs/:id`）MUST 继续沿用现有的缓存策略与时长，MUST NOT 因本能力改为更长的过期时间或改变先网络后缓存的顺序。

#### Scenario: 匿名公共读取行为不变
- **WHEN** 浏览器发出不带 `Authorization` 的 `GET /apps/trending`
- **THEN** 该请求 MUST 仍由原有的跨源 NetworkFirst 规则处理，缓存时长 MUST 保持 1 小时

#### Scenario: 登录用户的匿名回退读取仍可缓存
- **WHEN** 已登录用户的 API JWT 已过期，客户端按规范省略 `Authorization` 发出公共 `GET /packs/:id`
- **THEN** 该请求 MUST 按匿名公共请求处理

### Requirement: 新 Service Worker 激活时清除历史缓存

新版本 Service Worker 激活时，MUST 删除历史遗留的 `cross-origin` 与 `apis` 缓存，使旧版本已经缓存的、可能含私有数据的条目不再留在用户浏览器中。删除 MUST 是一次性迁移：删除之后公共请求仍可按现有规则重新建立公共缓存。清理失败 MUST NOT 阻止 Service Worker 激活。

#### Scenario: 升级后旧私有条目被清除
- **WHEN** 用户浏览器上由旧版 Service Worker 写入的 `cross-origin` 缓存里存有 `GET /packs/me` 的响应，随后新版 Service Worker 激活
- **THEN** 激活完成后 Cache Storage 中 MUST NOT 再存在该条目

#### Scenario: 清理不影响精确预缓存
- **WHEN** 新版 Service Worker 激活并清理历史缓存
- **THEN** 其预缓存清单所用的缓存 MUST NOT 被本次清理删除

#### Scenario: 清理失败不阻塞激活
- **WHEN** 删除某个历史缓存时抛出错误
- **THEN** Service Worker MUST 仍完成激活，其余缓存的清理 MUST 继续尝试

### Requirement: 凭证请求判断可在无浏览器环境下测试

判断"一个请求是否属于不可缓存的凭证请求"以及"需要清理的历史缓存名"的逻辑 MUST 不依赖 Service Worker 全局对象（如 `self`），MUST 可以直接由项目现有的 Node 原生测试覆盖，并 MUST 有自动化测试验证上述请求头判断与缓存名列表。

#### Scenario: 请求头判断有测试
- **WHEN** 运行项目的 `npm test`
- **THEN** 测试 MUST 覆盖"带 `Authorization`（含大小写不同的头名）判为凭证请求""不带则不是""头值为空字符串时的处理"

#### Scenario: 历史缓存名有测试
- **WHEN** 运行项目的 `npm test`
- **THEN** 测试 MUST 断言待清理的缓存名列表包含 `cross-origin` 与 `apis`，且不包含预缓存所用缓存名

### Requirement: Service Worker 文档与实际缓存策略一致

`docs/SERVICE_WORKER_GUIDE.md` MUST 描述本能力规定的行为：带 `Authorization` 的请求不缓存、升级时清理历史缓存，并 MUST NOT 保留与实际策略相矛盾的描述。

#### Scenario: 文档说明凭证请求不缓存
- **WHEN** 开发者阅读 `docs/SERVICE_WORKER_GUIDE.md` 的缓存策略部分
- **THEN** 文档 MUST 说明带 `Authorization` 的请求只走网络，并说明历史缓存会在 Service Worker 激活时清理

#### Scenario: 文档不再有矛盾表述
- **WHEN** 开发者查看文档中的策略对照表
- **THEN** 表中 MUST NOT 把"API"整体笼统标为 NetworkOnly，而 MUST 区分带凭证请求与公共请求
