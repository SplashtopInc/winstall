## 1. Hard-cut callers to API-only

- [x] 1.1 Make `utils/fetchPackAPI.js` always use `/api/winstall/packs` with API path shapes (`/me`, `POST ""`, public list query on `""`); delete `utils/packApiConfig.js` and all `isPackApiViaWinstall` / `PACK_API_VIA_WINSTALL` / `NEXT_PUBLIC_PACK_API_VIA_WINSTALL` reads
- [x] 1.2 Make `utils/trackPackStats.js` always POST `/api/winstall/analytics/track` with `{ event, targetType: "pack", targetId, sessionId }`
- [x] 1.3 Make homepage recommended packs always use `fetchAllPublicPacksFromApi` (filter official creator); remove the local `Pack.find` branch
- [x] 1.4 Make `pages/sitemap-packs.xml.js` always list public packs from the API; remove the mongoose branch
- [x] 1.5 Make `deleteUserAccount` only call `deleteUserPacksViaApi`; remove `deleteLocalUserPacks` and Pack/PackLike imports from `service/userService.js`
- [x] 1.6 In `pages/api/winstall/[...path].js`, drop `requiresAuth` for `packs/create` and `packs/profile/`; keep `POST packs`, `GET packs/me`, `PATCH|DELETE packs/:id`, `POST packs/:id/copy`, and optional JWT on `GET packs/:id`

## 2. Remove local Pack stack and web moderation

- [x] 2.1 Delete `pages/api/packs/` (all handlers including `session.js`)
- [x] 2.2 Delete `service/packService.js` and `service/packLikeService.js`; remove their re-exports from `service/index.js` (or delete that barrel if it becomes empty of other exports)
- [x] 2.3 Delete `dbModel/` (`Pack.js`, `PackLike.js`, `index.js`) and `lib/mongoose.js`
- [x] 2.4 Delete `utils/contentModeration/` and `test/contentModeration.test.js`
- [x] 2.5 Remove the `mongoose` dependency from `package.json` / lockfile; confirm `lib/mongodb.js` and NextAuth still resolve

## 3. Remove user pack directory and satellites

- [x] 3.1 Delete `pages/users/[id].js` with no redirect
- [x] 3.2 Stop emitting `/users/:id` from `sitemap-packs.xml.js` (packs loc entries only)
- [x] 3.3 Delete `pages/api/twitter.js`; leave NextAuth `TWITTER_CLIENT_*` in place
- [x] 3.4 Remove leftover docs/env mentions of `PACK_API_VIA_WINSTALL`, `NEXT_PUBLIC_PACK_API_VIA_WINSTALL`, and `TWITTER_BEARER` (do not strip Twitter OAuth client vars)

## 4. Verify

- [x] 4.1 Repo grep: no remaining imports of `packService`, `PackLike`, `connectMongoose`, `isPackApiViaWinstall`, `/api/packs`, `/api/twitter`, or `contentModeration`
- [x] 4.2 Smoke with API configured: create/edit/delete/copy, my list, public list+search, owner private detail, view track via BFF analytics, homepage recommendations, sitemap has `/packs/:id` and no `/users/`, account delete leaves no API orphans; `/users/:id` and `/api/packs/*` do not return Pack data
