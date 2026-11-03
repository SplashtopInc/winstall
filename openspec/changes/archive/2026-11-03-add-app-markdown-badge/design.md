## Context

行为见 `specs/app-share/spec.md`。动机见 `proposal.md`。

App 详情分享在 `components/AppDetailView.js`。`shareUrl` 已是 `buildSiteUrl(\`/apps/${app._id}\`)`。Copy link 先关掉菜单，再写入剪贴板，成功 toast 为 `Link copied`，失败为 `Copy failed`。toast 是该页已有的 `Toast`，显示约 2 秒。

Pack 的徽章字符串由 `utils/packBadgeMarkdown.js` 的 `buildPackBadgeMarkdown(shareUrl)` 生成：取 URL 的源，拼 `[![Open in winstall]({origin}/badge.svg)]({shareUrl})`。`/badge.svg` 已在 `public/badge.svg`。

分享按钮是操作行最后一颗。菜单 `.shareMenu` 从按钮左缘向下展开，`min-width` 为 200px。

## Goals / Non-Goals

**Goals:**

- 在 Copy link 后面加一个始终可点的 Copy Markdown Badge。
- 复制字符串复用现有纯函数和同一次 `shareUrl`。
- 反馈跟当前 Copy link：关掉菜单，走现有 toast。
- 菜单能单行放下新文案，并且不从页面右侧裁切出去。

**Non-Goals:**

- 不改 Pack 分享，不重命名 `buildPackBadgeMarkdown`，不改 `/badge.svg`。
- 不给徽章渠道做按钮文案切换，也不另做一套反馈组件。
- 不改 `components/SingleApp.js` 里仅在 `large` 时渲染、当前没有页面传入 `large` 的旧分享卡。
- 不给 App 加公开门槛。不把徽章链接做成加入列表或下载。

## Decisions

### 1. 关掉菜单，用现有 toast

`AppDetailView` 在 Copy link 下方增加按钮，图标 `FiCode`，尺寸与菜单里其它图标一致，文案固定为 `Copy Markdown Badge`。点击后先 `setShareOpen(false)`，再 `navigator.clipboard.writeText(buildPackBadgeMarkdown(shareUrl))`。成功 `setToast("Markdown copied")`，失败 `setToast("Copy failed")`。不新增 `badgeCopyStatus`，不改 `copyStatus`。

**理由：** 这条菜单的 Copy link 已经用关掉加 toast 作为反馈。徽章沿用同一条路径，用户不用学习 Pack 面板上那种按钮改文案。

**备选：** 像 Pack 一样留着菜单，按钮变成 `Markdown copied`，约 5 秒后复原。和这条菜单里 Copy link 的反馈不一致。

### 2. 复用 `buildPackBadgeMarkdown`

传入详情页已经拼好的 `shareUrl`。函数不区分 Pack 与 App，输出仍是同一行图片链接。`test/packBadgeMarkdown.test.js` 增加一条 `/apps/Git.Git` 样例，锁住 App 路径。不把函数改名，也不抽一层新的包装。

**理由：** 字符串规则已经测过。改名会碰到 Pack 的调用处和测试，行为不变。

**备选：** 改成 `buildBadgeMarkdown` 再让 Pack 转调。名字更准，但这次没有新的字符串规则。

### 3. 菜单向左展开以放下文案

`.shareMenu` 改为贴着分享按钮的右缘（`right: 0`，不再从左缘向右长），`min-width` 提到能单行放下 `Copy Markdown Badge`，文案 `white-space: nowrap`。分隔线仍只在 Copy link 之前，徽章紧跟 Copy link。

**理由：** 分享按钮在操作行末尾。菜单继续从左缘向右长，加宽后会超出页面右缘。

**备选：** 只加 `min-width`、锚点不动。窄屏或按钮靠右时文案被裁切。

## Risks / Trade-offs

- **[Risk] 在本地或预览源上复制，README 会指向那个源。** 缓解：与 Copy link 使用同一个 `shareUrl`。公开站上的结果是 `https://winstall.app`。
- **[Risk] 函数名仍带 Pack，阅读 App 调用处时会以为只服务 Pack。** 接受。输出与路径无关，测试里同时锁住 Pack 与 App 样例。
- **[Trade-off] 菜单关掉后，用户看不到按钮上的成功态，只能看 toast。** 接受。这就是当前 Copy link 的反馈。
