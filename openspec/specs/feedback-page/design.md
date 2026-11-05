## Context

见 `proposal.md` 的 Why。winstall-api 的 `POST /feedbacks` 已上线：只接受 `category`（`bug`、`suggestion`、`other`）和 `message`（规范化并 trim 后 1–2000 字），成功返回 `201` 与 `{ id }`，多余字段忽略。无认证头按匿名写入；Bearer 无效或过期则 `401` 且不入库。同一 IP 每 60 分钟最多 10 次，超出为 `429`。没有读取接口。

本站浏览器经 `utils/fetchWinstallAPI.js` 直连该 API。`requiresUserJwt` 会在持有 `apiToken` 时附带 Bearer，并在 `401` 时再取一次 session。`prefersOptionalUserJwt` 只在 `isApiTokenFresh` 为真时附带 Bearer，且不会因 `401` 重试。页脚由各内容页或 `components/PageWrapper.js` 渲染；`pages/404.js` 不使用页脚。主导航在 `components/Nav.js`，账户菜单在 `components/UserMenu.js`。

## Goals / Non-Goals

**Goals:**

- 用文档页而不是对话框承载 2000 字正文，避免和底部选择条叠层。
- 身份头只走「可选且未过期」这条现成路径，过期令牌不会被发出，也不会为这次提交刷新 session。
- 客户端提交前使用与接口相同的不可见字符删除和 trim，请求体里的 `message` 就是计数所用的字符串。

**Non-Goals:**

- 不改 winstall-api，不增加页面路径、联系方式或 `appId` 字段。
- 不把反馈做成 `react-modal` 弹层。
- 不在 404、主导航、账户菜单或静态 sitemap 增加入口。
- 不把 About 的 GitHub `Report a Bug` 改到本页。

## Decisions

### 1. 独立页面 `/feedback`

**选择：** 新增 `pages/feedback.js`，经 `getDocumentShellStaticProps` 做静态壳，版式沿用 About 的窄栏：标题、说明、表单、`components/Footer.js`。样式放在 `styles/feedback.module.scss`。

**备选：** 页脚点击后在当前页开弹层，地址不变。2000 字文本域在弹层里难滚动，且站点在有已选应用时会抬高页脚和选择条。弹层因此放下。

页面不设 `noindex`。静态 sitemap 排除 `/feedback` 即可，页脚链接仍可打开该页。

### 2. 可选 JWT，过期则匿名

**选择：** 在 `prefersOptionalUserJwt` 中把 `POST /feedbacks` 视为可选用户 JWT。不放入 `requiresUserJwt`，因此不会附带过期 Bearer，也不会在 `401` 时调用 `getBrowserSession()` 重试。调用方不自己设置 `Authorization`，避免过期令牌从调用方头里漏出去。

session 状态为 `loading` 时禁用 `Send feedback`。就绪后，未过期令牌在提交时由上述路径附带 Bearer；未登录、令牌缺失或过期则不带认证头。页面不说明这条反馈是否记在账号上。

**备选：** 过期时先 `getSession()` 换新 JWT 再提交。用户已决定这次按匿名发送，不刷新。

把「路径是否可选 JWT」和「给定 session 是否产出 Bearer」抽成可单测的纯函数，供 `authHeaders` 使用。避免只在闭包里改条件、测试碰不到过期令牌这条路径。

### 3. 提交体在客户端先规范化

**选择：** `utils/feedbackApi.js` 的 `submitFeedback` 只接受 `category` 与 `message`，`POST /feedbacks`，`Content-Type: application/json`。发送前按规格删除同一组不可见字符并 trim。页面用同一结果做空值判断、2000 字上限和计数（`n / 2000`）。类型用单选，值为 `bug`、`suggestion`、`other`，文案为 `Bug report`、`Suggestion`、`Other`，打开页面时选中 `Bug report`。正文输入不超过 2000 个字符。处理后为空时 `Send feedback` 不可用。

未选类型或处理后超过 2000，停在页面上，不发请求。201 后表单留在页面上，正文清空，类型回到 `Bug report`，用站点底部提示条显示 `Thanks for helping us improve Winstall!`，不渲染 `id`。请求进行中只禁用按钮。400 与 429 在提示条里展示响应的 `error`。401、500 和网络失败保留草稿，并在提示条里显示 `Something went wrong. Please try again.`。

页面不读取 `router.query` 来预填，也不提供写入当前路径的按钮。

### 4. 页脚最后一项

**选择：** 在 `components/Footer.js` 的链接列表末尾、Help 之后增加 `Feedback` → `/feedback`。Compare、About、GitHub、Privacy、Help 的现有顺序不动。

## Risks / Trade-offs

- **[Risk] 人还显示为登录，记录却是匿名** → 说明文字按将要发出的请求来写，不按头像是否出现来写。
- **[Risk] 客户端与接口的不可见字符规则漂移，长度判断和入库正文不一致** → 删除的码位与 `POST /feedbacks` 的规格同一份，并给零宽字符和换行各留一条单测。
- **[Risk] 以后把 `/feedbacks` 放进 `requiresUserJwt`，过期令牌重新导致 401** → 单测锁定：该路径是可选 JWT；过期 session 不产生 `Authorization`；401 不触发 session 重取。
- **[Risk] 页脚多一条链接后，窄屏上换行变挤** → 沿用现有列表，不新做一排按钮。

## Migration Plan

先上页面和页脚链接。回退时去掉这两处即可。已经写入 `user_feedbacks` 的记录留在 API，本站没有删除接口。
