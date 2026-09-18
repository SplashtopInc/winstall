# shelf-list-skeleton Specification

## Purpose

让分类浏览、Packs 列表和 Add Apps 弹窗在货架数据未到时先展示与真卡同结构的轻骨架，避免一行 Loading 把布局塌掉。

## Requirements

### Requirement: 货架首屏用骨架而非唯一 Loading 文案

在 `/category` 网格、`/packs` 的 Public 与已登录 My Packs 网格、以及 Pack 详情 Add Apps 弹窗的应用网格中，当对应列表尚未返回且当前没有可展示卡片时，系统 MUST 展示与该网格同列结构的占位骨架，MUST NOT 仅以居中 `Loading...` 或 `Loading apps…` 作为唯一加载反馈。骨架 MUST 使用站点既有 CSS（卡片背景、圆角、缓慢透明度脉动），MUST NOT 因此新增第三方库。骨架数量 MUST 大约覆盖两行网格，MUST NOT 按接口整页条数（如 56）生成。Load more 进行中 MUST 只改变该按钮的禁用或文案，MUST NOT 清空已展示卡片，MUST NOT 用骨架替换已有列表。未登录用户在 My Packs 看到的登录说明 MUST 不改为骨架。请求失败 MUST 仍走既有错误态。

#### Scenario: 打开分类页先看到骨架

- **WHEN** 用户打开 `/category` 且第一批应用尚未返回
- **THEN** 页面展示与应用网格同结构的占位卡，而不是仅一行 Loading 文案

#### Scenario: 打开公共 Pack 列表先看到骨架

- **WHEN** 用户打开 Public Packs 且第一批 `GET /packs` 尚未返回
- **THEN** 页面展示与 Pack 网格同结构的占位卡

#### Scenario: Load more 不拆掉已有卡

- **WHEN** 用户激活 Load more 且下一批仍在请求
- **THEN** 已展示卡片仍在，Load more 按钮处于加载态
