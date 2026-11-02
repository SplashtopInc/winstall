# Proposal

## Why

当前系统在 NextAuth 中配置了多第三方 OAuth 登录（包括 Google、Twitter、GitHub 以及使用多租户 `common` 的 Azure AD），并且对所有 Provider 开启了 `allowDangerousEmailAccountLinking: true`。在多租户 Azure AD 场景下，外部租户管理员可以任意伪造租户内用户的 `email` 声明。当攻击者以受害者的邮箱通过自己的 Azure 租户登录时，系统会将其自动与受害者已有账号绑定，从而造成账户被恶意接管的高危安全漏洞。同理，未经权威验证的其它第三方邮箱也会带来撞库合并风险。为了防止身份冒用，必须在跨 Provider 账号合并时建立基于权威声明（如 Google 的 `email_verified`、Azure Entra 的 `xms_edov` / `email_verified`）的防护门禁。

## What Changes

- **跨 Provider 邮箱验证声明校验器**：建立统一的 Provider 邮箱验证校验规则，识别各 Provider 的合法验证凭证：
  - Google Provider：要求 `profile.email_verified === true`。
  - Azure AD (Microsoft Entra) Provider：解码 `account.id_token`，要求 `xms_edov === true` 或 `email_verified === true`。
  - GitHub Provider：针对跨平台邮箱合并，若无直接验证标记，通过其 `access_token` 查询 GitHub API (`/user/emails`) 校验目标邮箱的 `verified === true` 状态，未经验证一律拒绝合并。
  - Twitter Provider：不具备权威邮箱归属权凭据，禁止隐式跨平台邮箱合并。
- **OAuth 登录安全门禁拦截 (`callbacks.signIn`)**：
  - 在 OAuth 登录阶段，若用户尝试通过相同邮箱合并至系统中已存在的用户账号，必须先通过上述验证校验；未通过验证的合并请求予以拒绝并重定向至安全错误提示，杜绝未经验证的第三方身份接管已有账户。
  - 已存在的绑定账号（通过 `provider` + `providerAccountId` 直接命中已有账户）正常放行，不受跨平台邮箱合并门禁阻断。
- **安全日志与调试支持**：在开发和运行环境中，对阻止的未验证合并行为记录告警日志，并在 Azure 登录时记录解析出的 ID Token 关键验证声明，便于运维审计与问题排查。

## Capabilities

### New Capabilities
- `oauth-account-linking`: 规范 OAuth 登录时的跨 Provider 账号合并安全策略与凭证验证要求，确保只有持有权威机构所有权验证（如 `email_verified`、`xms_edov`）的凭证才允许合并到既有系统账号。

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation). -->

## Impact

- **受影响代码**：
  - `pages/api/auth/[...nextauth].js`：更新 NextAuth 回调配置，新增 Provider 邮箱校验逻辑，在 `signIn` 回调中加入跨平台合并检查。
  - `lib/authAdapter.js`：配合提供基于邮箱和凭证的安全查询或保持原有接口。
- **依赖与协议**：
  - 继续使用现有的 `jsonwebtoken` 进行 `account.id_token` 解码。
  - 需确保 Azure AD App Registration 的 Token Configuration 已配置好 `email` 和 `xms_edov` 可选声明。
- **用户体验**：
  - 拥有合法权威域名的企业或学校微软账号（带 `xms_edov`）以及 Google 账号可无感自动合并。
  - 试图利用未经所有权验证的域名或外部租户伪造邮箱的登录将被阻断，保障账户资产安全。
