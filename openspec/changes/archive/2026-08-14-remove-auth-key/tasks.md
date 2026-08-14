## 1. Stop sending AuthKey from callers

- [x] 1.1 In `pages/api/winstall/[...path].js`, stop reading `WINSTALL_API_KEY`/`WINSTALL_API_SECRET` and stop setting `AuthKey`/`AuthSecret`; keep `requiresAuth`, optional JWT on `GET packs/:id`, and `X-User-Id`
- [x] 1.2 In `utils/fetchWinstallAPI.js`, stop attaching `AuthKey`/`AuthSecret` on the server branch; keep using `WINSTALL_API_BASE` (via runtime config) for SSR
- [x] 1.3 In `utils/packApiServer.js` `deleteUserPacksViaApi`, stop attaching `AuthKey`/`AuthSecret`; keep the user JWT (and `X-User-Id`)
- [x] 1.4 In `pages/api/apps/[id]/stats.js`, require only `WINSTALL_API_BASE`; forward track without API key headers; do not 500 when key/secret are unset
- [x] 1.5 In `utils/runtimeConfig.js`, stop returning `apiKey`/`apiSecret`; grep the repo so no remaining production caller reads those fields

## 2. Docs and env examples

- [x] 2.1 Update `.env.example` (and README/env docs if they list the keys) so Web only documents `WINSTALL_API_BASE` as required; do not treat `WINSTALL_API_KEY`/`WINSTALL_API_SECRET` as required. Do not commit `.env`

## 3. Verify

- [x] 3.1 Confirm the target API allows unauthenticated `GET /apps`, `GET /packs`, and `POST /analytics/track` before relying on this change in that environment
- [x] 3.2 Smoke with API configured and Web key/secret unset: homepage/search/apps, public pack list+detail, pack and app view track, signed-in create/edit/delete/copy, my list, owner private detail, account delete leaves no API orphans
