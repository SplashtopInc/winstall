## Context

See proposal.md — Why。App 详情已有命令框 Copy（`winget install -e --id`，成功则 `trackAppStats(id, "download")`）和紫的 Add to list。Instant installer 已在 `InstallerExport` → `POST /api/installer`。详情页没有导出 Tab / Default options。

## Goals / Non-Goals

**Goals:**

- 详情操作行并列 Download installer（主）和 Add to list（次）
- 复用现有 installer 下载与单 App track，版本跟详情选择器

**Non-Goals:**

- 不在详情上铺 Generate 的 Tab / AdvancedConfig
- 不改详情命令格式
- 不抽整页 `ExportApps`

## Decisions

### Decision 1: 操作行主次（方案 B）

**选择**: Download installer 用现有 `btnPrimary`（紫、50px）。Add to list 改成描边次要按钮（可复用 `likeBtn` / `btnGhost` 的描边语言，但保持文字按钮宽度）。Like / Share 位置不变。Copy 不动。

**理由**: 已拍板推「当场装」；清单仍在，只是不再抢第一眼。

**备选**: Add to list 继续紫 — 拒绝，方案 A。两个都紫 — 拒绝，没有主操作。

### Decision 2: 直接下载，不开抽屉

**选择**: 点击即请求 installer。处理中沿用 Generate 的 Processing 文案/倒计时。失败用现有 alert。可选一行 tip：*Download the instant installer and run!*，放在操作行上方或按钮附近，不挡主按钮。

**理由**: 单 App 没有多类型可选；再开抽屉是把 Pack 的复杂度搬过来。

**备选**: 点开迷你抽屉再下 — 拒绝。

### Decision 3: 抽出下载函数，不在详情挂整份 Export UI

**选择**: 把 `InstallerExport` 里组 payload、`POST /api/installer`、同步 blob / 异步 poll 收到 `utils/`（或同目录 helper）。`InstallerExport` 与 `AppDetailView` 都调用它。详情只传当前 app（`_id`、`name`、选中 version）。默认 flags 与 Generate installer 一致（默认 silent）。

**理由**: 详情不要为了一个按钮挂 Tab / options。逻辑只应有一份。

**备选**: 详情里复制一份 fetch — 拒绝。把整个 `InstallerExport` 塞进详情并藏 tip — 过重。

### Decision 4: Track 与 Copy 对齐

**选择**: installer **下载成功** 后 `trackAppStats(app._id, "download")`，与 Copy 相同。点了但失败不记。不记 pack track。

**理由**: `detail-engagement` 已把「该 App 自己的下载」算进 lifetime；installer 是另一条自己下载。

**备选**: 用 `reportExportDownload` — 多 App 列表语义，详情一个 id 也能用，但 Copy 已经走 `trackAppStats`，对齐 Copy 更简单。

## Risks / Trade-offs

- **[Risk] 用户以为是官网安装包** → Mitigation：文案跟 Generate；tip 用 instant installer。
- **[Risk] 未签名 exe / AV** → Mitigation：现网 Generate 已有，不在本 change 做签名。
- **[Risk] Add to list 变弱** → Mitigation：仍在同一行，只改主次。
- **[Risk] 抽出 helper 时弄坏 Generate installer** → Mitigation：`InstallerExport` 只改调用点，行为验收 Generate + 详情各一次。

## Migration Plan

前端-only。无数据迁移。回滚即去掉详情按钮并还原 Add to list 主样式。

## Open Questions

无。
