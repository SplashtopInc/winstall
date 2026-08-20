## Why

`npm audit` currently reports three high-severity issues (`postcss`, `sharp`) that arrive through `next@15.5.x` and cannot be cleared with `npm audit fix` alone. The v2.4 goal is to move to `next@16.3.0+` so those advisories go away, while build and core user paths stay usable.

## What Changes

- Raise the declared Node engine floor to **20.9.0+** (Next 16 minimum). Docker already uses Node 22; this locks local and other runtimes to the same floor.
- Upgrade **`next` to `16.3.0+`**, and **`react` / `react-dom` to 19.2** (drop the Next-15 override that pinned React 18).
- Keep **`next-auth@4`** and **`@serwist/next`** (webpack plugin). Production `next build` / `build:docker` MUST pass **`--webpack`** so Serwist’s injected webpack config does not fail under Next 16’s default Turbopack.
- Adjust the **`lint` script** so it no longer calls removed `next lint`.
- **BREAKING** (runtime constraint only): Node 18 is no longer a supported engine. Product URLs, APIs, and Pages Router behavior are not intentionally changed.

## Capabilities

No spec-level product behavior changes. This is a dependency and toolchain upgrade; user-facing requirements stay as they are. `.openspec.yaml` sets `skip_specs: true`.

### New Capabilities

- None

### Modified Capabilities

- None

## Impact

- **Dependencies:** `package.json` / `package-lock.json` (`next`, `react`, `react-dom`, `@types/react`, overrides for `next-auth` peer on Next 16).
- **Tooling:** `engines`, `dev`/`build`/`build:docker`/`lint` scripts.
- **PWA:** keep `@serwist/next` + `sw/sw.ts`; production still emits `public/sw.js` via webpack. No Serwist turbopack/configurator migration in this change.
- **Auth:** keep Pages API `next-auth@4` and Mongo adapter. Auth.js v5 and JWT-direct API access stay out of scope (v2.4 item 4).
- **Deploy:** existing `Dockerfile` (`node:22-slim`, standalone) should keep working; verify image build and `/api/health`.
- **Out of scope:** App Router migration, `middleware`/`proxy` (none today), unrelated dependency sweeps, clearing moderate/low audit findings.
