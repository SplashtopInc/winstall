## Why

`GET /packs` 与 `GET /packs/me` 已在每条上平铺终身 `viewCount`、`downloadCount`、`likeCount`，但 `/packs` 上的 `PackCard` 仍不展示这些信号。浏览合集时缺少和 App 货架一致的热度线索。接口已就绪，Web 只需只读画出这三项。

## What Changes

- 公开 Pack 列表与「我的 Pack」共用的 `PackCard` 展示终身 views、downloads、likes，顺序与货架 `SingleApp` 一致；只读，缺字段或为 0 仍显示 0。
- 计数画在卡片底部元信息区：图标行之后、日期之前；视觉沿用货架计数行（图标 + 数字、中点分隔），不做成周榜那种铺在彩色头图上的主指标。
- 保留「Last updated」；不把计数塞进标题或描述，不替换 app 图标排。
- 只读列表 payload，不为每张卡打 `GET /packs/:id/stats`，不在卡片上点赞。
- 首页 Featured Packs 继续用窗口 `views` / `downloads` / `likes`，不改用终身三项。
- Pack 详情页仍读 `GET /packs/:id/stats`，本 change 不改详情。

## Capabilities

### New Capabilities

- `pack-card-engagement`：`PackCard` 从公开列表与「我的列表」item 读取并展示终身 view / download / like。

### Modified Capabilities

- `detail-engagement`：列表禁止展示计数，改为禁止用详情 stats 接口给列表卡灌数；`PackCard` 上的终身三项由 `pack-card-engagement` 规定。

## Impact

- **Web**：`components/PackCard.js`、`styles/packsIndex.module.scss`；复用 `utils/appListCounts.js` 与 `components/appListCounts.js`（字段名与 App 货架相同）。
- **表面**：`pages/packs/index.js` 的 Explore 与 Mine 因共用 `PackCard` 自动带上。
- **API**：只消费已有列表字段；不改 winstall-api。
- **规范**：归档后 `pack-card-engagement` 进入主 specs；`detail-engagement` 的列表场景与 App 货架那次同一拆法。
