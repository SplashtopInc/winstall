## Context

约束见仓库根目录 `AGENTS.md` 与 `openspec/config.yaml`。需求见同目录 `spec.md`。

本仓现有 React 组件多为 PascalCase（如 `SingleApp.js`、`Nav.js`）。本能力新增文件按 `AGENTS.md` 使用 lowerCamelCase，不重命名旧文件。页面文件 `pages/category.js` 按产品指定；其 URL 为 `/category`。调用的后端资源为复数 kebab-case：`GET /apps/categories/:id`。

## Goals / Non-Goals

**Goals:**

- 新增标识符符合 lowerCamelCase / `UPPER_SNAKE_CASE`；请求路径为 `/apps/categories/:id`。
- `/category` 用 `all` 加 14 个分类 slug；`all` 打全量 `GET /apps`，其余打分类信封；tabs + Load more + 目录 `SingleApp`。
- 主导航 Apps 指向该页，不改 `/apps`。
- 分类网格用与 `/apps` 相同的下标节奏插入单格 `DonateCard`；没有广告时不留空格。

**Non-Goals:**

- 分类发现接口、`others`、`social_media`、Express。
- 客户端排序、页内搜索、替换 `/apps?q=`。
- 为符合 AGENTS 而重命名既有 PascalCase 组件。
- 不改 `data/ads.json`、`pickAd` 的会话粘性或 `utm` 规则；不改首页轮播、Pack 列表、App 详情；不把广告改成横跨整行。

## Decisions

### 1. 新页 `pages/category.js`，不改 `pages/apps.js`

**选择：** Next 页 `pages/category.js` → `/category`。深链 `?category=<slug>`。无效或缺失 slug 浅路由纠正为 `all`。

**理由：** 产品指定用 `category.js` 而不是 `apps.js`。搜索、发行商、OpenSearch 留在 `/apps`。主导航文案 Apps 与路径解耦。

**备选：** 占用 `/apps` — 已否决。`pages/categories.js`（复数）更贴 API 复数约定，但与「文件名为 category.js」冲突，不采用。

### 2. 固定 slug 与展示名

**选择：** 写死 `all` 加 14 个分类 slug。展示名复用 Express 文案（如 `all` → All，`development` → Developer Tools，`browser` → Web Browsers）。`all` 请求 `GET /apps`；其余请求 `GET /apps/categories/${encodeURIComponent(slug)}`。常量 `CATEGORY_SLUGS`、`CATEGORY_LABELS`。

**理由：** 接口对 `categories` 数组精确匹配；文档样例为 `browser` 这类 slug。不拉分类器词表。

**备选：** 动态 `model.categories` — 推迟。

### 3. 分页为 Load more，`PAGE_SIZE` 为 56

**选择：** 首次 `offset=0&limit=56`。Load more 用响应里的 `offset`、`limit`、`data.length` 算下一 `offset`。URL 不写 offset，只写 `category`。`shown.length >= total` 时隐藏 Load more。

**理由：** 分类列表需要比 demo 的 8 条更大的首屏密度；接口默认 60 时小分类几乎看不到 Load more。

**备选：** `/apps` 式上下页 — 否决。

### 4. 卡片复用既有 `SingleApp`

**选择：** 复用 `components/SingleApp.js`（不复制、不新建 PascalCase 卡片）。`showSelectCheckbox`，选择集与站点其余列表相同。网格样式为 `styles/categoryPage.module.scss`（四列，1280px 起自适应），对齐 `apps.module.scss` 的 store 列表密度。卡片在网格单元格内占满宽度。

**理由：** 产品要目录列表卡，不要 Express `CategoryApp`。不重命名 `SingleApp`。

### 5. 取数 helper

**选择：** `utils/fetchCategoryApps.js` 导出 `fetchCategoryApps({ slug, offset, limit })`，内部走 `fetchWinstallAPI`。客户端在分类变化后请求，不按 Express 方式 ISR 逐 id 补全。信封归一化与 `pages/apps.js` 相同（优先 `data`）。图标基址使用既有 `getIconBase()` 转换逻辑。

**理由：** 分类总量会大于精选 JSON；避免详情风暴。

### 6. 标签组件

