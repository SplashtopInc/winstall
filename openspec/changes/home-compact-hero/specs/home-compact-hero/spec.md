## Purpose

压缩首页顶部介绍区，把应用总量放进顶栏搜索 hint，让运营轮播成为首屏主货位，同时保留页面级无障碍标题。

## ADDED Requirements

### Requirement: 首页不展示可见介绍英雄区

首页 MUST NOT 渲染面向视觉用户的介绍英雄区，包括大标题文案「Browse the winget repository」、副文、独立包总量行，以及右侧品牌插画。首页 MUST 仍提供对辅助技术与文档大纲可用的页面主标题（可为视觉隐藏的 `h1`）。页面 `<title>` / Meta 文案 MUST 继续表明这是 winget 仓库浏览页。

#### Scenario: 打开首页看不到 intro 英雄区

- **WHEN** 用户打开首页
- **THEN** 首屏内容区 MUST NOT 展示上述大标题、副文、独立包总量行或右侧品牌插画，且 MUST 仍存在可用的页面主标题（可视觉隐藏）

#### Scenario: 加载态也不展示 intro 英雄区

- **WHEN** 首页处于客户端加载态
- **THEN** 页面 MUST NOT 渲染上述可见介绍英雄区

### Requirement: 顶栏搜索 hint 展示应用总量

当系统已知应用总量且总量大于 0 时，顶栏搜索入口的可见 hint MUST 包含该规模提示，格式为 `Search <rounded>+ apps`，其中 `<rounded>` 为向下取整到 50 的倍数并使用千分位分隔。当总量未知或为 0 时，hint MUST 回退为 `Search apps...`。该 hint MUST 在全站顶栏搜索入口生效，不限于首页路由。

#### Scenario: 有总量时搜索 hint 含规模

- **WHEN** 应用总量已知且大于 0
- **THEN** 顶栏搜索入口 MUST 显示形如 `Search 14,850+ apps` 的 hint（数字为向下取整到 50 的倍数并带千分位）

#### Scenario: 无总量时回退默认 hint

- **WHEN** 应用总量未知或为 0
- **THEN** 顶栏搜索入口 MUST 显示 `Search apps...`
