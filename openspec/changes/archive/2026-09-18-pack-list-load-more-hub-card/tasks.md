## 1. Public Load more 与搜索

- [x] 1.1 `pages/packs/index.js`：Public 首屏 `offset=0&limit=24`，Load more 按已展示条数追加；去掉 Prev/Next 与左右键翻页；默认 tab 仍为 My
- [x] 1.2 搜索 `q` 只放页内状态；保留忽略或剥除地址栏 `q`/`page`；切换 tab 不写 URL
- [x] 1.3 `PublicPacksSearch`：满 3 字符才提交 `q`；1–2 字符提示；提供清空
- [x] 1.4 `PublicPacksList`：去掉 Pagination 与 `Showing page` 计数条；有下一页时展示 Load more

## 2. Hub 轻卡

- [x] 2.1 改 `components/PackCard.js`：左上 pack/stack 符号、标题、应用数；描述下最多 6 个 app 图标预览；空描述不占位
- [x] 2.2 Footer 用 `timeAgo` 相对时间，与终身 views/downloads/likes 同一行；去掉 “Last updated” 日历句
- [x] 2.3 My 用文字可见性徽章；Public 不展示可见性；列表已有作者字段才显示作者
- [x] 2.4 改 `styles/packsIndex.module.scss`：去掉固定 250px 高度，按轻卡间距排版
