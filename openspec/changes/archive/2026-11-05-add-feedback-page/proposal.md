## Why

用户在页面上遇到问题或想提建议时，只能去 GitHub 提 issue，或在 About、Help 里读说明。winstall-api 已经提供只写的 `POST /feedbacks`，站上还没有把这段话交到本站的入口。

## What Changes

- 新增页面 `/feedback`：三选一类型（Bug、Suggestion、Other，对应 `bug`、`suggestion`、`other`）和一段最长 2000 字的正文，提交到 `POST /feedbacks`。
- 页脚增加 `Feedback`，链到 `/feedback`，与 About、Help 并列。主导航、用户菜单、sitemap 不增加该入口。About 上指向 GitHub 的 Report a Bug 保持不变。404 不加页脚，也不在错误卡上加链接。
- 未登录，或已登录但 API JWT 缺失、过期时，请求不带认证头，按匿名提交。令牌仍有效时附带 Bearer，由接口记下用户。页面不收集当前路径，不提供把路径写进正文的操作。
- 成功后表单留在页面上，正文清空，显示 `Thanks for helping us improve Winstall!`。不展示返回的 id，站内没有反馈列表、回复或处理进度。

## Capabilities

### New Capabilities

- `feedback-page`: 反馈页的表单、提交身份、成功与失败表现，以及页脚入口的范围。

### Modified Capabilities

无。

## Impact

- **页面与入口**：新增 `pages/feedback.js`；`components/Footer.js` 增加指向 `/feedback` 的链接。`components/Nav.js`、`components/UserMenu.js`、`pages/404.js`、`pages/about.js`、`pages/sitemap-static.xml.js` 的现有入口保持不变。
- **接口**：浏览器调用已有 `POST /feedbacks`。请求体只有 `category` 与 `message`。有效 session API JWT 时带 `Authorization: Bearer`，否则省略该头。
- **客户端**：`utils/fetchWinstallAPI.js` 需要把该写入识别为可选用户 JWT，避免把过期令牌发给接口（过期 Bearer 会得到 401 且不入库）。
