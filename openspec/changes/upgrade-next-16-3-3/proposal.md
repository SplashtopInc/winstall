## Why

GitHub 告警 **CVE-2026-75604**（[GHSA-p293-qw3h-jr36](https://github.com/vercel/next.js/security/advisories/GHSA-p293-qw3h-jr36)）：未认证请求可在 Windows 托管的 Next.js 上远程执行代码。锁定版本 `next@16.3.1` 落在 `>= 16.0 < 16.3.3` 受影响区间。同一次安全发布还修了 Image Optimization 处理 AVIF 时的 RCE（[GHSA-2xp9-vwfh-vxw4](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4)）。生产镜像是 Linux，Windows 这条利用路径打不到现网，但依赖版本仍会被扫描标记，需要升到已修复版本。

同一条 libheif 问题还以 **sharp** 包告警出现（[GHSA-rgj7-g3m4-5g8c](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c)）：上游 [GHSA-g89c-p67h-r497](https://github.com/strukturag/libheif/security/advisories/GHSA-g89c-p67h-r497) 与 [GHSA-2jg2-4ch7-h545](https://github.com/strukturag/libheif/security/advisories/GHSA-2jg2-4ch7-h545)。`sharp` **< 0.35.4** 捆绑的 libheif 在 glibc Linux 上解码不可信 AVIF/HEIC 时可能远程执行代码。当前 lockfile 是 `sharp@0.35.3`，且 `next@16.3.3` 的 optional dependency 仍是 `sharp@^0.35.3`，只升 Next 不会离开受影响版本。生产镜像 `node:22-slim` 是 glibc，这条告警对现网依赖扫描成立。

另外两条依赖告警也要在同一次升级里清掉：

- **ip-address**（[GHSA-2vr4-cq9g-pvrc](https://github.com/beaugunderson/ip-address/security/advisories/GHSA-2vr4-cq9g-pvrc) / CVE-2026-101910）：`10.2.0` 至 `10.5.1` 之前，`Address6` 不把 NAT64 本地用途网段 `64:ff9b:1::/48` 判为私有，用这些分类做信任边界时可能绕过 SSRF 检查。当前 lockfile 是 **10.4.0**，由 `mongodb` → `socks`（`ip-address@^10.1.1`）引入。修复版本是 **10.5.1**。
- **undici**（[GHSA-3wwx-pv8p-q78v](https://github.com/nodejs/undici/security/advisories/GHSA-3wwx-pv8p-q78v) / CVE-2026-85024）：WebSocket `permessage-deflate` 在解压超过上限后又收到畸形 DEFLATE 时，会丢掉 zlib 的 error 监听，未处理错误可打垮整个 Node 进程。`7.28.0` 至 **7.29.1** 之前受影响。`package.json` 是 `^7.24.6`，lockfile 是 **7.29.0**。修复版本是 **7.29.1**。应用只用 `EnvHttpProxyAgent` 做代理，不打开 undici WebSocket，但包版本仍会被扫描标记。

## What Changes

- 将 `next` 从锁定的 **16.3.1** 升到 **16.3.3**（`package.json` 已是 `^16.3.0`，主要更新 lockfile）。
- 用 `overrides.sharp` 把传递依赖 **sharp 升到 0.35.4**（含 libheif 1.23.2）。不把 sharp 加为直接依赖。
- 用 `overrides["ip-address"]` 把传递依赖 **ip-address 升到 10.5.1**。不把它加为直接依赖。
- 把直接依赖 **undici** 从锁定的 **7.29.0** 升到 **7.29.1**，声明范围改为 `^7.29.1`。不升到 8.x。
- 保持 React 19.2、`next-auth@4`、`@serwist/next`、Pages Router、`--webpack` 生产构建和 `node:22-slim` Docker 不变。
- 不改页面路径、API 或用户可见行为。16.3.3 会关闭 AVIF 图片优化；本仓库未使用 `next/image`，也不配置 `images`。sharp 升级只替换 Next 图片优化所用的可选二进制。

## Capabilities

没有规格级产品行为变化。这是依赖安全补丁。`.openspec.yaml` 设置 `skip_specs: true`。

### New Capabilities

- 无

### Modified Capabilities

- 无

## Impact

- **依赖：** `package.json` / `package-lock.json` 中的 `next`（及 Next 自带的同版本包，如 `@next/env`）、直接依赖 `undici@7.29.1`，以及 overrides 带到 **sharp 0.35.4**（含 `@img/sharp-*`）和 **ip-address 10.5.1**。`next-auth` 的 override 已指向 `$next`，随 lockfile 对齐。
- **运行时：** Node 引擎下限仍为 `>=20.9.0`。Dockerfile 仍为 `node:22-slim` + standalone。
- **构建：** `dev` 继续 `next dev --turbopack`；`build` / `build:docker` 继续 `--webpack`，以便 Serwist 注入 webpack 配置。
- **范围外：** 不升到 16.4+ 或 canary，不把 undici 升到 8.x，不迁移 App Router，不改 Serwist / Auth，不改代理或 Mongo 的调用方式，不处理上述告警以外的 audit 项。
