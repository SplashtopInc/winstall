## 1. ISR pages that need the API origin

- [x] 1.1 Add `getStaticProps` to `pages/packs/index.js` and `pages/generate.js` (empty props; `revalidate: 1` when `WINSTALL_API_BASE` is unset, longer after runtime regen). Do not move pack/catalog fetches into `getStaticProps`
- [x] 1.2 Same ISR shell for first-load pages that host global search: `about`, `privacy`, `eli5`, `compare`, `compare-ninite`, `compare-chocolatey`, `compare-unigetui`, `404`
- [x] 1.3 Leave `pages/packs/[id].js` as on-demand SSR (no `getStaticPaths` / ISR). Leave existing ISR (`/`, `/apps`, `/express`, `/apps/[id]`) and GSSP sitemaps unchanged

## 2. Runtime API origin meta

- [x] 2.1 In `pages/_document.js`, add `meta[name="winstall-api-base"]` with runtime `WINSTALL_API_BASE` (same pattern as `winstall-icon-base`)
- [x] 2.2 In `utils/runtimeConfig.js`, make `getRuntimeConfig()` return that meta on the client (cache like `getIconBase`) and keep `process.env.WINSTALL_API_BASE` on the server; empty value means no API host
- [x] 2.3 After deploy, full-document-load `/`, `/packs`, `/generate`, and `/about`, then confirm View Source shows a non-empty `winstall-api-base`. Clients still use the BFF in this step

## 3. Session-issued API JWT

- [x] 3.1 In the NextAuth jwt callback, when `token.id` exists and `apiToken` is missing or near expiry, `signJwt({ userId: token.id })` and store `apiToken` / `apiTokenExpires` on the token
- [x] 3.2 In the session callback, copy those fields to `session.apiToken` / `session.apiTokenExpires` (top-level, not `session.user`); do not expose the NextAuth cookie JWT or OAuth tokens as the API credential

## 4. Browser-direct clients

- [x] 4.1 Change `utils/fetchWinstallAPI.js` to always call `${apiBase}${path}`; attach Bearer only for user Pack writes / `GET /packs/me` / signed-in `GET /packs/:id` (not `/stats`) when an unexpired session `apiToken` exists; `credentials: "omit"`; `getSession()` only in the browser; on user-write 401, `getSession()` once and retry at most once; never send `X-User-Id`, AuthKey, or AuthSecret
- [x] 4.2 Point `utils/fetchPackAPI.js` at the same helper / API `/packs` paths (drop `/api/winstall/packs`)
- [x] 4.3 Point `utils/trackPackStats.js` and `utils/trackAppStats.js` at `POST {apiBase}/analytics/track` with the API body shape; drop `/api/winstall/analytics/track` and `/api/apps/:id/stats`
- [x] 4.4 In `utils/packApiServer.js` `deleteUserPacksViaApi`, keep the self-signed user JWT and stop sending `X-User-Id`

## 5. Remove proxies and stale docs

- [x] 5.1 Grep for `/api/winstall` and `/api/apps/` stats callers; delete `pages/api/winstall/[...path].js` and `pages/api/apps/[id]/stats.js` once none remain
- [x] 5.2 Update `.env.example` / README so `WINSTALL_API_BASE` is the runtime origin (also the meta source); do not document `NEXT_PUBLIC_WINSTALL_API_BASE` as the client address. Do not commit `.env`

## 6. Verify

- [ ] 6.1 Confirm the target API parses Bearer in non-production (no `X-User-Id` needed) and CORS allows this Web origin plus the `Authorization` preflight
- [x] 6.2 Smoke after direct: anonymous catalog / public packs / pack+app track; signed-in create/edit/delete/copy, my list, owner private detail; unauthenticated create fails; public pack detail and stats still load after the API JWT expires; account delete leaves no API orphans
