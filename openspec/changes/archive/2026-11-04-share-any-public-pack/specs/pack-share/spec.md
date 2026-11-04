## REMOVED Requirements

### Requirement: 访客没有 Share

**Reason**: 公开 Pack 的详情已经对所有人开放，分享应跟随可见性，而不是跟随是否为主人。
**Migration**: 非主人在 `visibility` 为 `public` 的 Pack 上使用「公开 Pack 上任何人都能分享」。`visibility` 不是 `public` 时，非主人仍然看不到 Share 和 More。主人的操作行、More，以及私有 Pack 的公开门槛保持不变。

## ADDED Requirements

### Requirement: 公开 Pack 上任何人都能分享

任何打开 `visibility` 为 `public` 的 Pack 详情的人（含未登录访客，以及已登录但不是该 Pack 主人的用户）MUST 在点赞之后看到 Share。Share MUST 只展示分享图标，MUST NOT 展示可见文案 `Share`，且 MUST 提供可访问名称 `Share`。非主人的操作行 MUST 依次为 Install、Add to my packs、点赞、Share，且 MUST NOT 展示 More。

该分享面板 MUST 按此顺序提供五个可激活渠道：X (Twitter)、Facebook、LinkedIn、Copy link、Copy Markdown Badge。面板 MUST NOT 展示 `Make this pack public to share`，MUST NOT 修改该 Pack 的 `visibility`。Copy link 与 Copy Markdown Badge 的复制结果 MUST 与主人在同一站点源上对该公开 Pack 复制的结果一致。激活这些渠道 MUST NOT 要求登录。

`visibility` 不是 `public` 时，非主人 MUST NOT 看到 Share，MUST NOT 看到 More。

#### Scenario: 未登录访客在公开 Pack 上看到 Share

- **WHEN** 未登录访客打开一个 `visibility` 为 `public` 的 Pack 详情
- **THEN** 操作行 MUST 依次为 Install、Add to my packs、点赞、Share，且 MUST NOT 展示 More

#### Scenario: 已登录的非主人在公开 Pack 上看到 Share

- **WHEN** 已登录且不是该 Pack 主人的用户打开一个 `visibility` 为 `public` 的 Pack 详情
- **THEN** 操作行 MUST 依次为 Install、Add to my packs、点赞、Share，且 MUST NOT 展示 More

#### Scenario: 非主人打开公开 Pack 的分享面板

- **WHEN** 非主人激活该公开 Pack 的 Share
- **THEN** X (Twitter)、Facebook、LinkedIn、Copy link、Copy Markdown Badge MUST 都可激活，且面板 MUST NOT 展示 `Make this pack public to share`

#### Scenario: 非主人复制公开 Pack 的链接

- **WHEN** 非主人在站点源 `https://winstall.app` 上，对公开标识为 `cJL66qrefbvuG1U7_fZ-h` 的公开 Pack 激活 Copy link，且写入剪贴板成功
- **THEN** 剪贴板 MUST 为 `https://winstall.app/packs/cJL66qrefbvuG1U7_fZ-h`

#### Scenario: 非主人复制同一行徽章

- **WHEN** 非主人在站点源 `https://winstall.app` 上，对公开标识为 `cJL66qrefbvuG1U7_fZ-h` 的公开 Pack 激活 Copy Markdown Badge，且写入剪贴板成功
- **THEN** 剪贴板 MUST 为 `[![Open in winstall](https://winstall.app/badge.svg)](https://winstall.app/packs/cJL66qrefbvuG1U7_fZ-h)`

#### Scenario: 非主人打开非公开 Pack

- **WHEN** 非主人打开一个 `visibility` 不是 `public` 的 Pack 详情
- **THEN** 页面 MUST NOT 展示 Share 或 More
