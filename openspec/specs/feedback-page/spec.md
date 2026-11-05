# feedback-page Specification

## Purpose

让访问者在独立页面写下一条问题、建议或其它说明，并提交到 winstall-api 的只写反馈接口。入口放在页脚，提交成功后只确认已收到，不提供列表或回复。

## Requirements

### Requirement: 反馈页位于 /feedback

系统 MUST 在 `/feedback` 提供反馈页。页面 MUST 有标题 `Share your feedback`，以及说明 `Help us make Winstall better. We read every message and use your feedback to improve the experience.` 页面 MUST 提供三选一类型，可见文案为 `Bug report`、`Suggestion`、`Other`，打开页面时 MUST 已选中 `Bug report`。页面 MUST 提供一段可含换行的正文输入，并显示已输入长度与上限 `2000`。输入 MUST NOT 超过 2000 个字符。处理后正文为空时，提交按钮 MUST 不可用。提交按钮可见文案 MUST 为 `Send feedback`。打开该页 MUST NOT 要求登录，MUST NOT 弹出登录层。地址栏查询参数 MUST NOT 预填类型或正文。

#### Scenario: 打开反馈页

- **WHEN** 访问者打开 `/feedback`
- **THEN** 页面显示标题 `Share your feedback`、上述说明、三个类型且 `Bug report` 已选中、正文输入、长度计数和 `Send feedback`，且不要求登录

#### Scenario: 查询参数不预填表单

- **WHEN** 访问者打开 `/feedback?from=/apps/VideoLAN.VLC`
- **THEN** 类型仍是默认的 `Bug report`，正文为空

### Requirement: 页脚进入反馈页

使用站点页脚的页面 MUST 含有文案为 `Feedback`、指向 `/feedback` 的链接。主导航 MUST 仍只有 Discover、Apps、Essentials、Packs，MUST NOT 出现 `Feedback`。已登录用户的账户菜单 MUST NOT 含有 `Feedback`。静态 sitemap MUST NOT 包含 `/feedback`。404 页面 MUST NOT 含有指向 `/feedback` 的链接。About 页上 `Report a Bug` 的地址 MUST 仍为 `https://github.com/SplashtopInc/winstall/issues/new`。

#### Scenario: 页脚打开反馈页

- **WHEN** 访问者在带有站点页脚的页面激活 `Feedback`
- **THEN** 浏览器打开 `/feedback`

#### Scenario: 主导航与账户菜单没有反馈

- **WHEN** 访问者查看主导航，或已登录用户打开账户菜单
- **THEN** 其中没有 `Feedback`

#### Scenario: 静态 sitemap 不含反馈页

- **WHEN** 静态 sitemap 生成
- **THEN** 其中没有 `/feedback`

#### Scenario: 404 没有反馈入口

- **WHEN** 访问者打开不存在的页面并看到 404
- **THEN** 该页没有指向 `/feedback` 的链接

#### Scenario: About 的 GitHub 报错入口不变

- **WHEN** 访问者打开 `/about`
- **THEN** `Report a Bug` 仍指向 `https://github.com/SplashtopInc/winstall/issues/new`

### Requirement: 提交一条反馈

访问者选定一个类型并写有正文后激活 `Send feedback` 时，浏览器 MUST 发送 `POST /feedbacks`。JSON 正文 MUST 只含 `category` 与 `message`。`category` MUST 为 `bug`、`suggestion`、`other` 之一，分别对应 `Bug report`、`Suggestion`、`Other`。`message` MUST 为正文经下述处理后的结果：先删除 U+0000–U+0008、U+000B–U+001F、U+007F、U+0080–U+009F、U+200B、U+200C、U+200D、U+202A–U+202E、U+2060、U+2066–U+2069、U+FEFF，再 trim。U+0009 与 U+000A MUST 保留。长度按 JavaScript 字符串长度计算。请求 MUST NOT 包含 `userId`、`contact`、`appId`、`createdAt` 或页面路径。系统 MUST NOT 请求 `GET /feedbacks`。

未登录时，该请求 MUST NOT 带 `Authorization`。已登录且 session API JWT 未过期时，该请求 MUST 带 `Authorization: Bearer`，值为该 JWT。已登录但 JWT 缺失或已过期时，该请求 MUST NOT 带 `Authorization`，且 MUST NOT 为这次提交刷新 session。session 尚未就绪时，`Send feedback` MUST 不可用，MUST NOT 发出 `POST /feedbacks`。请求进行中时，`Send feedback` MUST 不可用，MUST NOT 发出第二次 `POST /feedbacks`。成功与失败的结果 MUST 用站点现有的底部提示条显示，MUST NOT 写在表单里。

