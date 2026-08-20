## Context

See proposal.md for motivation. The app is Pages Router only (`pages/`, no `app/`, no `middleware`). `next.config.js` is otherwise empty except `withSerwist` from `@serwist/next`, which injects a webpack plugin. Production SW is built that way (`sw/sw.ts` → `public/sw.js`); Serwist is disabled when `NODE_ENV !== "production"`. `dev` already uses Turbopack. Docker builds with `STANDALONE_BUILD=true` on `node:22-slim`. Auth is `next-auth@4` on a Pages API route plus Mongo adapter.

Next 16 defaults `next build` to Turbopack and **fails** if any webpack config is present—including plugin-injected config. Most Next 16 App Router breakages (sync `cookies()`/`params`, `middleware` → `proxy`) do not apply here.

## Goals / Non-Goals

**Goals:**

- Clear the three high audit findings via `next@16.3.0+` without changing product behavior.
- Keep production SW generation working with the existing `@serwist/next` integration.
- Make every implementation step fail-closed: a command or checklist must pass before the next step starts.

**Non-Goals:**

- Migrating Serwist to configurator mode or `@serwist/turbopack`.
- Auth.js v5, JWT-direct API (v2.4 item 4), App Router, or unrelated dependency upgrades.
- Clearing moderate/low `npm audit` issues.

## Decisions

### 1. Production webpack opt-out, not a PWA rewrite

**Choice:** `"build"` and `"build:docker"` use `next build --webpack`. `dev` may keep Turbopack (SW already disabled in development).

**Why:** `@serwist/next` injects webpack. Next 16 Turbopack builds fail when that config exists. Production today already builds SW with webpack. `--webpack` preserves that path with the smallest diff.

**Alternatives:**

- **Serwist configurator** (`next build && serwist build`): bundler-agnostic, still Pages-friendly, but changes SW build/register timing. Deferred.
- **`@serwist/turbopack`:** wants an App Router route handler (`app/serwist/...`). Out of scope for a Pages-only app.

### 2. Follow React 19.2; drop the React 18 override

**Choice:** `react` / `react-dom` `^19.2`, matching `@types/react` 19. Remove `overrides.next.react` / `react-dom` that pinned 18.

**Why:** Next 16 targets React 19.2. Pinning 18 on Next 15 was already a fight with the framework; repeating it on 16 only delays the same work. UI libraries in use already declare React 19 peers except the need to smoke-test `react-modal` (login / pack modals).

**Alternative:** Keep React 18 via overrides. Rejected: extra peer friction for little gain.

### 3. Stay on next-auth v4 with a Next 16 peer override

**Choice:** Do not upgrade to Auth.js v5. Add `overrides["next-auth"].next` so npm can install against `next@16`.

**Why:** v5 is a different auth architecture and belongs with v2.4 JWT-direct work. Peer mismatch is an install problem, not a product change.

### 4. Node engine floor 20.9; Docker image unchanged

**Choice:** `engines.node` ≥ `20.9.0`. Leave `FROM node:22-slim` as-is.

**Why:** Next 16’s minimum is 20.9. The production image already satisfies it. The engine field is the local/CI guardrail.

### 5. `next lint` is removed; do not fake a linter

**Choice:** Stop calling `next lint`. Either drop the script or replace it with an honest no-op / later ESLint CLI. Do not add a full ESLint stack in this change unless a config already exists (it does not).

**Why:** Next 16 deletes `next lint`. There is no `.eslintrc` / `eslint.config.*` in the repo.

### 6. Verification is part of the design, not a later QA pass

Each task in `tasks.md` has an explicit pass command or checklist. Stop on red. Do not `--force` npm, and do not mix this upgrade with other v2.4 items.

Automated gates that already exist: `npm test` (`node --test`), `next build`, `GET /api/health`, Docker image healthcheck. There is no Playwright suite; UI paths are a fixed manual smoke list.

## Risks / Trade-offs

- **[Risk] `next build` fails on Serwist webpack** → Mitigation: `--webpack` on production build scripts; confirm in logs that webpack ran.
- **[Risk] `next-auth@4` peer on `next@16`** → Mitigation: override only the `next` peer; keep v4 APIs.
- **[Risk] `react-modal` / React 19 (`findDOMNode` history)** → Mitigation: dedicated smoke of login and pack modals; stop if overlay/crash.
- **[Risk] PWA precache/register drift** → Mitigation: `clean:sw` then production build must recreate `public/sw.js`; production SW register still works.
- **[Risk] Node 18 local/CI** → Mitigation: fail step 1 if `node -v` < 20.9 before any package bump.
- **[Trade-off] Production stays on webpack** → Acceptable until a later Serwist migration; `dev` can remain Turbopack.

## Migration Plan

1. Record a pre-upgrade baseline (Next 15.5, 3 highs, tests, build).
2. Raise engines only; verify Node ≥ 20.9.
3. Bump packages + lockfile + webpack build flags + lint script in a tight sequence, each with its own gate (install → audit → unit tests → build → SW file → health → smoke → Docker).
4. Deploy as a normal image bump; no data migration.

**Rollback:** revert `package.json` / lockfile / scripts / engines. Image rollback is the previous tag. No schema or URL changes to undo.

## Open Questions

None that affect this approach. Serwist turbopack/configurator is a later change if production webpack becomes a problem.
