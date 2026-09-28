## 1. Trending Apps 阈值展示

- [x] 1.1 为首页 Trending Apps 计数增加单项 `>= 100` 可见性过滤（可放在 `components/trendingCounts.js` 或 `utils/trendingCountVisibility.js`），缺省/非数字视为不可见
- [x] 1.2 `TrendingCounts`：只渲染达标项；无可见项时不输出计数行；可见数字仍用 `formatCount`
- [x] 1.3 为阈值过滤补充单元测试（例如 `test/trendingCountVisibility.test.js` 或既有测试旁）

## 2. Featured Packs 去掉计数

- [x] 2.1 从 `components/trendingPackCard.js` 移除 `TrendingCounts` 及 `readTrendingCounts` / `countStyles` 相关引用
- [x] 2.2 确认 `/packs` 的 `PackCard.js` 与货架 `SingleApp` 计数行为未改动

## 3. 验收

- [x] 3.1 手动或现有测试确认：Trending Apps 混合值（如 240 / 80 / 0）只显示达标项；三项皆低无行；Featured Packs 无计数行
