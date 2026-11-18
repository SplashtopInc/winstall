## Context

见 `proposal.md`。API 侧 `deletedAt` 已落地：详情始终带键；liked / Pack hydrate 会带非空值；发现列表已排除软删除。本站详情 `slimAppForDetailPage` 目前丢掉 `deletedAt`；Pack 只把 `available === false` 当成 `unavailable`；收藏卡片无下架态。静态稿：`.demo/app-removed.html`、`.demo/liked.html`、`.demo/pack-detail.html`。

## Goals / Non-Goals

**Goals:**

- 用 `deletedAt != null` 作为前端唯一下架判定
- 详情墓碑、收藏 Removed、Pack Removed vs Unavailable，与 demo 视觉对齐
- 软删除应用不进入 Pack 安装集合

**Non-Goals:**

- 不改造发现类列表 / 搜索 / 热度 / sitemap（API 已滤）
- 不在本变更强制清理 `/generate` 本地已选或 `/express` 策展位（可另开）
- 不新增管理端软删 / 恢复 UI
- 不回填历史上硬删导致的 Pack Unavailable

## Decisions

1. **判定**：`deletedAt != null`（含非空 ISO 字符串）。`null` 或缺键视为在架。不用单独布尔。
2. **详情装配**：`slimAppForDetailPage`（或等价）保留 `deletedAt`；`pages/apps/[id].js` 在有 app 且已下架时渲染墓碑组件，否则走现有 `AppDetailView`；404 仍 `AppNotFound`。
3. **墓碑组件**：新建独立组件（如 `appRemovedView` / 约定 lowerCamelCase），不要把安装区 if 进 `AppDetailView` 堆成双形态。布局对齐 `.demo/app-removed.html`：身份行 + Removed、说明块、Like、描述与 Information。
4. **Meta**：墓碑标题 `{name} | winstall`；description 写已下架；`MetaTags` 增加可选 `noindex`（或墓碑页单独写 robots）。不输出 `AppJsonLd`。
5. **收藏**：`SingleApp`（或 favorites 包装）读 `app.deletedAt`：展示 Removed，隐藏勾选，链接仍 `/apps/:id`。
6. **Pack**：`normalizePackDetailApps` 增加 `removed: deletedAt != null`（命名以实现为准）；`unavailable` 仍仅 `available === false`。`PackDetailAppCard`：removed 显示 Removed 且可链；unavailable 保持现状。`installableApps` 排除二者。
7. **文案**：可见标记统一英文 **Removed** / **Unavailable**，与 demo 一致。

## Risks / Trade-offs

- [ISR 缓存仍是可安装页] → 依赖现有 revalidate；部署后下架应用最多延迟一个 revalidate 周期才变墓碑
- [本地已选仍含下架应用] → 本变更不处理；若用户从旧会话进入 generate，可能仍导出，接受为后续项
- [Like 仍可点] → 与 API「文档存在即可赞」一致；墓碑保留 Like

## Migration Plan

1. 合并前端后即可；依赖 API 已发布 `deletedAt` 契约
2. 回滚：去掉墓碑与标记后，软删除详情会再次表现为可安装页（行为回退，无数据迁移）
