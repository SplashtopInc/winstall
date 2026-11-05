## 1. 请求体与身份头

- [x] 1.1 新增 `utils/optionalUserJwt.js`，导出路径判断和「session 是否产出 Bearer」的纯函数。`POST /feedbacks` 判定为可选用户 JWT。未过期的 `apiToken` 返回 `Authorization: Bearer`；令牌缺失或过期返回空头。
- [x] 1.2 修改 `utils/fetchWinstallAPI.js`：`prefersOptionalUserJwt` 与 `authHeaders` 改用上述函数。`POST /feedbacks` 不进入 `requiresUserJwt`，401 时不重新获取 session。调用方不自行设置 `Authorization`。
- [x] 1.3 新增 `utils/feedbackApi.js`：按规格删除不可见字符并 trim，导出规范化函数；`submitFeedback` 只向 `POST /feedbacks` 发送 `category` 与 `message`，`Content-Type` 为 `application/json`。
- [x] 1.4 新增 `test/optionalUserJwt.test.js` 与 `test/feedbackApi.test.js`。覆盖可选 JWT、过期令牌无 Bearer、空白与超过 2000 字、零宽字符删除、换行保留。运行 `node --test test/optionalUserJwt.test.js test/feedbackApi.test.js`。

## 2. 反馈页

- [x] 2.1 新增 `pages/feedback.js` 与 `styles/feedback.module.scss`。用 `getDocumentShellStaticProps` 做静态壳，并渲染 `components/Footer.js`。页面含标题 `Share your feedback`、指定说明、`Bug report` / `Suggestion` / `Other` 单选、多行正文、`n / 2000` 计数和 `Send feedback`。不设 `noindex`，不使用弹层。
- [x] 2.2 在 `pages/feedback.js` 接上提交。session 未就绪、正文为空或请求进行中时禁用 `Send feedback`。未选类型或处理后超过 2000 时不发请求并保留输入。输入不超过 2000 个字符。201 后表单仍在，正文清空，用站点底部提示条显示 `Thanks for helping us improve Winstall!`，不展示 `id`。400 与 429 在提示条显示响应 `error`；401、500 和网络失败保留草稿并在提示条显示 `Something went wrong. Please try again.`。页面不说明反馈是否记在账号上。不读取查询参数预填，不提供把当前路径写入正文的控件。

## 3. 页脚入口

- [x] 3.1 修改 `components/Footer.js`：在 Help 之后增加文案 `Feedback`、指向 `/feedback` 的链接。Compare、About、GitHub、Privacy、Help 的顺序保持不变。
- [x] 3.2 确认 `components/Nav.js`、`components/UserMenu.js`、`pages/404.js`、`pages/about.js` 不新增反馈入口，且 About 的 `Report a Bug` 仍指向 `https://github.com/SplashtopInc/winstall/issues/new`。确认 `pages/sitemap-static.xml.js` 的路径列表不含 `feedback`。

## 4. 验证

- [x] 4.1 运行 `npm test`。
- [x] 4.2 在浏览器中从带页脚的页面打开 `/feedback`，确认表单、身份说明和本地校验。打开 `/about` 确认 `Report a Bug` 仍去 GitHub，打开一个不存在的地址确认 404 没有指向 `/feedback` 的链接。
