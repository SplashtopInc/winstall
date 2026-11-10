# Design

## Context

`pages/apps.js` 是 Next.js 页面，使用 `getStaticProps` 预渲染了全量应用目录的首屏切片（包含 59 个应用卡片及应用总数 `total`）。
为了避免在搜索时闪烁目录列表，此前引入了 `canHydrateList` 变量，在 `useState` 初始化阶段读取 `router.asPath`。当 URL 包含 `?q=` 时，`canHydrateList` 判定为 `false`，导致客户端将 `apps` 设为空数组、`totalKnown` 设为 `false`、渲染骨架屏。然而此时服务端输出的是静态目录 HTML，在首轮水合（Hydration）校验时触发 React 严重报错（Hydration failed）。

参见 `proposal.md` 获取变更动机与背景。

## Goals / Non-Goals

**Goals:**
- 彻底消除直达或刷新 `/apps?q=...`、`/apps?q=tags:...`、`/apps?q=publisher:...` 时的 React 水合不匹配错误。
- 确保客户端初始渲染与服务端 SSG 输出的 HTML 结构完全吻合。
- 保留现有的按需搜索及结果加载功能，水合后无缝切换至目标查询结果。

**Non-Goals:**
- 不改变 `/apps` 的 SSG/ISR 策略。
- 不修改后端搜索接口、分页契约及 URL 参数结构。

## Decisions

### 1. 初始渲染状态直接绑定静态预渲染数据

在组件初次执行时，客户端虚拟 DOM 必须同服务端 HTML 一致。因此初始状态直接使用 `normalizeAppsPayload(data)`：
- `apps` 初始为预渲染项目列表；
- `total` 初始为预渲染总数；
- `totalKnown` 初始为预渲染状态；
- `isLoading` 初始为 `false`；
- `loadedScope` 初始为预渲染存在的范围（`"list"`）。

移除 `pathHasSearchQuery` 辅助函数及其在 `useState` 中的调用。

*备选方案考虑：*
- 引入 `isMounted` 状态控制延迟渲染：会造成无意义的二次渲染和闪烁，违背第一性原则与精简原则。
- 改为 `getServerSideProps`：失去 SSG/ISR 的高性能与静态缓存优势，增加服务器渲染开销，成本过高。

### 2. 查询加载完全由已有的 `useEffect` 驱动

`pages/apps.js` 现已存在监听 `router.isReady` 和 `currentScope` 的 `useEffect`：
1. 页面水合完成时，`router.isReady` 变为 `true`。
2. 若路由中包含 `q` 参数，`scopeQuery.kind` 为搜索/标签/发布者，`scopeQuery.kind !== "list"`。
3. `useEffect` 执行，将 `listSessionRef.current` 设为 `false`，重置列表并发起搜索请求，更新为搜索结果。

这一生命周期流转自然，无需额外的复杂防御性逻辑。

## Risks / Trade-offs

- **[Risk]** 在带 `q` 直达时，如果网络较慢，用户可能会在搜索结果返回前极短时间看到静态目录首屏卡片。
  → **Mitigation**: 绝大多数情况下网络或本地缓存毫秒级返回，或者很快被加载状态替换，这在 SSG 架构中是标准且可接受的折中，相比页面水合崩溃（页面整棵树被强行销毁重建且控制台严重报错）是更健壮且符合 React 规范的体验。
