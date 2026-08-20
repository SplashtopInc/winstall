# Tasks: upgrade-next-16-deps

Stop on any failed **Verify**. Do not use `npm install --force` / `--legacy-peer-deps` to hide peer errors. Do not mix Auth.js v5 or Serwist turbopack into these steps.

## 1. Baseline (no product edits)

- [x] 1.1 Record current toolchain versions. **Verify:** `node -v` and `npm ls next react react-dom --depth=0` show Next 15.x and React 18.x; save the output.
- [x] 1.2 Record current audit. **Verify:** `npm audit --json` reports 3 high (postcss / sharp via next); save the high count.
- [x] 1.3 Confirm current tests and production build. **Verify:** `npm test` exits 0; `npm run build` exits 0.

## 2. Node engine floor

- [x] 2.1 Set `engines.node` to `>=20.9.0` (npm floor may stay `>=9`). Do not bump `next` yet. **Verify:** `node -v` is ≥ 20.9.0; Dockerfile still `node:22-slim`; `npm test` still exits 0.

## 3. Package bump

- [x] 3.1 In `package.json`: `next` `^16.3.0` (or latest 16.x ≥ 16.3); `react` / `react-dom` `^19.2`; `@types/react` 19 (add `@types/react-dom` if needed). **Verify:** file lists those ranges before install.
- [x] 3.2 Remove `overrides.next.react` / `react-dom` (the React 18 pin). Add `overrides["next-auth"].next` for Next 16. **Verify:** no remaining React 18 pin under `overrides.next`.
- [x] 3.3 Run `npm install` and commit the lockfile with the manifest. **Verify:** `npm ls next react react-dom next-auth --depth=0` shows next ≥ 16.3.0, react 19.x, next-auth 4.x; no `ERESOLVE`; `react-modal` still resolves.

## 4. Audit gate

- [x] 4.1 Run high-severity audit. **Verify:** `npm audit --audit-level=high` exits 0 (high and critical are 0). Moderate/low may remain.

## 5. Build scripts and lint honesty

- [x] 5.1 Set `build` and `build:docker` to `next build --webpack` (`build:docker` still with `STANDALONE_BUILD=true`). **Verify:** `package.json` scripts contain `--webpack`.
- [x] 5.2 Replace `"lint": "next lint"` so it does not call the removed CLI (drop it or an honest placeholder). **Verify:** `npm run lint` does not invoke `next lint`; `git grep "next lint"` has no leftover scripts.

## 6. Compile and unit tests

- [x] 6.1 Production webpack build. **Verify:** `npm run build` exits 0; logs are webpack, not a Turbopack “webpack config detected” abort.
- [x] 6.2 Standalone Docker-oriented build. **Verify:** `STANDALONE_BUILD=true npm run build:docker` exits 0; `.next/standalone/server.js` exists.
- [x] 6.3 Unit tests. **Verify:** `npm test` exits 0 with no fewer tests than step 1.3.

## 7. PWA artifact

- [x] 7.1 `npm run clean:sw` then `npm run build`. **Verify:** `public/sw.js` exists, is non-empty, and contains skipWaiting / manifest injection consistent with `sw/sw.ts`.

## 8. Process health

- [x] 8.1 Start the built app (`npm start` or standalone `node .next/standalone/server.js`). **Verify:** `curl -sf http://127.0.0.1:3000/api/health` returns 200 and `"status":"ok"`; `curl -sI http://127.0.0.1:3000/` is not 500; process does not crash on boot.

## 9. Core-path smoke (manual; skip only with a recorded reason)

- [x] 9.1 Home. **Verify:** `/` renders nav and content; no React crash overlay.
- [x] 9.2 Search. **Verify:** a query returns results or empty state, not 500.
- [x] 9.3 Generate. **Verify:** `/generate` loads; selection bar still works.
- [x] 9.4 Login modal (`react-modal`). **Verify:** open/close login with no `findDOMNode` or overlay crash.
- [x] 9.5 Pack. **Verify:** pack list or a pack detail loads; write paths only if session + Mongo are available (otherwise record skip).
- [x] 9.6 Session endpoint. **Verify:** `curl` `/api/auth/session` returns 200 JSON.
- [x] 9.7 Production SW. **Verify:** in production mode the browser registers `/sw.js`.

## 10. Docker

- [x] 10.1 `docker build` with the existing Dockerfile. **Verify:** build exits 0; container Node is 22.x; healthcheck/`/api/health` is 200; spot-check 9.1 and 9.6 match host `next start`.
