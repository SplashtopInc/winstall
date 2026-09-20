## Why

目录里不少应用没有 `icon` 字段，界面一律落到同一张包装盒 SVG，列表和 Pack 预览难以分辨。应用名已经在绝大多数 `AppIcon` 调用点传入，可以用一个字母占位，把「没图」变成仍能扫读的身份块。

## What Changes

- 当应用 **没有可用的 `icon` 字段**（空字符串或缺省）且没有本地精选图 / override / 成对的 `iconUrl`+`iconPng` 时，`AppIcon` 改为展示 **一个** 字母图标，而不是包装盒。
- 字母取自应用名第一个可见字符（字母、数字或 CJK）；西文大写。名字抽不出字时，再用 `_id` 最后一段。全局统一一格，不按尺寸改两字。
- 底色由 `_id` 稳定 hash，同一应用刷新不变色。
- **有 `icon` 或已解析出的图标 URL 时仍加载真图**；加载失败（`onError`）**继续用现有包装盒** `generic-app-icon.svg`，不改成字母。
- 既抽不出字母又没有 `_id` 可用字符时，仍用包装盒。
- Pack 预览马赛克不再把空 `icon` 的应用滤掉，以便字母占位能出现在封面。
- 不改 API、不生成静态 PNG、不新增图标 CDN。

## Capabilities

### New Capabilities

- `app-letter-icons`：空 `icon` 字段时用应用名生成单字母占位图标；坏图仍用包装盒。

### Modified Capabilities

- （无）`home-trending`、`pack-list-browse` 等仍要求展示目录图标，不规定空字段时的像素形态。

## Impact

- 前端：`components/AppIcon.js`；抽出 lowerCamelCase 字母与配色辅助（如 `utils/appLetterIcon.js`）；`components/PackPreview.js` 停止丢弃空 icon 并传入 `name`。
- 样式：字母块需对齐现有 `picture`/`img` 占位尺寸与圆角，避免详情大图、carousel、选中栏缩略图错位。
- `utils/resolveAppIconSampleUrl.js` 在无 raster 时仍返回 `null`，carousel 采色走既有默认 tint。
- 无 API、无 breaking。
