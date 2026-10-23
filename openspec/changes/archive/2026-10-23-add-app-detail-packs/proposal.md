## Why

用户在 App 详情里只能看到这个应用本身、同发行商应用和相关应用，看不到已经把它收进公开合集的热门 Pack。winstall-api 已提供匿名的 `GET /apps/:id/packs`，按热门顺序返回包含该 App 的公开 Pack。网站需要在详情页接上这条接口，最多展示四张轻卡。

## What Changes

- App 详情在正文下方增加一块「包含该 App 的热门 Pack」，最多 4 张。没有命中或请求失败时整块不出现，不挡住详情其余内容。
- 卡片只展示合集图标、名称、应用数量和两行描述。整卡进入 `/packs/:id`。不展示应用图标条、相对更新时间、浏览、下载或点赞。
- 浏览器向 API origin 请求 `GET /apps/:id/packs?limit=4`，不带用户或服务凭证，不在客户端重排。不改 `/packs` 列表卡，也不改公开路径。

## Capabilities

### New Capabilities

- `app-detail-packs`：App 详情展示最多 4 个包含该 App 的热门公开 Pack，使用不含图标条与时间的轻卡。

### Modified Capabilities

- （无）`/packs` 列表卡、首页 Featured Packs、Pack 详情与 `/apps/:id`、`/packs/:id` 的既有要求不变。

## Impact

- 前端：App 详情页 `pages/apps/[id].js` 在正文下方挂新区块。新增 lowerCamelCase 的轻卡与区块组件。复用现有 `fetchWinstallAPI`，该路径保持匿名。
- API：只消费已有的 `GET /apps/:id/packs`。不改 winstall-api，不为卡片再请求 `GET /packs/:id` 或 `GET /packs/:id/stats`。
- URL：不改 `/apps/:id`、`/packs/:id`、`/apps`、`/packs`。卡片链接仍是 `/packs/:id`。不增加「查看全部」或新的列表页。
