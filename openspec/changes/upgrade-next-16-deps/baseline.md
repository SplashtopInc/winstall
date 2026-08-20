# Pre-upgrade baseline

Recorded 2026-08-20 while applying task group 1. Do not treat this file as a product spec.

## 1.1 Toolchain

```
node: v24.14.0
npm:  11.9.0

winstall@2.3.0
├── next@15.5.23
├── react-dom@18.3.1
└── react@18.3.1
```

**Pass:** Next 15.x, React 18.x.

## 1.2 Audit

`npm audit --json` metadata:

```
high: 3
critical: 0
total: 3
```

Packages: `next` (direct, via `postcss` + `sharp`), `postcss` (high), `sharp` (high / libvips). `fixAvailable`: `next@16.3.1` (semver major).

**Pass:** 3 high, all through Next.

## 1.3 Tests and build

- `npm test`: exit 0; **17 pass / 0 fail** (`node --test`).
- `npm run build`: exit 0; Next.js **15.5.23**; Serwist bundled `/sw.js`; compiled successfully.

Build notes (not blockers): workspace-root lockfile warning (`~/package-lock.json`); `/express` page data 183 kB > 128 kB threshold.

## 9. Smoke (post Next 16, production `npm start` on :3000)

- 9.1 Home: title `Browse the winget repository - winstall`; nav present; no crash overlay.
- 9.2 Search: `/apps?q=chrome` shows 39 results.
- 9.3 Generate: page loads; empty selected list (`No apps selected`).
- 9.4 Login modal: open/close; no `findDOMNode`.
- 9.5 Packs list loads (`App Packs - winstall`). **Skip write/CRUD:** no logged-in session.
- 9.6 `GET /api/auth/session` → 200 `{}`.
- 9.7 Browser registered `http://127.0.0.1:3000/sw.js`.
