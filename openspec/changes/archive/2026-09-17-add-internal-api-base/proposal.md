## Why

测试环境中 web 容器的 Node ISR/SSR 用浏览器同一套 `WINSTALL_API_BASE`（如 `https://test-api.winstall.app`）拉 trending 等数据，容器内 DNS 解析失败，首页服务端刷新失败；浏览器直连同一域名却正常。需要把「浏览器 origin」和「Node 内网 origin」拆开，避免再靠 extra_hosts 凑合。

## What Changes

- 保留 `WINSTALL_API_BASE` 为浏览器 API origin（写入 `winstall-api-base` meta），行为与现网一致。
- 新增可选运行时变量 `WINSTALL_API_INTERNAL_BASE`：仅 Node 服务端请求使用。
- 服务端请求地址为 `WINSTALL_API_INTERNAL_BASE`（非空）否则回退 `WINSTALL_API_BASE`。回退只看环境变量是否未设置或为空，MUST NOT 在请求失败后再改打另一个 origin。
- 浏览器 MUST NOT 读取或使用 `WINSTALL_API_INTERNAL_BASE`；内网名（如 `http://winstall-api:3100`）MUST NOT 写入 HTML。
- ISR / 「是否已配置对外 API」的判断仍以 `WINSTALL_API_BASE` 为准。`WINSTALL_API_BASE` 仍为部署必需；internal 可选。
- 不改 winstall-api；不用 `NEXT_PUBLIC_*`；不改 `WINSTALL_ICON_BASE`。

## Capabilities

### New Capabilities

- （无）

### Modified Capabilities

- `api-client-credentials`: 明确浏览器 origin 与服务端 origin 可分离；服务端可读可选 internal base 并回退到 public base。

## Impact

- 代码：`utils/runtimeConfig.js`、`pages/_document.js`（meta 仍只写 public）、ISR 里「有无 apiBase」的判断需区分 public / fetch target；`fetchWinstallAPI`、`packApiServer`、`postAnalyticsTrack` 继续经 `getRuntimeConfig()`。
- 配置：`.env.example`、测试机 compose/env 可设 `WINSTALL_API_INTERNAL_BASE=http://winstall-api:3100`（web 与 api 须同 Docker 网络）。
- 单测：`test/runtimeConfig.test.js`。
- 规范：`openspec/specs/api-client-credentials/spec.md`。
