# Tasks

## 1. 验证器与门禁核心逻辑实现

- [x] 1.1 在 `utils/authVerification.js` 中实现 Provider 邮箱验证状态提取函数 `isProviderEmailVerified(account, profile)`，支持 Google 的 `email_verified`、Azure AD `id_token` 的 `xms_edov` 与 `email_verified`，以及 GitHub 通过 `access_token` 校验 `/user/emails` 的 `verified` 状态，并通过原生测试验证各 Provider 分支
- [x] 1.2 在 `pages/api/auth/[...nextauth].js` 的 `callbacks.signIn` 中接入验证拦截逻辑：区分已有 Provider 绑定直接放行，跨账号合并前校验 `isProviderEmailVerified`，未通过验证拒绝登录，并使用 `npm run test` 验证登录门禁测试

## 2. 自动化测试与用例编写

- [x] 2.1 在 `test/authVerification.test.js` 中编写针对各 Provider（Google 验证与未验证、Azure AD 带 `xms_edov`/`email_verified` 及伪造租户场景、GitHub 已验证/未验证邮箱、Twitter）的单元测试，运行 `node --test test/authVerification.test.js` 确保全部通过
- [x] 2.2 在 `test/authSignInCallback.test.js` 中模拟 NextAuth `signIn` 回调，验证当数据库已存在该邮箱用户时，伪造 Azure AD 租户被拦截、合法 Google/Azure 账号正常放行，运行 `node --test test/authSignInCallback.test.js` 确保全部通过

## 3. 审计日志与环境适配

- [x] 3.1 在 `pages/api/auth/[...nextauth].js` 中完善安全告警与调试日志（开发模式记录 Azure ID Token 校验详情，拦截攻击时输出 `[Security Alert]` 告警日志），通过运行并检查日志输出完成验证
