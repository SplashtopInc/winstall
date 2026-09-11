## Why

货架列表接口已在每条 `data[]` 上平铺终身 `viewCount`、`downloadCount`、`likeCount`，但目录卡片 `SingleApp` 仍不展示这些信号。详情规范还禁止列表出计数，和现网货架能力冲突。现在要把终身三项只读画在所有 `SingleApp` 上，并与首页周榜窗口数分开。

## What Changes

- 所有 `SingleApp`（含分类页、`/apps`、搜索结果、Pack 编辑列表）在现有卡片上贴一行只读终身计数：views、downloads、likes，顺序与周榜卡一致；缺字段或为 0 仍显示 0。
- 只读 payload，不在卡片上点赞，不为列表打 `GET /apps/:id/stats` 或新增批量详情接口。
- 首页 Trending Apps / Packs 继续用窗口 `views` / `downloads` / `likes`，文案与组件不和货架终身数混用。
- Pack 详情 `PackDetailAppCard` 不在本 change 改造（它不走 `SingleApp`，且 `GET /apps/:id` / Pack 快照不带这三项）。
- 修改 `detail-engagement`：列表禁止展示计数的要求改为允许 `SingleApp` 展示货架终身三项。

## Capabilities

### New Capabilities

- `app-card-engagement`：`SingleApp` 从货架列表 item 读取并展示终身 view / download / like 计数。

### Modified Capabilities

- `detail-engagement`：放宽「列表不上计数」，允许货架 `SingleApp` 展示终身三项；详情读 stats、Like 写路径不变。

## Impact

- **Web**：`components/SingleApp.js`、`styles/singleApp.module.scss`；新增 lowerCamelCase 读取 helper（如 `utils/appListCounts.js`）。可抽只读计数行，但 MUST NOT 复用带「this week」语义的 `trendingCounts`。
- **表面**：`pages/category.js`、`pages/apps.js`、`components/Search.js`、`components/PackAppsList.js` 因共用 `SingleApp` 自动带上；Pack 编辑列表在快照无字段时显示 0。
- **API**：只消费已有列表字段；不改 winstall-api，不新增 `GET /apps?ids=`。
- **规范**：归档后 `app-card-engagement` 进入主 specs；`detail-engagement` 的列表场景更新。
