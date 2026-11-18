## MODIFIED Requirements

### Requirement: App cards can be selected and packs stay links

Apps 标签的每条 MUST 使用与 `/apps` 紧凑货架相同的应用卡。未下架应用 MUST 提供与该货架相同的勾选；勾选 MUST 加入全站安装选择，取消勾选 MUST 从该选择移除。`deletedAt` 非空的软删除应用 MUST 按 `soft-deleted-apps` 展示 **Removed**，MUST NOT 提供勾选，MUST 仍可进入该应用详情。重新拉取点赞列表 MUST NOT 清空全站安装选择。Packs 标签的每条 MUST 使用与 `/packs` 相同的合集轻卡，整卡进入 `/packs/:id`，且 MUST NOT 提供勾选。两条列表的卡片都 MUST NOT 提供点赞或取消点赞。系统 MUST NOT 为这些卡片请求 `GET /apps/:id/stats` 或 `GET /packs/:id/stats`。卡片 MUST NOT 展示点赞发生时间。

#### Scenario: Checking an app joins the site selection

- **WHEN** 已登录用户在 `/my/favorites` 的 Apps 标签勾选一个未下架应用
- **THEN** 该应用进入全站安装选择，且页面 MUST NOT 为此调用取消赞接口

#### Scenario: Soft-deleted favorite cannot join the selection

- **WHEN** 已登录用户在 Apps 标签看到一条 `deletedAt` 非空的应用
- **THEN** 该卡 MUST NOT 提供勾选

#### Scenario: Reloading likes keeps the selection

- **WHEN** 用户已勾选若干应用，随后再次进入 `/my/favorites` 使列表重新加载
- **THEN** 这些应用仍留在全站安装选择中
