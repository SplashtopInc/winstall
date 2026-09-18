## Context

见 proposal.md 的 Why。`/category`、`PublicPacksList` 首屏、`packs/index.js` 的 My 加载、`AddAppsDialog` 空列表均渲染一行 Loading 文案。详情页已有 `react-loading-skeleton`，本 change 不把它扩到货架。归档后本文件归属 `openspec/specs/shelf-list-skeleton/design.md`。

## Goals / Non-Goals

**Goals:**

- 首屏用「空心真卡」稳住网格高度与扫描节奏。
- 零新依赖；改动集中在三个入口加同一小组件。

**Non-Goals:**

- `/apps` 目录、首页、Pack/App 详情、全局搜索下拉。
- Load more 下方追加骨架行。
- 骨架像素级复刻每一字段（图标预览条、三连 counts 不必仿真）。
- 替换或移除 `react-loading-skeleton`（详情页维持现状）。

## Decisions

### 1. 纯 CSS 占位，不接骨架库

**选择：** `div` + SCSS 脉动。颜色用 `color-mix` 叠在 `var(--card-bg)` / `var(--textColor)` 上，暗色自动跟 token。动画约 1.2–1.5s ease-in-out，透明度在约 0.45–0.9 间循环，不要位移、不要高对比闪烁。

**理由：** 用户明确选方案 2；不引入新包，也不把详情用的第三方骨架扩到列表（那套圆形 + 长条不像货架卡）。

**备选：** 复用已安装的 `react-loading-skeleton`——少写 CSS，但剪影不像卡，且扩大对该库的依赖面。

### 2. 一个组件、两种剪影

**选择：** 新增 `components/shelfListSkeleton.js`（lowerCamelCase），`variant` 为 `app` 或 `pack`。共用同一套 `.grid` class（分类页 / packs 各自现有 grid）。占位 **8** 张（桌面两行四列）。App：左 48 方块 + 两行条。Pack：左 40 方块 + 标题条 + 短条，不要画 6 个假图标。

**理由：** 两种真卡层级不同，一种万能灰条会假。8 张够撑住首屏，56 张会像故障墙。

**备选：** 两个文件——重复。按 `PAGE_SIZE` 张——过密。

### 3. 只替换「空列表的首次加载」

**选择：** `!hasLoaded && loading` 或等价（分类 `isLoading && apps.length === 0`，弹窗 `listLoading && displayApps.length === 0`）。切 tab / 切分类若清空列表，同样走骨架。搜索进行中若仍留着上一批卡，不要拆掉。Load more 只 `disabled` + `Loading…`。

**理由：** 改动面最小，且符合「追加加载不丢内容」。

**备选：** 搜索时整表换骨架——闪得更狠。底部再追加骨架行——多状态、收益小。

### 4. My Packs 与登录墙

**选择：** `session` 仍 loading 或已登录正在拉 `GET /packs/me` 时用 pack 骨架。`session` 已定且无用户 → 仍登录说明，不用骨架。Create 卡不必单独做虚线骨架，8 张统一剪影即可。

**理由：** 未登录不该先闪一排假卡再变成登录墙。

## Risks / Trade-offs

- **[Risk] 骨架与真卡高度差导致回填跳动。** → Mitigation：padding/圆角对齐真卡，高度随剪影自然即可，不设死 250px。
- **[Risk] 脉动在 `prefers-reduced-motion` 下不适。** → Mitigation：该媒体查询下停动画、静态浅灰块。
- **[Trade-off] 不覆盖 `/apps`。** → 该页仍是翻页 + 大标题 Loading；另开 change。

## Migration Plan

只发 Web。回滚：三处改回 Loading 文案并删除占位组件。
