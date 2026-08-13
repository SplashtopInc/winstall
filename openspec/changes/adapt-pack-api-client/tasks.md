## 1. Feature flag and BFF auth

- [x] 1.1 Add `PACK_API_VIA_WINSTALL` (or equivalent) env flag; document in `.env.example`; default off in production until cutover
- [x] 1.2 Update `pages/api/winstall/[...path].js` `requiresAuth` for API Pack paths: `POST packs` (exact), `GET packs/me`, `PATCH|DELETE packs/:id`, `POST packs/:id/copy`; keep legacy `packs/create` / `packs/profile/` if harmless
- [x] 1.3 When session exists, attach user JWT on `GET packs/:id` so owners can load private packs; without session forward with AuthKey/Secret only

## 2. Client Pack adapter (`fetchPackAPI`)

- [x] 2.1 Gate `utils/fetchPackAPI.js` on the flag: when on, call `/api/winstall/...` with mapped paths; when off, keep `/api/packs/...`
- [x] 2.2 Map wrappers: `fetchMyPacks` → `GET packs/me`; `fetchPublicPacks` → `GET packs`; `createPack` → `POST packs`; get/patch/delete/copy → `/packs/:id` (+ `/copy`)
- [x] 2.3 Preserve client `credentials: "same-origin"` and existing error/`{ response, error, status }` return shape so Pack UI callers need minimal changes

## 3. Pack stats / track

- [x] 3.1 (superseded by 3.4) Local `pages/api/packs/[id]/stats.js` may still `$inc` when flag is off; it MUST NOT be the flag-on track path
- [x] 3.2 Add `trackPackStats` (or extend shared helper) using `getSessionId()`; update pack detail (and any download track sites) to send `sessionId` and fail soft
- [x] 3.3 Where UI needs lifetime counts, read `GET /api/winstall/packs/:id/stats` (or server-side equivalent); do not rely on embedded `pack.stats`
- [x] 3.4 When flag is on, `trackPackStats` POSTs `/api/winstall/analytics/track` with `{ event, targetType: "pack", targetId, sessionId }`; do not call `/api/packs/:id/stats`. Strip the analytics-proxy branch from the local stats handler so it is rollback-only (`$inc`).

## 4. SSR, sitemap, account deletion

- [x] 4.1 Update homepage recommended packs (`pages/index.js`) to fetch public packs from API with server credentials when flag is on; filter by `NEXT_OFFICIAL_PACKS_CREATOR` (paginate until complete or high limit)
- [x] 4.2 Update `pages/sitemap-packs.xml.js` to list public packs from API when flag is on
- [x] 4.3 Update `deleteUserAccount` to, when flag is on, list API `GET /packs/me` then `DELETE /packs/:id` for each (server AuthKey + user identity); optionally still clear local Pack rows; then delete NextAuth user

## 5. Local routes and verification

- [x] 5.1 Keep `pages/api/packs/*`, `packService`, and `dbModel/Pack*` in place; log deprecation if local handlers are hit while flag is on (should be zero after 3.4)
- [ ] 5.2 Manual / smoke check with flag on: create, edit, delete, copy, my list, public list+search, owner private detail, view track via BFF analytics (no `/api/packs` requests), homepage recommendations, sitemap sample, account delete leaves no API orphans
- [x] 5.3 Confirm flag off restores local `/api/packs` behavior for rollback