#### Scenario: 未登录提交建议

- **WHEN** 未登录访问者选择 `Suggestion`，正文为 `add filters`，并激活 `Send feedback`
- **THEN** 浏览器发送 `POST /feedbacks`，JSON 为 `{ "category": "suggestion", "message": "add filters" }`，且不带 `Authorization`

#### Scenario: 有效令牌带上身份

- **WHEN** 已登录访问者的 session API JWT 未过期，选择 `Bug`，正文为 `installer failed`，并激活 `Send feedback`
- **THEN** `POST /feedbacks` 的 JSON 为 `{ "category": "bug", "message": "installer failed" }`，且 `Authorization` 为该 JWT 的 Bearer

#### Scenario: 过期令牌按匿名提交

- **WHEN** 访问者仍处于登录状态，但 session API JWT 已过期或缺失，并提交一条合法反馈
- **THEN** `POST /feedbacks` 不带 `Authorization`，且这次提交没有刷新 session

#### Scenario: 换行保留且零宽字符不入请求

- **WHEN** 访问者选择 `Other`，正文在 `line1` 与 `line2` 之间为换行，并在两词之间含有 U+200B，然后激活 `Send feedback`
- **THEN** 请求里的 `message` 含有该换行，且不含该 U+200B

#### Scenario: session 未就绪时不能发送

- **WHEN** 访问者打开 `/feedback`，session 尚未就绪
- **THEN** `Send feedback` 不可用，且浏览器没有发出 `POST /feedbacks`

### Requirement: 提交前拒绝无效内容

未选类型、处理后正文为空，或处理后长度超过 2000 时，系统 MUST NOT 发送 `POST /feedbacks`。处理后正文为空时提交按钮 MUST 不可用。输入框 MUST NOT 接受超过 2000 个字符，系统 MUST NOT 把超长正文截断后提交。若请求仍被拦住，已输入内容 MUST 保留，页面 MUST 显示错误。

#### Scenario: 未选类型不发送

- **WHEN** 访问者未选类型，正文为 `installer failed`，并激活 `Send feedback`
- **THEN** 浏览器没有发出 `POST /feedbacks`，正文仍在

#### Scenario: 空白正文不发送

- **WHEN** 访问者选择 `Bug`，正文只有空白，并激活 `Send feedback`
- **THEN** 浏览器没有发出 `POST /feedbacks`

#### Scenario: 超过 2000 字不发送

- **WHEN** 访问者选择 `Bug`，处理后的正文长度为 2001，并激活 `Send feedback`
- **THEN** 浏览器没有发出 `POST /feedbacks`，且请求体没有被截成 2000 字

### Requirement: 成功只确认收到

`POST /feedbacks` 返回 201 时，系统 MUST 保留表单，清空正文，类型回到 `Bug report`，并显示 `Thanks for helping us improve Winstall!`。页面 MUST NOT 展示响应中的 `id`。页面 MUST NOT 提供反馈列表、回复或处理进度。

#### Scenario: 收到 201

- **WHEN** `POST /feedbacks` 返回 201，JSON 为 `{ "id": "abc123" }`
- **THEN** 表单仍在，正文已清空，页面显示 `Thanks for helping us improve Winstall!`，且不出现 `abc123`

### Requirement: 失败时留下草稿

`POST /feedbacks` 返回 400、429、401、500，或请求失败时，系统 MUST 保留已选类型和正文，MUST NOT 显示 `Thanks for helping us improve Winstall!`。400 与 429 MUST 在提示条中显示响应 JSON 的 `error`。500 与请求失败 MUST 在提示条中显示 `Something went wrong. Please try again.` 页面 MUST NOT 说明这条反馈是否记在账号上。页面 MUST NOT 提供把当前路径写入正文的控件。

#### Scenario: 请求过多

- **WHEN** `POST /feedbacks` 返回 429，JSON 为 `{ "error": "Too many feedback requests." }`
- **THEN** 类型和正文仍在，页面显示 `Too many feedback requests.`，且不显示 `Thanks for helping us improve Winstall!`

#### Scenario: 服务失败

- **WHEN** `POST /feedbacks` 返回 500
- **THEN** 类型和正文仍在，页面表明这条反馈没有送出

#### Scenario: 页面不收集当前路径

- **WHEN** 访问者停留在 `/feedback`
- **THEN** 页面没有把当前路径写入正文的控件
