## Why

`/apps`（含无查询的全量目录、关键词搜索与 `publisher:` 浏览）仍用 Prev/Next 整页替换、左右键翻页和 `?page=`，与分类页、Packs Public、Add Apps 弹窗已经统一的 Load more 货架节奏脱节。现在要把最后这块旧分页对齐，让逛目录和搜结果都是追加而不是翻页。

## What Changes

- `/apps` 无 `q`、`?q=` 关键词（含 `tags:` / `name:` / `desc:`）以及 `?q=publisher:` 全部改为 Load more 追加；去掉 Prev/Next、顶栏小翻页、左右方向键翻列表。
- 每批 `limit` 为 56，与 `/category`、Add Apps 弹窗一致。
- `q` 仍可写在地址栏以便分享搜索；`page` / `offset` MUST NOT 写入 URL。遇到旧书签 `?page=2` 时忽略该参数并剥掉，从第一批开始展示，用 Load more 往后追加，MUST NOT 跳到第 2 页切片。
- 删除「Showing … of N apps (page x of y)」这句；标题「All apps (N)」可保留。
- 列表尚未返回且当前没有卡片时，用既有 `shelfListSkeleton` 占位，不再用整页「Loading apps...」作为唯一反馈。Load more 进行中只改按钮态。
- **BREAKING（弱）：** `/apps?page=N` 不再定位到第 N 页；深链只会落到第一批。

## Capabilities

### New Capabilities

- （无）

### Modified Capabilities

- `apps-list-pagination`: `/apps` 目录、搜索与发行商列表改为信封 Load more；不再要求页码控件或把 `page` 写进 URL。
- `shelf-list-skeleton`: 货架首屏骨架覆盖 `/apps`（无查询、搜索、发行商）。

## Impact

- 实现集中在 `pages/apps.js` 与 `styles/apps.module.scss`；`utils/parsePublisherQuery.js` 的 `appsPagePath` 去掉 `page` 查询；相关测试更新。
- 复用 `components/shelfListSkeleton.js` 与分类页同款 Load more 样式模式。
- ISR 首屏仍可拉第一批；客户端追加后续批次。不新增 API。
- OpenSearch、全局搜索 More / View All 仍进入 `/apps?q=`，只是不再带 `page`。
- Add Apps 弹窗、`/category`、`/packs` 不在本 change 范围。
