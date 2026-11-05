# public-pack-limit Specification

## Purpose

按当前登录用户是否为配置的运营账号，决定创建 Pack 与把 Pack 设为 public 时的公开名额。运营账号可以公开到 200 个，其他用户仍是 10 个。

## Requirements

### Requirement: 公开名额按运营账号区分

系统 MUST 用运行时配置 `PACK_TRENDING_OWNER_USER_ID` 去掉首尾空白后的值作为运营账号 id。该值未设置或去掉空白后为空时，系统 MUST 把所有用户的公开名额当作 10，MUST NOT 把空配置当成某个用户 id。当前登录用户的公开 id 与该运营账号 id 全等时，公开名额 MUST 为 200。其他已登录用户的公开名额 MUST 为 10。公开数量 MUST 只计该用户自己的、`visibility` 为 `public` 的 Pack。系统 MUST NOT 因本规则调用新的接口，MUST NOT 改变 `POST /packs` 或 `PATCH /packs/:id` 的请求体。

#### Scenario: 运营账号的名额是 200

- **WHEN** `PACK_TRENDING_OWNER_USER_ID` 去掉首尾空白后为 `ops-user`，且当前用户公开 id 为 `ops-user`
- **THEN** 该用户的公开名额为 200

#### Scenario: 配置两侧空白仍对上运营账号

- **WHEN** `PACK_TRENDING_OWNER_USER_ID` 的值是 `  ops-user  `，且当前用户公开 id 为 `ops-user`
- **THEN** 该用户的公开名额为 200

#### Scenario: 其他用户的名额仍是 10

- **WHEN** `PACK_TRENDING_OWNER_USER_ID` 去掉首尾空白后为 `ops-user`，且当前用户公开 id 为 `someone-else`
- **THEN** 该用户的公开名额为 10

#### Scenario: 未配置运营账号时人人都是 10

- **WHEN** `PACK_TRENDING_OWNER_USER_ID` 未设置或去掉空白后为空，且当前用户已登录
- **THEN** 该用户的公开名额为 10

### Requirement: 创建与分享的公开勾选使用同一名额

创建 Pack 的弹窗，以及主人把尚未 public 的 Pack 设为 public 的分享勾选，MUST 使用上一要求中的公开名额。当前 public 数量小于该名额时，公开勾选 MUST 可用。当前 public 数量大于或等于该名额，且正在编辑或分享的 Pack 还不是 public 时，公开勾选 MUST 不可用，提示 MUST 为 `Public pack limit reached (N). Unpublish or delete a pack to continue.`，其中 `N` MUST 为该用户的公开名额。该 Pack 已经是 public 时，公开勾选 MUST 保持可用，即使 public 数量已经达到名额。名额未满时，创建弹窗的提示 MUST 仍为 `Appears in the public App Packs directory for anyone to discover.`，分享勾选的提示 MUST 仍为 `Anyone with the link will be able to view this pack.`。私有 Pack 的创建与编辑 MUST 不受该名额阻止。

#### Scenario: 运营账号在 10 个 public 之后仍可再公开

- **WHEN** 运营账号已有 10 个 public Pack，并打开创建弹窗或一个尚未 public 的自有 Pack 的分享面板
- **THEN** 公开勾选可用，且提示不是名额已满

#### Scenario: 运营账号达到 200 个后不能再公开

- **WHEN** 运营账号已有 200 个 public Pack，并打开创建弹窗或一个尚未 public 的自有 Pack 的分享面板
- **THEN** 公开勾选不可用，且提示为 `Public pack limit reached (200). Unpublish or delete a pack to continue.`

#### Scenario: 普通用户达到 10 个后不能再公开

- **WHEN** 非运营账号已有 10 个 public Pack，并打开创建弹窗或一个尚未 public 的自有 Pack 的分享面板
- **THEN** 公开勾选不可用，且提示为 `Public pack limit reached (10). Unpublish or delete a pack to continue.`

#### Scenario: 已经公开的 Pack 不受名额拦截

- **WHEN** 用户的 public 数量已经达到其名额，并编辑或分享一个 `visibility` 为 `public` 的自有 Pack
- **THEN** 公开勾选保持可用

#### Scenario: 名额未满时提示保持原句

- **WHEN** 用户的 public 数量小于其名额，并打开创建弹窗
- **THEN** 提示为 `Appears in the public App Packs directory for anyone to discover.`
