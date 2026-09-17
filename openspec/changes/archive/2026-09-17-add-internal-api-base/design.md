## Context

动机见 `proposal.md`。行为见本 change 的 `specs/api-client-credentials/spec.md`。约束见仓库根 `AGENTS.md`。

现状：`getRuntimeConfig().apiBase` 在浏览器读 `meta[name="winstall-api-base"]`，在 Node 读 `process.env.WINSTALL_API_BASE`。`pages/_document.js` 把同一变量写入 meta。`fetchWinstallAPI`、`packApiServer`、`postAnalyticsTrack` 都用该 `apiBase` 发请求。ISR 若干页用 `if (!config.apiBase)` 判断「有没有 API」。

## Goals / Non-Goals

**Goals:**

- 运行时拆 public / internal 两个 origin；Node 取 `INTERNAL || PUBLIC`。
- 浏览器与 HTML meta 只暴露 public。
- ISR「是否已配置对外 API」仍看 public，避免只配 internal 时 meta 为空却当作已配置。

**Non-Goals:**

- 请求失败后自动改打另一个 origin。
- `extra_hosts`、改 nginx、改 winstall-api。
- `NEXT_PUBLIC_*`、`WINSTALL_ICON_BASE`。
- 把 homepage trending 改成纯客户端拉取。

## Decisions

### 1. 环境变量名 `WINSTALL_API_INTERNAL_BASE`

**选择：** 与现有 `WINSTALL_API_BASE` 并列的 UPPER_SNAKE 运行时 env，无 `NEXT_PUBLIC_` 前缀。

**理由：** 只给 Node；打进前端包会把内网地址泄露给浏览器。

**备选：** `WINSTALL_API_BASE_INTERNAL` — 否决，前缀不一致不利于扫 env。`USE_HOST_INTERNAL` 布尔 — 否决，无法表达 Docker 服务名。

### 2. 配置集中在 `runtimeConfig.js`

**选择：** 服务端 `getRuntimeConfig()` 继续返回 `apiBase`，值为 trim 后的 `WINSTALL_API_INTERNAL_BASE`（非空）否则 `WINSTALL_API_BASE`。另导出 `getPublicApiBase()`（或等价）给 `_document` 与 ISR「有无对外 API」判断。浏览器 `apiBase` 仍只读 meta。

**理由：** `fetchWinstallAPI` 等调用方不必改拼 URL；泄漏面收在一个模块。

**备选：** 每个 fetch 自己读两个 env — 否决，易漏。

### 3. ISR 判断用 public，fetch 用 `apiBase`

**选择：** `pages/index.js`、`apps.js`、`express.js`、`documentShellStaticProps.js` 里「无 API 则短 revalidate / 走 buildTime 客户端补数」看 public base。真正 `fetchWinstallAPI` 仍用 `getRuntimeConfig().apiBase`。

**理由：** 只配 internal 时服务端能拉数，但浏览器 meta 空；若 ISR 把这当成已配置，首页会以为 SSR 成功而客户端列表仍失败。public 仍为部署必需。

**备选：** 有 internal 或 public 任一即视为已配置 — 否决，会掩盖 meta 为空。

### 4. 空值回退，不做失败重试

**选择：** 仅 `!internal.trim()` 时用 public。`ENOTFOUND` / 超时不改 origin。

**理由：** 失败重试会把 ISR 变慢，且把网络故障和配错混在一起。

## Risks / Trade-offs

- **[Risk] 只配 internal、忘记 public** → 服务端通、浏览器挂。缓解：ISR 仍要求 public；`.env.example` 写明 A 必填、B 可选。
- **[Risk] internal 用 `http://winstall-api:3100` 但 web 不在同一 compose 网络** → 仍 ENOTFOUND。缓解：部署说明要求同一 `winstall-network`。
- **[Risk] 自签 HTTPS internal** → Node `fetch` 证书失败。缓解：internal 用容器内 HTTP 直连 API 端口，TLS 仍只给浏览器走 nginx。

## Migration Plan

1. 发版 web：未设 `WINSTALL_API_INTERNAL_BASE` 时行为与现网相同。
2. 测试机 `.env` 增加 `WINSTALL_API_INTERNAL_BASE=http://winstall-api:3100`（或实际服务名/端口），`WINSTALL_API_BASE` 保持 `https://test-api.winstall.app`。
3. 回滚：去掉 internal env 并重启即可。

## Open Questions

无。
