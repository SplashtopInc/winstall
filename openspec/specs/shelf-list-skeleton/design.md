## Context

约束见仓库根目录 `AGENTS.md` 与 `openspec/config.yaml`。需求见同目录 `spec.md`。

`/category`、`/packs` Public 与已登录 My、以及 Add Apps 弹窗的空列表首屏用 `shelfListSkeleton`（纯 CSS）占位。详情页 `react-loading-skeleton` 不扩到货架。

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

**选择：** `div` + SCSS 脉动。颜色用 `color-mix` 叠在 `var(--card-bg)` / `var(--textColor)` 上，暗色自动跟 token。动画约 1.2–1.5s ease-in-out，透明度在约 0.45–0.9 间循环，不要位移、不要高对比闪烁。`prefers-reduced-motion` 时停动画。

**理由：** 不引入新包，也不把详情用的第三方骨架扩到列表。

**备选：** 复用已安装的 `react-loading-skeleton`——剪影不像卡，扩大依赖面。

### 2. 一个组件、两种剪影

**选择：** `components/shelfListSkeleton.js`，`variant` 为 `app` 或 `pack`。复用调用方 `.grid`。占位 **8** 张。App：左 48 方块 + 两行条。Pack：左 40 方块 + 标题条 + 短条。

**理由：** 两种真卡层级不同；8 张够撑住首屏。

**备选：** 两个文件——重复。按 `PAGE_SIZE` 张——过密。

### 3. 只替换「空列表的首次加载」

**选择：** 分类 `isLoading`；Public `!hasLoaded && loading`；弹窗 `listLoading && displayApps.length === 0`；My 在 session 未就绪或已登录拉列表时用骨架。Load more 只改按钮态。

**理由：** 改动面最小，追加加载不丢内容。

### 4. My Packs 与登录墙

**选择：** session 未就绪或已登录加载中 → pack 骨架。session 已定且无用户 → 登录说明，不用骨架。

**理由：** 未登录不该先闪假卡再变成登录墙。

## Risks / Trade-offs

- **[Risk] 骨架与真卡高度差导致回填跳动。** → Mitigation：padding/圆角对齐真卡，不设死高度。
- **[Risk] 脉动在 `prefers-reduced-motion` 下不适。** → Mitigation：停动画、静态浅灰块。
- **[Trade-off] 不覆盖 `/apps`。** → 另开 change。

## Migration Plan

只发 Web。回滚：三处改回 Loading 文案并删除占位组件。
