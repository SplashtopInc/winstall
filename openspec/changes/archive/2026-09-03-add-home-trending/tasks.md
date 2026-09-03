## 1. 取数与首页数据

- [x] 1.1 新增匿名 helper `fetchAppTrending`、`fetchPackTrending`，经 `fetchWinstallAPI` 请求 `GET /apps/trending` 与 `GET /packs/trending`（无 Bearer / AuthKey / AuthSecret）
- [x] 1.2 在 `pages/index.js` 的 `getStaticProps` 中与 `/apps` 并行拉两侧榜；无 origin、错误或空 `data` 映射为 `[]`；trending 失败不得写入首页 `error`
- [x] 1.3 删除首页 `recommended` / 官方 creator 拉取（含 `fetchAllPublicPacksFromApi`、`NEXT_OFFICIAL_PACKS_CREATOR`）以及全部 `recommended` props/state

## 2. 删除 Featured Packs

- [x] 2.1 去掉首页对推荐合集组件的引用
- [x] 2.2 删除仅被首页使用的推荐合集组件及其未再引用的样式模块

## 3. 周榜 UI

- [x] 3.1 新增 `components/trendingApps.js` 与 `styles/trendingApps.module.scss`：对齐 `.demo/discover.html` 扁平卡（4×5 网格、hover 勾选、名次 / 身份 / 窗口计数）；`AppIcon` hydrate；列表为空则不渲染
- [x] 3.2 新增 `components/trendingPackCard.js`：对齐 `.demo/discover.html` 渐变头卡（名次、标题、描述、窗口计数、内含 App）；整卡点击进详情；由 `trendingPacks.js` 渲染；列表为空则不渲染；不写死 pack id
- [x] 3.3 两块放在介绍区与轮播之后；首页不渲染 Popular Apps；文案不写 most added，不在前端拼本地日期窗口
- [x] 3.4 App 卡与 Pack 卡展示窗口 `likes`、`downloads`、`views`（不使用终身 `likeCount` / `downloadCount`）

## 4. 轮播

- [x] 4.1 新增 `components/homeCarousel.js` 与 `styles/homeCarousel.module.scss`，放在今日首页独立广告卡位置：`trendingApps[0]` 的 `#1 this week`（GET/ADDED 绑定选择集）；挂载后 `pickAd` + `buildAdHref(..., "home")` 广告幻灯片
- [x] 4.2 无第 1 名且无广告时不渲染轮播；首页不挂独立 `DonateCard`
- [x] 4.3 点/箭头/自动播放可选，对齐 demo 即可；允许单张幻灯片

## 5. 校验

- [x] 5.1 空榜或失败：介绍区仍在；两块周榜按侧独立隐藏；首页无 Popular Apps
- [x] 5.2 有榜：名次与名称可见；每条可见 like / download / view；勾选或第 1 名 GET 加入的 App 出现在首页选择栏；pack 卡进入 pack 详情
- [x] 5.3 有 App 榜则轮播有 #1，有启用广告则有广告幻灯片，且不会与独立 DonateCard 并存；App/Pack 详情仍无 Trending 标记
