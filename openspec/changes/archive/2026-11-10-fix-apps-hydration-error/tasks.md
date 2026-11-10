# Tasks

## 1. 修复首屏水合一致性

- [x] 1.1 在 `pages/apps.js` 中移除 `pathHasSearchQuery` 逻辑，将 `apps`、`total`、`totalKnown`、`isLoading` 及 `loadedScope` 的初始状态直接对齐静态预渲染数据 `initialNormalized`，确保初始渲染与 SSG 输出完全一致
- [x] 1.2 检查并确保在 `router.isReady` 且存在查询参数时，现有的 `useEffect` 能正常重置 `listSessionRef` 并加载对应查询的首批结果

## 2. 验证与回归测试

- [x] 2.1 运行项目测试套件（`npm test`），确保所有自动化测试均通过
- [x] 2.2 启动本地开发服务（`npm run dev`），在浏览器中直接打开带搜索参数的页面（如 `/apps?q=%E6%9C%80%E5%8F%97%E6%AC%A2%E8%BF%8E%E7%9A%84%E6%B5%8F%E8%A7%88%E5%99%A8`），验证页面水合无报错且正常加载出搜索结果