**选择：** `components/categoryTabs.js` + 同名 scss：收起态按容器宽度铺满一行，溢出才出现 More/Less；标签左侧用 `CATEGORY_ICONS` 的 Feather 描边图标，与首页 Top Categories 共用。

**理由：** 与页面数据获取分离；文件名 lowerCamelCase。

### 7. 导航选中

**选择：** `components/Nav.js`：主链 Apps 的 `href="/category"`，`pathname === "/category"` 时 selected。搜索框后不放置侧栏 Apps。不把 Nav 重命名为 `nav.js`。

### 8. 首页五个常用分类

**选择：** `utils/categoryMeta.js` 持有 `CATEGORY_SLUGS` / `CATEGORY_LABELS` / `TOP_CATEGORY_SLUGS`。首页 `components/topCategories.js` 在轮播与 Trending Apps 之间展示 Top Categories 五张卡片（图标与分类名同一行），链到 `/category?category=<slug>`。五个 slug 为分类页 `all` 之后的前五个，保证落地时标签在收起态可见。板块无副标题。卡片底色按分类用不同色相淡洗，避免五张同色。

**理由：** 复用既有深链，不拉分类发现接口；横向一行更紧，色相区分扫读；图标仍用 Feather 描边。

### 9. 货架广告下标沿用已展示应用数组

**选择：** 对 `apps.map` 的 `index` 判断 `index % 15 === 0`，广告渲染在该应用的外层 `<li>` 之后。Load more 只追加数组，下标自然延续。换分类替换数组，下标从 0 再计。间隔写成常量 `SHELF_AD_INTERVAL`（值为 15），与页面已有 `PAGE_SIZE` 放在一起。

**理由：** 与 `pages/apps.js` 同一条件。56 个应用命中下标 0、15、30、45，共 4 张；60 格可被 4、3、2 整除，桌面四列与 1280px 以下常见列数都能排满。

**备选：** 每批 Load more 从 0 重计。否决：第二批会紧挨着上一批末尾再插一张，节奏和满行都会断。

### 10. 没有广告就不挂格子

**选择：** 分类页用一次 `useRandomAd("apps-list")`。返回 null 时不渲染广告格。返回广告后，每个命中下标渲染一个 `<li>`，格内复用 `DonateCard`（`addMargin=""`，`placement="apps-list"`）。`DonateCard` 若仍内部再选一次，会话键相同，创意一致。

**理由：** `DonateCard` 在效果运行前返回 null。外层若无条件包 `<li>`，空 `<li>` 仍占一格，满批不再是 60 格。

**备选：** 无条件插入 `<li><DonateCard /></li>`。否决：首屏与无启用广告时会空出格子。

### 11. 广告格拉满单元格

**选择：** 在 `styles/categoryPage.module.scss` 让广告格与应用格一样成为网格项，内容宽高 100%。不新增广告组件文件。

**理由：** 分类网格靠 `> li` 拉伸子项；广告必须是并列的 `<li>`，而不是塞进应用卡内部。

## Risks / Trade-offs

- **[Risk] 库内标签是 `Developer Tools` 而 Web 传 `development` → 空列表。** 缓解：抽检 `GET /apps/categories/browser`；若生产是展示名，只在 helper 内做 slug→label 映射，URL slug 不变。
- **[Risk] `/apps` 不再有主导航直达入口。** 接受；搜索仍进入目录。
- **[Risk] 接口截断 limit。** 用响应 `limit`/`offset` 算下一页，不用写死的页大小去加 offset。
- **[新增 lowerCamelCase 与旧 PascalCase 并存]** 仅约束本能力新文件。
- **[广告在客户端选出后才插入，网格会后移]** 与 `/apps` 相同；不在服务端随机，以保住会话粘性。
- **[同一会话四格是同一条创意]** 接受；沿用现有挑选。
- **[不足 15 的倍数时最后一行不满]** 接受；只保证满批 56 条为 60 格。
- **[分类页与 `/apps` 的 `utm_content` 都是 `apps-list-a`]** 按产品决定合并统计，不新增货位名。

## Migration Plan

- 只发 Web。回滚：撤主导航项并删除 `/category` 相关新文件；去掉分类网格中的广告格。
- `/apps` 与 Express 仍可浏览。
