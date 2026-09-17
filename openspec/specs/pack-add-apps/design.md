## Context

约束见仓库根目录 `AGENTS.md` 与 `openspec/config.yaml`。需求见同目录 `spec.md`。

`AddAppsDialog` 默认用分类下拉 + `fetchCategoryApps` + Load more；搜索为覆盖层。`AddAppPickerCard` 皮对齐 compact `SingleApp`，选择集独立于 `SelectedContext`。

## Goals / Non-Goals

**Goals:**

- 弹窗默认浏览复用分类页的 slug、拉数与追加模型；分类控件为 outlined 下拉。
- picker 卡只改皮，选择语义保持独立。
- 搜索作为覆盖层，不与分类求交；搜索生效时 Filter 显示 All。

**Non-Goals:**

- 不改 `/category`、`/apps` 翻页、`Search.js` 限额预览。
- 不新增「分类 ∩ 关键词」API。
- 不把 `AddAppPickerCard` 合并进 `SingleApp.js`。
- 不把弹窗选择写入全局安装勾选集。

## Decisions

### 1. 搜索是覆盖层，Filter 必须说真话

**选择：** 空查询（或不足提交阈值）走当前分类 + Load more。已提交关键词走 `GET /apps/search`，`publisher:` 走 `GET /publishers/:id`，两者都替换网格并用 Load more 追加。搜索生效时分类下拉**显示** `All`（不把 slug 传给 search），内部仍记住搜索前的 `activeSlug`；从下拉选择任一分类则清空输入并加载该类；清空搜索回到记住的 `activeSlug`。

**理由：** 没有分类内搜索信封；全站搜符合「加应用到 Pack」的找包意图。下拉若仍显示 Browsers 而格子是全站结果，用户会以为 Filter 在生效。显示 All 与列表一致。

**备选：** 搜索时隐藏下拉——出口只剩清空输入。搜索时灰掉下拉——摩擦更大。分类 ∩ 关键词——要新 API，本能力不做。真正把 `activeSlug` 改成 `all`——清空搜索无法回到原分类。

### 2. 分类用 outlined 下拉 + `fetchCategoryApps`，弹窗无 URL

**选择：** 工具行左搜索、右 `categoryFilterSelect`（浮动 label「Filter by」、pill 描边、caret）。选项来自 `CATEGORY_SLUGS` / `CATEGORY_LABELS`。默认与换分类走 `fetchCategoryApps`（`all` → `GET /apps`，其余 → `GET /apps/categories/:id`）。`PAGE_SIZE` 与分类页同为 56。关闭弹窗丢掉 `activeSlug`，下次打开 `all`。不嵌入 `CategoryTabs`。

**理由：** 弹窗宽度放不下整排 tabs；下拉与搜索同一行更省高。slug/文案仍共用 `categoryMeta`。

**备选：** 嵌入 `CategoryTabs`——弹窗内更早触发 More，且与搜索分成两行。复用 `ListCategory`——标签在控件上方，不是描边浮动 label。

### 3. 两套卡片，皮对齐 compact 目录卡

**选择：** 继续 `AddAppPickerCard` + 本地 `selectedApps` / `alreadyAdded` / 底部加 pack。样式对齐 compact `SingleApp`：图标瓷片、名称、发行商、描述两行、`appListCounts` 终身三项。网格四列、单元格拉满。不搬 checkbox，不把身份区做成进详情的 Link（整卡仍 toggle）。

**理由：** 加入 pack 与全局勾选是两条状态机；合并组件会把 `preventGlobalSelect` 和 Already added 缠进目录卡。

**备选：** 弹窗直接渲染 `SingleApp`——皮最真，但要接 `preventGlobalSelect`、禁 Link、补已加入态，改动面大于「只改皮」。

### 4. 浏览改为追加，点选状态机不动

**选择：** 去掉 dialog Pagination 与 ArrowLeft/ArrowRight。分类、搜索、publisher 三路都是首屏替换、Load more concat。换 scope（slug 或查询）重置列表，不清本地选中。已加入判定仍对比当前 pack 应用 id。

**理由：** 展示模型对齐 `/category`；加入 pack 的确认/清空/禁点已加入不在浏览方式里。

## Risks / Trade-offs

- **[Risk] 搜索覆盖后用户以为仍在当前分类。** → Mitigation：搜索生效时下拉显示 All；从下拉选分类立即退出搜索；不把分类当作搜索过滤。
- **[Risk] 对齐皮时误改 toggle / Already added。** → Mitigation：不复用 `SingleApp` 选择路径；只改 picker 标记与 scss。
- **[Risk] 弹窗内分类下拉选项多，需滚动。** → Mitigation：菜单限高并滚动；选项文案与 `/category` 一致。
- **[Trade-off] `/apps` 仍翻页、弹窗 Load more。** → 列表信封不变，只是控件不同；`apps-list-pagination` 按表面区分。
- **[Trade-off] `/category` 仍用 tabs，弹窗用下拉。** → 同一套 slug；交互按表面密度选择。

## Migration Plan

只发 Web。回滚：恢复 `AddAppsDialog` 全量分页与旧 picker 皮，去掉分类下拉。
