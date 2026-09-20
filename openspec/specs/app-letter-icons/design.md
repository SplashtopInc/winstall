## Context

约束见仓库根目录 `AGENTS.md` 与 `openspec/config.yaml`。需求见同目录 `spec.md`。

`components/AppIcon.js` 是全站应用图标入口：本地精选 / `localIconOverrides` → 成对 `iconUrl`+`iconPng` → 空 `icon` 走字母占位（抽不出字则 `GenericAppIcon`，`/generic-app-icon.svg`）→ 外链或 CDN 文件名；`ExternalAppIcon` 与 `AppPicture` 的 `onError` 仍落到包装盒。`PackPreview` 将空 `icon` 的应用纳入马赛克并传入 `name`。

## Goals / Non-Goals

**Goals:**

- 只替换「空字段」那条 generic 分支，坏图路径保持包装盒。
- 字母抽取与配色可单测，不绑 React。
- 字母块在现有 `picture`/`img` 槽里对齐，不逐页改布局。

**Non-Goals:**

- 加载失败改字母、两字符、圆形头像。
- 服务端生成 PNG、改 API、补全缺失 icon。
- 为 carousel 采色伪造 raster（无图仍 `null`）。
- 改写 `CategoryApp` 的本地精选 `<picture>`（不走 `AppIcon`）。

## Decisions

### 1. 字母只接在「空 icon」分支

**选择：** 保持现有优先级。仅当未命中本地精选 / override，且没有成对 `iconUrl`+`iconPng`，且 `icon` 去空白后为空时，才尝试字母；失败再 `GenericAppIcon`。`onError` 不改。

**理由：** 与选定范围一致：字母表示「目录没给图」，包装盒表示「给了图但没画出来」。

**备选：** 坏图也改字母——扫读更好，但会把 CDN 故障伪装成缺字段，已否决。

### 2. 纯函数抽出字母与底色

**选择：** 新增 `utils/appLetterIcon.js`：`getAppLetter({ name, id })` 与 `getAppLetterBackground(id)`。可见字符：Unicode 字母、数字、CJK；跳过空白与 `.` `-` `+`。拉丁 `toUpperCase`。`_id` 取最后一个 `.` 分段。底色用短色板按 `_id` 的稳定哈希取模；无 id 用固定中性色。色板避开包装盒那组粉紫渐变，便于和坏图区分。

**理由：** `AppIcon` 已偏长；规则要在列表、详情、Pack 预览一致，适合单测。

**备选：** 全写在组件里——难测。用 `canvas` 画 PNG——多余，且 carousel 不需要。

### 3. 字母节点对齐 img 槽，不抄 Nav 圆形

**选择：** `AppIcon` 内渲染一块与现有 `img` 同宽高属性（25）的方形容器，文字居中。样式用模块或 `:global` 补 `width/height 100%`、`object-fit` 同类填充，圆角跟各页对 `img`/`picture` 的规则走（由父级裁切）。不使用 `nav.module.scss` 的 `defaultAvatar` 圆形。

**理由：** 多页用 `:global(picture)` 撑满；裸 span 会缩在角落。字母不是用户头像。

**备选：** 给每页加字母选择器——面太大。内联 SVG 生成图标——改动更多，对 25px 无收益。

### 4. Pack 预览纳入空 icon

**选择：** `PackPreview` 去掉「非空 icon 才进马赛克」的过滤，传入 `name`，仍 `slice` 上限。`PackCard` 已不按 icon 过滤，保持。

**理由：** 否则封面仍看不到字母占位，与列表不一致。

**备选：** 只改 `AppIcon`、封面继续丢空 icon——行为裂开。

## Risks / Trade-offs

- **[Risk] 大量应用以 V/M 开头，一格字母碰撞。** → Mitigation：hash 底色分开同一字母；不为此改两字。
- **[Risk] 字母块未被现有 `picture` 选择器覆盖导致缩角。** → Mitigation：字母容器本身铺满 100%，父级裁切；实现时核对详情、carousel、选中栏、Pack 卡。
- **[Risk] 空格或 `"null"` 字符串被当成有图。** → Mitigation：去空白后判空；不把字面 `"null"` 当特殊值，除非已有同类清洗。
- **[Trade-off] CDN 404 仍是包装盒。** → 接受；空字段才字母。

## Migration Plan

只发 Web。回滚：`AppIcon` 空字段改回 `GenericAppIcon`，恢复 `PackPreview` 过滤，删除 `utils/appLetterIcon.js` 与字母样式。
