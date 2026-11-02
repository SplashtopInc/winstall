# Tasks

## 1. 查询解析与端点分流

- [ ] 1.1 重构 `utils/parsePublisherQuery.js`：将 `tags:` 提取为 `parseTagQuery` 并生成 `{ kind: "tag", tag }`，清理 `FIELD_PREFIX` 及 `name:`/`desc:` 字段过滤解析，统一兜底至纯文本 `{ kind: "search", q }`。
- [ ] 1.2 在 `utils/parsePublisherQuery.js` 中新增 `tagListPath`，并在 `appsListPath` 与 `listScopeKey` 中支持 `tag` 模式（请求 `/apps/tags/:id?offset={n}&limit={n}`，无 `q` 或字段参数），移除已废弃的 `suggestionQueryFromListQuery`。
- [ ] 1.3 更新 `test/parsePublisherQuery.test.js`：添加 `tags:` 路由至 `/apps/tags/:id` 的断言，验证 `name:`/`desc:` 归一为普通搜索且不再产生字段参数，并运行 `node --test test/parsePublisherQuery.test.js` 验证通过。

## 2. 搜索框提示收敛与弹窗适配

- [ ] 2.1 修改 `components/Search.js`：移除搜索输入框右侧的 `Search tips` 气泡提示及相关图标/样式，不再向用户引导 `name:`/`publisher:`/`tags:`/`desc:` 前缀语法。
- [ ] 2.2 检查并适配 `components/AddAppsDialog.js`：当用户输入 `tags:` 前缀时，通过 `appsListPath` 正确分流至 `tag` 端点并正常分页。

## 3. 移除搜索空态冗余回退

- [ ] 3.1 修改 `pages/apps.js`：在 `showEmptySearch` 分支中移除 `<TrySearching />` 组件调用与 `suggestionQueryFromListQuery` 引用。
- [ ] 3.2 修改 `components/Search.js`：在空结果展示区移除 `<TrySearching />` 组件调用与 `suggestionQueryFromListQuery` 引用。
- [ ] 3.3 更新 `components/SearchEmptyState.js` 及 `components/Search.js` 中的空结果说明文案，移除对建议列表的提及（改为 `We couldn't find any apps matching your search. Try a different keyword.`）。

## 4. 全量验证

- [ ] 4.1 运行完整测试套件 `npm test`，确保所有单元测试与集成测试通过。
- [ ] 4.2 验证应用详情页点击 Tag（如 `/apps?q=tags: browser`）能够正常从 `/apps/tags/browser` 拉取列表，且全局搜索普通关键词能够正常检索。
