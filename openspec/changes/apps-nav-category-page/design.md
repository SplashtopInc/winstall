## Context

动机见 proposal.md。约束见仓库根目录 `AGENTS.md` 与 `openspec/config.yaml`。

本仓 **OpenSpec schema** 要求 change 根目录有 `design.md`。`AGENTS.md` 规定归档后架构落在 `openspec/specs/**/design.md`。归档本 change 时，将本文件复制为 `openspec/specs/category-browse/design.md`（kebab-case 能力目录）。change 期间不在主 `openspec/specs/` 预建该文件。

本仓现有 React 组件多为 PascalCase（如 `SingleApp.js`、`Nav.js`）。**本 change 新增文件**按 `AGENTS.md` 使用 lowerCamelCase，不重命名旧文件。页面文件 `pages/category.js` 按产品指定；其 URL 为 `/category`。调用的后端资源为复数 kebab-case：`GET /apps/categories/:id`。

## Goals / Non-Goals

**Goals:**

- 新增标识符符合 lowerCamelCase / `UPPER_SNAKE_CASE`；请求路径为 `/apps/categories/:id`。
- `/category` 用 14 个 slug 打分类信封，tabs + Load more + 目录 `SingleApp`，对齐 demo。
- 主导航 Apps 指向该页，不改 `/apps`。

**Non-Goals:**

- 分类发现接口、`others`、`social_media`、Express。
- 客户端排序、页内搜索、替换 `/apps?q=`。
- 为符合 AGENTS 而重命名既有 PascalCase 组件。

## Decisions

### 1. 新页 `pages/category.js`，不改 `pages/apps.js`

**选择：** Next 页 `pages/category.js` → `/category`。深链 `?category=<slug>`。无效或缺失 slug 浅路由纠正为 `browser`。

**理由：** 产品指定用 `category.js` 而不是 `apps.js`。搜索、发行商、OpenSearch 留在 `/apps`。主导航文案 Apps 与路径解耦。

**备选：** 占用 `/apps` — 已否决。`pages/categories.js`（复数）更贴 API 复数约定，但与「文件名为 category.js」冲突，本 change 不采用。

### 2. 固定 slug 与展示名

**选择：** 写死 proposal 中的 14 个 slug。展示名复用 Express 文案（如 `development` → Developer Tools，`browser` → Web Browsers）。请求 `GET /apps/categories/${encodeURIComponent(slug)}`。常量 `CATEGORY_SLUGS`、`CATEGORY_LABELS`。

**理由：** 接口对 `categories` 数组精确匹配；文档样例为 `browser` 这类 slug。本 change 不拉分类器词表。

**备选：** 动态 `model.categories` — 推迟。

### 3. 分页为 Load more，`PAGE_SIZE` 为 8

**选择：** 首次 `offset=0&limit=8`。Load more 用响应里的 `offset`、`limit`、`data.length` 算下一 `offset`。URL 不写 offset，只写 `category`。`shown.length >= total` 时隐藏 Load more。

**理由：** 对齐 demo；接口默认 60 时小分类几乎看不到 Load more。

**备选：** `/apps` 式上下页 — 本表面否决。

### 4. 卡片复用既有 `SingleApp`

**选择：** 复用 `components/SingleApp.js`（不复制、不新建 PascalCase 卡片）。`showSelectCheckbox`，选择集与站点其余列表相同。网格样式新建 `styles/categoryPage.module.scss`（四列，1280px 起自适应），对齐 `apps.module.scss` 的 store 列表密度。

**理由：** 产品要目录列表卡，不要 Express `CategoryApp`。不重命名 `SingleApp`。

### 5. 取数 helper

**选择：** 新增 `utils/fetchCategoryApps.js`，导出 `fetchCategoryApps({ slug, offset, limit })`，内部走 `fetchWinstallAPI`。客户端在分类变化后请求，不按 Express 方式 ISR 逐 id 补全。信封归一化与 `pages/apps.js` 相同（优先 `data`）。图标基址使用既有 `getIconBase()` 转换逻辑（抽 lowerCamelCase 小函数或内联复用，不新增 PascalCase 模块）。

**理由：** 分类总量会大于精选 JSON；避免详情风暴。

### 6. 标签组件

**选择：** 新增 `components/categoryTabs.js` + 必要时同名 scss：前 `VISIBLE_TAB_COUNT = 6` + More/Less，换行规则见 spec。

**理由：** 与页面数据获取分离；文件名 lowerCamelCase。

### 7. 导航选中

**选择：** 只改进 `components/Nav.js`：主链 Apps 的 `href="/category"`，`pathname === "/category"` 时 selected。侧栏仍 `href="/apps"`。不把 Nav 重命名为 `nav.js`。

## Risks / Trade-offs

- **[Risk] 库内标签是 `Developer Tools` 而 Web 传 `development` → 空列表。** 缓解：先打 `GET /apps/categories/browser` 验收；若生产是展示名，只在 helper 内做 slug→label 映射，URL slug 不变。
- **[Risk] 两处「Apps」文案。** 接受；侧栏改名不在本 change。
- **[Risk] 接口截断 limit。** 用响应 `limit`/`offset` 算下一页，不用写死的 8 去加 offset。
- **[新增 lowerCamelCase 与旧 PascalCase 并存]** 仅约束本 change 新文件。

## Migration Plan

- 只发 Web。回滚：撤主导航项并删除 `/category` 相关新文件。
- `/apps` 与 Express 仍可浏览。

## Open Questions

- 无阻塞项。生产 slug 核对放在 tasks 验收，不改 spec。
