## Why

API 已为 `GET /apps/search`（含 tag 等字段过滤）和 `GET /publishers/:id` 提供统一分页信封 `{ total, offset, limit, data }`，但 Web 搜索与发行商浏览仍只取第一页，用户无法看完全部命中。全量列表的排序控件只排当前页，与「顺序由 API 默认规则决定」不一致。

## What Changes

- `/apps?q=publisher: …` 与 Add Apps 对话框中的 `publisher:` 查询改为按 `GET /publishers/:id` 分页浏览，可翻完全部该发行商应用。
- `/apps?q=` 关键词搜索及 `tags:` / `name:` / `desc:` 前缀改为按 `GET /apps/search` 分页，可浏览 API 返回的全部命中。
- 详情页「More by publisher」改为小 `limit` 预览，用响应 `total` 决定 View All；View All 进入已分页的发行商结果页。
- 移除列表/搜索页（含 Add Apps 对话框）的客户端排序控件；不再发送或消费 `sort` 查询参数。列表顺序以 API 默认规则为准。
- Pack 内 `limit=N` 预览与全局搜索 suggest **不**做翻页；More / View all 进入 `/apps?q=` 结果页。

## Capabilities

### New Capabilities
- `apps-list-pagination`: Web 对应用目录、搜索（含字段前缀）与发行商浏览使用统一分页；客户端不提供排序控件。

### Modified Capabilities
- （无）现有 `openspec/specs/` 下无应用搜索/列表分页能力可改。

## Impact

- Web：`pages/apps.js`、`components/Search.js`、`components/AddAppsDialog.js`、`components/MoreByPublisher.js`、`components/ListSort.js`、`components/RecentApps.js`。
- API：只消费已上线契约，不改 winstall-api。search 的 `total` 仍可能受候选窗口上限约束；publishers 的 `total` 为真实计数。
- 部署：API publishers 响应已改为信封（非数组）；Web 必须改读 `data`/`total`。
