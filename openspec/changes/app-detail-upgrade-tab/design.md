## Context

见 proposal.md 的 Why。详情命令区在 `components/AppDetailView.js`，样式在 `styles/appDetail.module.scss`。安装命令的 Copy 已调用 `trackAppStats(id, "download")`。`utils/trackAppStats.js` 对同一个 App 的 download 有 5 秒去重，键只有包 id。`components/SingleApp.js` 的安装与升级命令只在 `large` 为真时渲染，现有调用都不传 `large`。

## Goals / Non-Goals

**Goals:**

- 用同一条命令框切换安装与升级，版本选择器只跟安装命令走。
- 两条 Copy 都走现有 app `download` track，不去拆去重键。
- 删掉列表卡片上到不了的命令块。

**Non-Goals:**

- 不改生成页和 Pack 导出的命令方言。
- 不拆掉 `SingleApp` 里其余未使用的 `large` 布局。
- 不把详情 tab 做成生成页 `tabHeader` 那种会写入 localStorage 的导出切换。

## Decisions

1. **命令区用两个 tab，底下仍是现在这一条 `.cmd`。**
   - 标题改为 `{name} with winget`。其下是 Install / Upgrade，`role="tablist"`。选中态用详情页已有的强调色，不引入生成页的导出 tab 样式。
   - 默认 `install`。状态只放在组件 state。
   - **理由**：两条命令同一时间只看一条，窄屏不会叠出两块整行 Copy。生成页 tab 会记住上次选择，详情页若记住，下次会直接打开升级命令。

2. **版本选择器只在 Install tab 渲染，钉选状态不随 tab 丢掉。**
   - 安装命令继续用现有 `pinnedVersion`：空则省略 `-v`，有值则 `winget install -e --id {id} -v "{version}"`。
   - 升级命令固定为 `winget upgrade -e --id {id}`。
   - Download installer 继续读同一个 `pinnedVersion`。
   - **理由**：升级的含义是升到源里的最新版。把版本控件留在标题右侧会让人以为它也改升级命令。

3. **一个 Copy，一个 `copied` 布尔。切换 tab 时把它设回 false。**
   - 复制安装与复制升级都调用现有 `handleCopy` 路径上的 `trackAppStats(app._id, "download")`。
   - 不修改 `trackAppStats` 的去重键。
   - **理由**：两条复制算同一条 download。5 秒内的第二次调用会被现有去重丢掉。

4. **删除 `SingleApp` 里 `{large && ...}` 的说明段落和 `Copy`。**
   - `Copy` 只被那一处使用，连同 `upgradeStr` 一起删。
   - `large` 的其余元数据、标签和按钮不动。
   - **理由**：命令在现有页面上不可达；列表卡片的职责是扫和打开详情。

## Risks / Trade-offs

- [Risk] 升级 tab 把版本选择器藏起来后，用户不知道 Download installer 仍用钉选版本 → Mitigation：钉选状态保留，安装 tab 回到时版本控件显示原选择；规格要求下载仍跟钉选走。
- [Risk] 5 秒内先复制安装再复制升级，第二次没有新的 track，页面仍显示复制成功 → Mitigation：这是「两条算同一条」的预期。复制成功态只表示剪贴板，不表示新的一笔计数。

## Migration Plan

无数据迁移。发布后详情页默认仍是安装命令。回滚时去掉 tab，恢复单独的安装命令框即可。

## Open Questions

无。
