## 1. 升级 lockfile

- [x] 1.1 运行 `npm install next@16.3.3`，保持 `package.json` 的 `next` 范围为 `^16.3.0`。确认 `package-lock.json` 中 `node_modules/next` 为 16.3.3，且 `@next/env` 等同版本配套一起对齐。不改 React、`next-auth`、`@serwist/next`、脚本、Dockerfile 或 `next.config.js`。
- [x] 1.2 在 `package.json` 的 `overrides` 增加 `"sharp": "0.35.4"`，然后安装。不把 sharp 写入 `dependencies`。确认 `package-lock.json` 中 `node_modules/sharp` 为 0.35.4，且配套 `@img/sharp-*` 与之一致。
- [x] 1.3 在 `package.json` 的 `overrides` 增加 `"ip-address": "10.5.1"`，然后安装。不把 ip-address 写入 `dependencies`。确认 `package-lock.json` 中 `node_modules/ip-address` 为 10.5.1。`mongodb` 仍为 5.9.2。
- [x] 1.4 将直接依赖 `undici` 的声明改为 `^7.29.1` 并安装。不安装 8.x。确认 lockfile 中 `node_modules/undici` 为 7.29.1。不改 `utils/proxyConfig.js`。
- [x] 1.5 确认其余顶层依赖没有被顺手升级。`npm ls next react react-dom next-auth undici --depth=0` 显示 next 为 16.3.3、undici 为 7.29.1、react 仍为 19.x、next-auth 仍为 4.x。`npm ls sharp` 显示 0.35.4，`npm ls ip-address` 显示 10.5.1。没有 `ERESOLVE`。

## 2. 验证

- [x] 2.1 运行 `npm test`，退出码为 0。
- [x] 2.2 运行 `npm run build`，退出码为 0，且日志是 webpack 构建，不是 Turbopack 因检测到 webpack 配置而中止。
