## Context

见 `proposal.md` 的 Why。现状：`utils/packLimits.js` 把公开名额和提示都写成 10。`components/CreatePackModal.js` 与 `components/PackShareCard.js` 用 `GET /packs/me` 数 `visibility=public`，达到 10 就禁用勾选。比较用的用户标识是传入的 `user.id`，与 Pack 的 `userId` 相同。网站进程没有 `PACK_TRENDING_OWNER_USER_ID`。运行时配置进浏览器的现有做法是 `pages/_document.js` 写 meta，浏览器再读，不用 `NEXT_PUBLIC_*`。

## Goals / Non-Goals

**Goals:**

- 运营账号 id 与当前 `user.id` 全等时名额为 200，否则为 10。
- 两处勾选和提示共用这一结果。已是 public 的当前 Pack 仍不拦截。

**Non-Goals:**

- 不改 winstall-api 的 10 个上限，不改首页榜的 20 条，不改 `GET /packs/me` 的返回形状。

## Decisions

### 运行时环境变量经 meta 进浏览器

**选择：** 网站读取 `process.env.PACK_TRENDING_OWNER_USER_ID`，去掉首尾空白。`pages/_document.js` 写入 meta `winstall-pack-trending-owner`，内容为该字符串，未配置则为空。浏览器只读这个 meta。服务端渲染同一 helper 时直接读环境变量。

**理由：** 与 `winstall-show-stats`、`winstall-api-base` 相同，部署时改环境变量即可，不把值冻进构建产物。

**备选：** `NEXT_PUBLIC_PACK_TRENDING_OWNER_USER_ID`。本仓库已拒绝用 `NEXT_PUBLIC_*` 做运行时地址和开关。硬编码 id 则换运营账号要改代码。

### 名额函数收口在 packLimits

**选择：** `utils/packLimits.js` 保留普通名额 10，增加运营名额 200。新增函数：给定当前用户公开 id 与运营账号 id，空运营 id 一律返回 10；二者全等返回 200；否则返回 10。提示改为按名额拼出 `Public pack limit reached (N). Unpublish or delete a pack to continue.`。两处组件继续用 `countPublicPacksInList`，只把比较用的常量换成这个函数的返回值。

**理由：** 计数和「已经是 public 则不拦截」已经在组件里，不必再包一层。名额差异只有一个判断。

**备选：** 组件各自比较 id。两处会各写一遍 200 和文案。

### 缺省 meta 按未配置处理

**选择：** 浏览器找不到该 meta，或内容去掉空白后为空，名额为 10。不把空字符串当成用户 id。

**理由：** 旧页面或漏写 meta 时退回现有行为，不会把所有人放成 200。

## Risks / Trade-offs

- [运营账号在界面上超过 10 个后提交仍被 API 400] → 接受。错误沿用两处现有的接口错误展示。放宽 API 不在本 change。
- [网站与 API 的 `PACK_TRENDING_OWNER_USER_ID` 不一致] → 名额判断会错。`.env.example` 写明必须与 API 使用同一个用户公开 id。
- [运营账号 id 出现在每页 HTML] → 该 id 已随 Pack 的 `userId` 出现在接口响应里，meta 不新增秘密。

## Migration Plan

部署网站时设置与 API 相同的 `PACK_TRENDING_OWNER_USER_ID`。未设置则界面保持每人 10。回滚时去掉该变量或还原本次提交，勾选重新按 10 拦截。不迁移数据。

## Open Questions

无。
