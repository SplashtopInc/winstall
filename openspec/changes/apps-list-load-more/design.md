## Context

见 `proposal.md` 的 Why。现状：`pages/apps.js` 用页码状态 + `router.replace` 写 `?page=`，整页 `setApps` 替换，顶部 `Pagination small`、底部 Previous/Next、`keydown` 37/39 点 `#previous`/`#next`。ISR `GET /apps?offset=0&limit=60`。`appsPagePath` 仍接受 `{ page }`。`shelfListSkeleton` 尚未挂到 `/apps`。分类页与 Add Apps 已是 `limit=56` + Load more。

## Goals / Non-Goals

**Goals:**

- `/apps` 三路（全量、search、publisher）同一套追加加载。
- 浏览器 URL 只保留路径与 `q`；剥 `page`。
- 首屏空列表用既有骨架组件。

**Non-Goals:**

- 不改 Add Apps、`/category`、`/packs`、OpenSearch 模板（仍 `/apps?q={searchTerms}`）。
- 不新增 API、不改信封字段。
- 不把 `/apps` 改成分类标签页。

## Decisions

### 1. 在 `pages/apps.js` 内改为追加，不抽新分页组件

**选择：** 常量 `PAGE_SIZE` 为 56。首屏 `offset=0` 替换列表；Load more 用已展示 `length` 作下一 offset，`concat`。`shown.length >= total` 时隐藏按钮。`getStaticProps` 同步改为 `limit=56`。换 `q` / scope 丢弃列表并从 0 重拉。

**理由：** 与 `pages/category.js`、Add Apps 同一信封用法；旧 Pagination 只服务于本页。

**备选：** 抽共享 `loadMore` 组件——本 change 只修一页，不扩抽象。保留 60——否决，与分类 56（含广告满行）不一致。

### 2. `q` 留 URL，`page` 浅替换剥掉

**选择：** 有 `q` 时地址栏只有 `q`。`router.isReady` 后若存在 `page`（或误带的 `offset`），`replace` 成不含它们的 `/apps` 或 `/apps?q=`。加载始终 `offset=0` 起，不根据旧 `page` 算切片。`appsPagePath` 去掉 `page` 参数；测试删掉 `page=2` 断言。

**理由：** 搜索仍可分享；翻页深度链接产品已放弃。Packs 已有剥 `q`/`page` 的先例。

**备选：** 把 offset 写入 URL——刷新能续看，但与「不写进 URL」冲突。

### 3. 骨架复用 `shelfListSkeleton`，Load more 样式抄分类页

**选择：** 空列表且请求中：`ShelfListSkeleton` `variant="app"`，`gridClassName` 用本页 `.all.storeList`。Load more 按钮与 wrap 从 `styles/categoryPage.module.scss` 抄到 `styles/apps.module.scss`（不跨页 import CSS module）。删掉 `minPagination` / 底栏翻页提示。ISR 已有第一批数据时直接画卡，不闪骨架。

**理由：** 骨架能力已存在；广告仍 `index % 15 === 0`，56 卡 + 4 广告 = 60 格，与分类页一致。

**备选：** 整页 Loading 文案保留到数据到达——否决，规范已要求骨架。

### 4. 去掉键盘翻页与 Showing 文案

**选择：** 删除 `document` 左右键监听与 `#previous`/`#next`。删除「Showing … (page x of y)」。无 `q` 时 `h1` 仍可带 `total`。Load more 不 `scrollTo(0,0)`。

**理由：** 分类页与 Packs 均无键盘翻列表；焦点在搜索框时方向键本就该留给输入。

**备选：** 仅藏按钮、保留快捷键——仍是旧翻页模型。

## Risks / Trade-offs

- **[Risk] ISR 仍缓存 limit=60 的旧页。** → Mitigation：`getStaticProps` 改为 56 后依赖既有 revalidate；首屏与 Load more 批次对齐。
- **[Risk] 旧 `?page=2` 书签不再落到原切片。** → 接受；剥参并从头追加。
- **[Trade-off] `/apps` 网格仍三/四列皮肤，只统一分页控件。** → 不把本页改成分类标签布局。

## Migration Plan

只发 Web。回滚：恢复 `pages/apps.js` Prev/Next 与 `?page=`。无需数据迁移。
