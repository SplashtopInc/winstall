## 1. 导览文件

- [x] 1.1 按 `design.md` 的提纲新增 `public/llms.txt`：英文 Markdown，一级标题、blockquote、短正文，以及各组 `- [标题](绝对 URL): 一句话`
- [x] 1.2 链接只使用规格列出的 `https://winstall.app` 地址；`/generate` 的说明写明选择在当前浏览器里，该页不是目录
- [x] 1.3 路径模式只出现在说明文字里。不链接具体 `/apps/:id` 或 `/packs/:id`，不写应用总数或 Pack 总数，不出现 `/my`、`/my/likes`、`/api/`、`/users/`、认证、installer 回调、查询参数、密钥或内部 API origin
- [x] 1.4 不新增 `public/llms-full.txt`，不改 `public/robots.txt`，不加读取目录的路由

## 2. 检查

- [x] 2.1 在 `test/llmsTxt.test.js` 用 Node 原生测试读 `public/llms.txt`：必有链接都在，且每条带说明；没有具体 App 或 Pack 详情链接；没有排除路径；没有中文句子；没有目录规模数字；仓库里没有 `llms-full.txt`
- [x] 2.2 跑 `npm test`，确认新测试和现有测试通过
