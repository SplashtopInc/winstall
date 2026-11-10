## 1. 推送函数

- [x] 1.1 `utils/gtm.js` 用 `GTM_EVENT`、`GTM_FIELD`、`GTM_VALUE` 统一管理事件名、字段和枚举，并提供 `ws_page_loaded` 与五个行为事件的推送函数。未取得 Osano 分析同意时不写 `dataLayer`，推送前清掉上一条事件的字段

## 2. 搜索

- [x] 2.1 在 `pages/apps.js` 于一次新的合格全局搜索的第一页结束后调用 `trackSearch`：成功传入 `resultCount`，失败只传 `searchTerm`

## 3. 软件安装

- [x] 3.1 在 `components/AppDetailView.js` 于 winget 命令写入剪贴板成功后调用 `trackAppInstall`，`installFormat` 为 `command`。下载安装包成功后同样调用，`installFormat` 为 `installer`。复制链接和 Markdown 不调用

## 4. Pack 安装

- [x] 4.1 在 `components/InstallDrawer.js` 使用的导出组件里，于复制或下载成功后调用 `trackPackInstall`，并传入该 Pack 的 `packId` 和软件个数。格式不含 `command`
- [x] 4.2 在 `pages/generate.js` 的导出成功处调用 `trackPackInstall`，`packId` 使用 `GTM_VALUE.packId.generate`。复制等剪贴板成功；下载以及「下载并复制」只推一条 `download`。现有导出统计回调保持原位

## 5. 分享

- [x] 5.1 在 `components/PackShareCard.js` 于复制链接、复制 Markdown 成功或打开 X、Facebook、LinkedIn 分享窗口时调用 `trackShare`，`shareType` 为 `pack`
- [x] 5.2 在 `components/AppDetailView.js` 与 `components/SingleApp.js` 的同样成功时机调用 `trackShare`，`shareType` 为 `app`。只打开分享卡片不调用

## 6. 广告点击

- [x] 6.1 在 `components/homeCarousel.js` 激活出站链接时调用 `trackAdClick`，位置使用 `GTM_VALUE.adPlacement.homeCarousel`，不改 `utm_*`
- [x] 6.2 在 `components/DonateCard.js` 激活出站链接时调用 `trackAdClick`，位置使用该卡片已有的 placement，且该值属于 `GTM_VALUE.adPlacement`
