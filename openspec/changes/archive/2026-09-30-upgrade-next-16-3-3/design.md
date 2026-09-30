## Context

见 proposal.md 的 Why。现状：`package.json` 声明 `next@^16.3.0`，`package-lock.json` 解析为 **16.3.1**。应用只用 Pages Router（`pages/`，无 `app/`、无 `middleware`）。`next.config.js` 仅包一层 `@serwist/next` 的 webpack 插件；生产构建已是 `next build --webpack`，开发是 `next dev --turbopack`。Docker 为 `node:22-slim`，`STANDALONE_BUILD=true` 时 `output: "standalone"`。`overrides["next-auth"].next` 已是 `$next`。没有 `next/image`，也没有 `images` 配置。

16.3.2 是 bug 回移（App 目录导出校验、catch-all 首页、Turbopack、Turborepo OIDC）。16.3.3 只含两条安全修复：Windows 缓存路径反斜杠转义，以及在上游 `libheif` 修复传开前关闭 AVIF 优化。`next@16.3.3` 的 `optionalDependencies.sharp` 仍是 `^0.35.3`。当前 lockfile 解析为 **0.35.3**，早于修好 libheif 的 **0.35.4**。`ip-address@10.4.0` 由 `mongodb@5.9.2` → `socks` 引入。直接依赖 `undici` 声明为 `^7.24.6`，lockfile 为 **7.29.0**；`utils/proxyConfig.js` 只用 `EnvHttpProxyAgent`。

## Goals / Non-Goals

**Goals:**

- 把解析到的 `next` 固定到 **16.3.3**，使 CVE-2026-75604 与 GHSA-2xp9-vwfh-vxw4 不再覆盖当前 lockfile。
- 把解析到的 `sharp` 固定到 **0.35.4**，使 GHSA-rgj7-g3m4-5g8c（libheif 的 GHSA-g89c-p67h-r497 与 GHSA-2jg2-4ch7-h545）不再覆盖当前 lockfile。
- 把解析到的 `ip-address` 固定到 **10.7.1**，使 GHSA-2vr4-cq9g-pvrc 与 GHSA-j6r3-76f7-8jcv 不再覆盖当前 lockfile。
- 把直接依赖 `undici` 固定到 **7.29.1**，使 GHSA-3wwx-pv8p-q78v 不再覆盖当前 lockfile。
- 升级后生产 webpack 构建、standalone 产物、现有测试仍通过。

**Non-Goals:**

- 升到 16.4 或更新的 minor。
- 改 Serwist、Auth、React、Node 引擎、Dockerfile、构建脚本。
- 处理 Next、sharp/libheif、ip-address、undici 这几条告警以外的 audit 项。
- 改 `utils/proxyConfig.js` 或 Mongo 连接方式。

## Decisions

### 1. 只锁到 16.3.3，不放开到最新 16.x

**选择：** `package.json` 保持 `"next": "^16.3.0"`，用 `npm install next@16.3.3` 更新 lockfile，使 `node_modules/next` 为 **16.3.3**。不把范围改成 `^16.4` 或 `latest`。

**理由：** `^16.3.0` 已经允许 16.3.3。安全发布是补丁，产品行为不变。再往上跳会带进未在本 change 里评估的 minor 变更。

**备选：** 把声明改成精确的 `16.3.3`。不采用：与仓库其它依赖的 caret 范围不一致，后续补丁还要再改 manifest。

### 2. 不改构建方式

**选择：** `dev` 继续 Turbopack；`build` / `build:docker` 继续 `--webpack`。

**理由：** 16.3.2 的 Turbopack 修复只影响开发服务器，不要求改脚本。生产仍依赖 `@serwist/next` 注入的 webpack 配置；Next 16 在检测到 webpack 配置时，默认 Turbopack 构建会失败。这条路径在上次升到 16.3 时已经定过。

### 3. 不新增图片配置

**选择：** 不设置 `images.formats`，也不关闭 Image Optimization 路由。

**理由：** 16.3.3 已在框架内禁用 AVIF 优化。本应用不走 `next/image`，没有需要补偿的展示行为。禁用 AVIF 只挡住 Next 图片优化入口；lockfile 里的 `sharp@0.35.3` 仍会被 GHSA-rgj7-g3m4-5g8c 标记，所以版本本身仍要升。

### 4. 用 overrides 把 sharp 锁到 0.35.4

