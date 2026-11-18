## ADDED Requirements

### Requirement: Soft-deleted app detail omits install export actions

已找到但已软删除（`deletedAt` 非空）的 App 详情 MUST NOT 提供 Download installer、Add to list、winget 安装 / 升级命令框或其 Copy。本要求优先于本能力中「已找到可安装详情」的安装导出要求。未软删除的可安装详情行为 MUST 保持不变。

#### Scenario: Soft-deleted detail has no installer actions

- **WHEN** 用户打开已找到且 `deletedAt` 非空的应用详情
- **THEN** 页面 MUST NOT 出现 Download installer、Add to list，也 MUST NOT 出现可复制的 winget 安装或升级命令
