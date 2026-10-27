## Context

行为见 `specs/pack-share/spec.md`。动机见 `proposal.md`。

Pack 详情操作行在 `pages/packs/[id].js`。主人当前顺序是 Install、Add App、点赞、More。More 里是 Edit、Delete、Share。Share 关掉菜单后渲染 `components/PackShareCard.js`，卡片和菜单共用 `packMenuWrapper`，点外面一起关掉。

卡片在 `visibility !== "public"` 时先展示 “Make this pack public to share”。勾选会 `PATCH /packs/:id`，把 `visibility` 写成 `public`。公开名额是每人 10 个。四个渠道在未公开时 `disabled`。Copy link 用 `buildSiteUrl(\`/packs/${pack._id}\`)` 复制绝对 URL，成功文案 “Link copied”，失败 “Copy failed”，约 5 秒后回到 “Copy link”。站点源在浏览器里取 `window.location.origin`。

品牌色：字标渐变一端是 `#6D1CDD`，站点强调色是 `#9B2EFF`。亮粉 `#FC3AA2` 上放白字对比不够。操作按钮是 48px 高的描边胶囊；点赞、Share 和 More 是 48px 圆钮。窄于 590px 时描边按钮变成通栏，圆钮保持 48px。

## Goals / Non-Goals

**Goals:**

- Share 用与点赞、More 相同的 48px 圆图标按钮，锚在点赞和 More 之间，面板从这颗按钮向下打开。
- 第五个渠道复用现有禁用、公开门槛和复制反馈，另用一份状态。
- 徽章 Markdown 由纯函数生成，测试锁住那一行字符串。
- `/badge.svg` 使用下面这张图，路径不再改。

**Non-Goals:**

- 不改公开门槛、不增加 unlisted、不改每人 10 个公开 Pack 的限制。
- 不给访客加 Share，不改 App 详情的 Share。
- 不把徽章链接做成导入或 Fork。

## Decisions

### 1. Share 按钮与 More 拆开锚点

主人操作行：Install、Add App、`LikeButton`、Share、More。Share 使用 `shareTrigger`，尺寸与 `packMenu` 相同，图标为 `FiShare2`，不展示文字，可访问名称为 `Share`。`PackShareCard` 挂在 Share 按钮自己的相对定位容器上，绝对定位在按钮下方。More 的容器只留 Edit 和 Delete。

两套开关分开。打开其中一个时关掉另一个。点 Share 容器外关闭分享面板；点 More 容器外关闭菜单。窄屏下 Share 保持 48px 圆钮，不随 `actionButton` 变成通栏。

**理由：** 操作行里点赞和 More 已经是圆图标，Share 去掉文字后与它们对齐。面板必须跟着按钮走，否则它还会从 More 的位置弹出来。

### 2. 第五个渠道跟在 Copy link 后面

`PackShareCard` 在 Copy link 下方增加按钮，空闲文案 `Copy Markdown Badge`，成功 `Markdown copied`，失败 `Copy failed`。用独立的状态，不用现有 `copyStatus`。重置时间与 Copy link 相同。`disabled` 条件与另外四个渠道相同：`visibility` 不是 `public`。

复制字符串交给 `utils/packBadgeMarkdown.js` 的 `buildPackBadgeMarkdown(shareUrl)`。`shareUrl` 就是卡片已经拼好的 Copy link。函数取它的源和路径，返回：

`[![Open in winstall]({origin}/badge.svg)]({shareUrl})`

`test/packBadgeMarkdown.test.js` 覆盖提案里的那条 `https://winstall.app` 样例，以及「图片源与链接源相同」。

**理由：** 徽章会长期留在别人的仓库里，字符串不能散落在点击处理函数里。和 Copy link 共用同一次拼好的 URL，避免徽章和链接各走一个源。

**备选：** 写死 `https://winstall.app`。在本地或预览域名上会复制出与地址栏不一致的链接。

### 3. 徽章沿用 shields 扁平方牌，不加图标

文件是 `public/badge.svg`，由 Next 以 `/badge.svg` 匿名提供。尺寸 104×20，圆角 3。左段 `#555` 写 `Open in`，右段 `#6D1CDD` 写 `winstall`。字号、字距和顶部浅高光与 shields.io 的 flat 徽章一致。`title` 与 `aria-label` 为 `Open in winstall`。没有图标、脚本、外链图片或外链字体。

不加图标。站内包装标志在 20px 高里缩成一块认不出的形状。GitHub README 里成排出现的徽章默认也是纯文字，只有 GitHub、npm 这类轮廓简单的标志才放进左段。

实现时把下列文档原样写入 `public/badge.svg`：

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="104" height="20" role="img" aria-label="Open in winstall">
  <title>Open in winstall</title>
  <filter id="blur"><feGaussianBlur stdDeviation="16"/></filter>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r"><rect width="104" height="20" rx="3"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="53" height="20" fill="#555"/>
    <rect x="53" width="51" height="20" fill="#6d1cdd"/>
    <rect width="104" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110">
    <g transform="scale(.1)">
      <g aria-hidden="true" fill="#010101">
        <text x="275" y="150" fill-opacity=".8" filter="url(#blur)" textLength="430">Open in</text>
        <text x="275" y="150" fill-opacity=".3" textLength="430">Open in</text>
      </g>
      <text x="275" y="140" textLength="430">Open in</text>
    </g>
    <g transform="scale(.1)">
      <g aria-hidden="true" fill="#010101">
        <text x="775" y="150" fill-opacity=".8" filter="url(#blur)" textLength="410">winstall</text>
        <text x="775" y="150" fill-opacity=".3" textLength="410">winstall</text>
      </g>
      <text x="775" y="140" textLength="410">winstall</text>
    </g>
  </g>
</svg>
```

**理由：** 这是 README 里最常见的徽章外形，自带底色，浅色和深色页面上都是白字。右段用品牌紫 `#6D1CDD`，白字对比够。字宽用 `textLength` 锁住，不随系统字体撑破方牌。

**备选：** 外链 shields.io。外形相同，但图片地址不受我们控制，也和已经定下的 `/badge.svg` 不一致。整段单一紫色、不加左右分色也可以，但成排徽章里分色更易认。

## Risks / Trade-offs

- **[Risk] `/badge.svg` 被写进 README 后不能改名。** 缓解：路径和文件内容都在本变更里定死；以后只改内部图形时仍使用这个路径。GitHub 会缓存图片，改像素后旧缓存会留一阵。
- **[Risk] `<text>` 随系统字体变宽。** 缓解：左右两段都用 `textLength` 锁住字宽，总宽 104。
- **[Risk] 主人在本地或预览源上复制，README 会指向那个源。** 缓解：与 Copy link 使用同一个 `shareUrl`。公开站上的复制结果就是 `https://winstall.app`。
- **[Risk] Share 更显眼之后，勾选即公开更容易被点到。** 接受。门槛、名额和确认方式这次不改。
- **[Trade-off] Share 只剩图标，第一次使用要靠图标辨认。** 接受。可访问名称仍是 `Share`，窄屏也不再单独占一行通栏。

## Migration Plan

先上 `public/badge.svg`，再放按钮和渠道。回滚 UI 时保留该文件：已经贴出的 README 仍要能取到图。没有数据迁移。