**选择：** 在 `package.json` 的 `overrides` 增加 `"sharp": "0.35.4"`，让 Next 的可选依赖解析到 **0.35.4**（自带 libheif 1.23.2）。不把 sharp 写入 `dependencies`。实现时 caret `^0.35.4` 会被 npm 解析到已发布的 0.35.5，超出本 change 评估过的补丁，因此 lock 用精确版本。

**理由：** `next@16.3.3` 发布时 sharp 的修复版还不在其声明里，范围仍是 `^0.35.3`，现有 lock 停在 0.35.3。只执行 `npm install next@16.3.3` 不会改掉已锁定的 sharp。仓库已用 overrides 约束传递依赖（`serialize-javascript`、`uuid`、`browserslist`），同一做法能避免以后重新解析又回到 0.35.3。`^0.35.3` 与 `^0.35.4` 兼容，不会和 Next 的 peer/optional 范围冲突。

**备选：** 只 `npm update sharp`、不写 override。不采用：范围仍允许 0.35.3，lockfile 一旦按旧范围重解就可能回到受影响版本。

### 5. 用 overrides 把 ip-address 锁到 10.7.1

**选择：** 在 `overrides` 增加 `"ip-address": "10.7.1"`。不把它写入 `dependencies`。不用 caret：`^10.5.1` 会解析到 10.7.2，超出本 change 点名的修复版本。

**理由：** 它不是顶层依赖，父级 `socks` 的范围是 `^10.1.1`，现有 lock 停在 10.4.0。`10.7.1` 落在该范围内，同时盖住 NAT64 分类（10.5.1）和跨地址族 `isInSubnet()` 比较（10.7.1）。应用代码不调用这些分类方法；告警仍会标在传递依赖上。override 与 sharp 同一做法。

**备选：** 升级 `mongodb` 以带动新的 `socks` / `ip-address`。不采用：Mongo 主版本或次版本不在这几条告警的修复路径上。

### 6. undici 只升到 7.29.1

**选择：** 把 `package.json` 的 `undici` 从 `^7.24.6` 改为 `^7.29.1`，并用 `npm install undici@7.29.1` 把 lockfile 固定为 **7.29.1**。不安装 8.x，也不留在 caret 会解析到的 7.30.0。

**理由：** 它是直接依赖，改声明范围比再加一层 override 清楚，也能避免 caret 仍允许受影响的 7.29.0。7.29.1 仍是 7.x 补丁，`EnvHttpProxyAgent` 的用法不变。8.x 是新的主版本，不在本 change 的评估里。

## Risks / Trade-offs

- **[Risk] 补丁仍可能让 webpack / Turbopack 构建失败。** → Mitigation：实现时跑 `npm test`、`npm run build`；失败则停，不改产品代码来迁就，除非构建错误明确来自该补丁且修复范围仍在本 change 内。
- **[Risk] lockfile 把 `@next/*` 或传递依赖一起抬高。** → Mitigation：只接受 `next@16.3.3` 及其声明的同版本配套（如 `@next/env@16.3.3`）、`undici@7.29.1`，以及 override 带来的 `sharp@0.35.4`（含 `@img/sharp-*`）和 `ip-address@10.7.1`。不顺手升级无关顶层依赖。
- **[Risk] sharp 0.35.4 的预编译二进制与 `node:22-slim`（glibc）不匹配，镜像构建失败。** → Mitigation：`npm run build` 与既有 Docker 安装路径都要能解析 linux glibc 的 `@img/sharp-linux-*`。失败则停，不改用系统 libheif。
- **[Trade-off] 生产在 Linux 上本来打不到 Windows RCE。** → 仍升级，否则 Dependabot / GitHub Advisory 会继续对 lockfile 告警。

## Migration Plan

1. `npm install next@16.3.3 undici@7.29.1`，并加上 `overrides` 中的 `sharp` 与 `ip-address` 后安装，使 lockfile 中 next 为 16.3.3、sharp 为 0.35.4、ip-address 为 10.7.1、undici 为 7.29.1。
2. `npm test` 与 `npm run build` 通过后再合入。
3. 回滚：去掉这两个 override，并把 lockfile 与 `undici` 声明恢复到 `next@16.3.1`、`sharp@0.35.3`、`ip-address@10.4.0`、`undici@^7.24.6`（解析 7.29.0）后重新安装。无数据迁移。

## Open Questions

无。
