# oauth-account-linking Specification

## Purpose

规范 OAuth 第三方登录过程中的账号合并（Account Linking）安全门禁机制，防止外部未经验证或恶意伪造的邮箱声明接管系统已有用户账号。

## Requirements

### Requirement: Verified email claims enforcement on account linking
当用户通过第三方 OAuth Provider 进行登录，且该 Provider 返回的邮箱地址匹配到系统中已存在的用户时，系统 MUST 仅在 Provider 声明具有权威邮箱所有权验证时才允许将该第三方账号与既有用户合并。若 Provider 邮箱未经权威验证，系统 MUST 拒绝本次跨 Provider 账号合并。

#### Scenario: Existing user logs in with verified Google account
- **GIVEN** 系统中已存在邮箱为 `alice@example.com` 的用户
- **WHEN** 用户通过 Google OAuth 登录，且 Google 返回的 profile 中包含 `email: "alice@example.com"` 及 `email_verified: true`
- **THEN** 系统允许该第三方账号与既有用户账号合并并成功建立会话

#### Scenario: Existing user logs in with verified Azure AD domain ownership
- **GIVEN** 系统中已存在邮箱为 `bob@contoso.com` 的用户
- **WHEN** 用户通过多租户 Azure AD OAuth 登录，且其签发的 `id_token` 解码包含 `email: "bob@contoso.com"` 及 `xms_edov: true`
- **THEN** 系统允许该第三方账号与既有用户账号合并并成功建立会话

#### Scenario: Foreign tenant Azure AD user attempts unverified email linking
- **GIVEN** 系统中已存在邮箱为 `victim@example.com` 的用户
- **WHEN** 攻击者通过自建的 Azure AD 外部租户登录，其伪造的 `email` 为 `victim@example.com`，且 `id_token` 中 `xms_edov` 为 `false` 或缺失，且 `email_verified` 亦不为 `true`
- **THEN** 系统在登录回调阶段拒绝本次登录并阻断账号合并，绝不返回包含受害者 `publicId` 的会话

#### Scenario: Existing user links GitHub account with verified email
- **GIVEN** 系统中已存在邮箱为 `dev@example.com` 的用户
- **WHEN** 用户使用 GitHub OAuth 登录，其 GitHub 账号包含对应邮箱且在 GitHub 邮箱列表中标记为 `verified: true`
- **THEN** 系统通过验证并允许将该 GitHub 账号与既有用户合并

#### Scenario: Attacker attempts account takeover with unverified GitHub email
- **GIVEN** 系统中已存在邮箱为 `victim@example.com` 的用户
- **WHEN** 攻击者在 GitHub 上添加了未验证的 `victim@example.com` 并尝试登录系统
- **THEN** 系统在校验 GitHub 邮箱验证状态时发现该邮箱未经验证，拒绝本次登录并阻断跨账号合并

#### Scenario: Unverified provider attempts linking to existing account
- **GIVEN** 系统中已存在邮箱为 `charlie@example.com` 的用户
- **WHEN** 用户通过未提供受信任邮箱所有权证明的 Provider（如 Twitter）登录，且邮箱匹配到既有用户
- **THEN** 系统拒绝跨账号合并并重定向到安全错误页面提示无法自动关联

### Requirement: Existing linked provider account bypasses merge validation
当用户使用已与既有系统账号完成绑定的第三方 Provider 凭据（具有完全匹配的 `provider` 与 `providerAccountId`）再次登录时，系统 SHALL 正常允许登录并建立会话，无需重复执行邮箱合并的归属权校验。

#### Scenario: Previously linked provider signs in
- **GIVEN** 用户的系统账号数据库中已存在 `provider: "azure-ad"` 且 `providerAccountId: "azure-sub-123"` 的绑定记录
- **WHEN** 用户使用相同的 Azure AD 账号重新登录系统
- **THEN** 系统直接基于已绑定的 Provider 账号建立会话，不触发跨账号合并阻断逻辑
