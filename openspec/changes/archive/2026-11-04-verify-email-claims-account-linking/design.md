# Design

## Context

见 `proposal.md`。当前系统采用 NextAuth JWT Session 策略结合 MongoDB 适配器。在 `pages/api/auth/[...nextauth].js` 中注册了 Google、Twitter、GitHub 与多租户 Azure AD。当前通过全局配置：
```javascript
const emailAccountLinking = {
  allowDangerousEmailAccountLinking: true,
};
```
当第三方 Provider 返回的 `profile.email` 命中现有 MongoDB `users` 表中的记录时，NextAuth 的底层 `callback-handler` 会无条件调用 `linkAccount` 将该 Provider 绑定至现有用户。为杜绝恶意多租户伪造邮箱导致账户被冒用，需在 OAuth 回调生命周期的 `callbacks.signIn` 阶段介入防护。

## Goals / Non-Goals

**Goals:**
- 在 `callbacks.signIn({ user, account, profile })` 中拦截非法跨平台邮箱合并。
- 提取并校验各 Provider 的权威声明：
  - Google: `profile.email_verified === true`。
  - Azure AD: 使用 `jsonwebtoken.decode(account.id_token)`，严格校验 `xms_edov === true` 或 `email_verified === true`。
  - GitHub: 利用 `account.access_token` 查询 GitHub `/user/emails` 校验目标邮箱是否标记为 `verified: true`，仅在权威验证时放行。
  - Twitter: 不具备多租户防伪验证凭据，默认禁止隐式跨平台邮箱合并。
- 保证已绑定用户登录的连贯性，如果当前 `provider` + `providerAccountId` 已经与现有账号建立关联，则直接放行。
- 提供清晰的单测验证用例，涵盖正常多租户域名验证、伪造租户伪造邮箱拦截以及 Google 账号合并流程。

**Non-Goals:**
- 不重构前端账户管理 UI（暂不实现前端可视化解绑和手动显式绑定交互面板）。
- 不更改 MongoDB `accounts` 和 `users` 的现有集合结构。

## Decisions

### 1. 采用 `callbacks.signIn` 作为第一道防线
- **决策**: 在 NextAuth 的 `callbacks.signIn` 执行合并拦截，如果发现企图合并至已有用户且 Provider 凭据未验证，返回 `false`（或拒绝重定向 URL）。
- **理由**: `signIn` 发生在 NextAuth 真正调用 `adapter.getUserByEmail` 和 `adapter.linkAccount` 之前。在此拦截既不会产生脏数据，又不会破坏 NextAuth 内部状态。
- **替代方案**:
  - *方案 B (修改 Provider 配置)*: 将 `allowDangerousEmailAccountLinking` 设为 `false`。缺点是一刀切导致所有正当用户（如用户分别用合法的 Google 和经过验证的微软工作账号）无法无缝同步登录，体验较差。
  - *修改 Adapter*: 在 `adapter.linkAccount` 中抛错。缺点是 NextAuth 可能会捕获异常产生不可预期的状态，且 `linkAccount` 缺少完整的 `account.id_token` 和 `profile` 上下文。

### 2. 区分“首次账号合并”与“已有凭据二次登录”
- **决策**:
  1. 通过 `adapter.getUserByAccount({ provider: account.provider, providerAccountId: account.providerAccountId })` 检查当前 Provider 是否已经绑定。
  2. 若已绑定，直接返回 `true`。
  3. 若未绑定，检查系统中是否存在 `adapter.getUserByEmail(email)`。
  4. 若存在同邮箱用户（即本次登录会触发跨 Provider 账号合并），则调用 `isProviderEmailVerified(account, profile)` 检验声明合法性；若验证失败，拒绝登录。
- **理由**: 避免已合法绑定的账号在后续登录时因为某些 Provider 偶发缺少某些 claim 而无法登入。

### 3. 解码 `account.id_token` 提取 Azure 专属声明
- **决策**: 对 `account.id_token` 执行 `jwt.decode`（利用项目已有的 `jsonwebtoken` 库），读取其中的 `xms_edov` 和 `email_verified`。
- **理由**: NextAuth 的 Azure AD 默认 Provider profile 经过了内部转换裁剪，丢失了 `id_token` 原生 claims；而 `account.id_token` 保留了未经裁剪的 OIDC ID 令牌荷载。

### 4. 针对 GitHub 缺少 ID Token 时的邮箱权威验证
- **决策**: 当 GitHub 账号触发跨平台邮箱合并（`account.provider === "github"`）时，使用 `account.access_token` 调用 GitHub API `GET https://api.github.com/user/emails`。遍历返回的邮箱对象数组，检查目标登录邮箱是否具备 `verified === true`。若不存在或 `verified` 不为 `true`，坚决拒绝合并。
- **理由**: NextAuth 内置的 GitHub Provider 只挑选 primary 邮箱，并未把 `verified` 状态挂载至用户 profile 上。为了防止攻击者在 GitHub 添加未经验证的受害者邮箱发起撞库接管（Pre-Account Takeover / Takeover），必须通过官方接口核实归属权。

## Risks / Trade-offs

- **[Risk] Azure AD App Registration 未正确配置 optional claims**
  → **Mitigation**: 组织管理员若未在 Azure 门户勾选 `xms_edov` 和 `email`，登录时会导致验证失败。在系统日志中打印清晰的 warning，提示缺少可选声明并说明排查步骤。
- **[Risk] 个人微软账号 (MSA) 的 claims 差异**
  → **Mitigation**: MSA 个人账号可能不带有 `xms_edov`（该声明主要针对 Entra 验证域名）。对于个人微软账号，若包含 `email_verified: true` 亦可安全视作验证通过。
