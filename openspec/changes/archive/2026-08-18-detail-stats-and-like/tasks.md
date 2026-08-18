## 1. Static demo

- [x] 1.1 Add `.demo` App detail static mock with fake views, installs, likeCount, and liked; no login or API
- [x] 1.2 Add `.demo` Pack detail static mock with the same fake fields next to existing badge / Install layout
- [x] 1.3 Confirm copy and placement (views · installs, Like on the same detail surfaces) before page work

## 2. Stats clients

- [x] 2.1 Confirm App stats path and response field names with the API repo (default `GET /apps/:id/stats`)
- [x] 2.2 Add an App stats helper that calls that path via `fetchWinstallAPI` and maps to `{ views, downloads, likeCount, liked }`
- [x] 2.3 Keep `fetchPackStats` on `GET /packs/:id/stats` and map the same display shape; omit AuthKey / AuthSecret; omit Bearer unless the API requires a fresh session token only for `liked`

## 3. Like client

- [x] 3.1 Confirm like/unlike path and method with the API repo (default `POST` / `DELETE /likes` with `{ targetType, targetId }`)
- [x] 3.2 Add a like helper for app and pack that sends the session API JWT and never uses a local PackLike store
- [x] 3.3 Register the like path on the `fetchWinstallAPI` required-JWT list; on 401 refresh session once and retry at most once

## 4. App detail

- [x] 4.1 In `AppDetailView`, load stats after the app is shown; render views · installs under the title; omit the counts row if the read fails
- [x] 4.2 Add the Like control (count + liked state) and wire `useRequireAuth` so signed-out opens `LoginPanel` and signed-in likes/unlikes
- [x] 4.3 After login started from Like, resume the like on the same app detail path

## 5. Pack detail

- [x] 5.1 In `pages/packs/[id].js`, call `fetchPackStats` on load; render views · installs below the existing badges; omit counts if the read fails; do not use `pack.stats`
- [x] 5.2 Add Like beside Install (owner actions stay to the right) with the same auth-gate and resume behavior as App detail
- [x] 5.3 Do not add counts or Like to homepage, Apps list, Packs list, or pack app cards
- [x] 5.4 On Pack or generate export (copy or download), track one download per listed app; Pack export also tracks the pack once

## 6. Verify

- [x] 6.1 Anonymous: App and Pack detail show counts when stats succeed; Like opens login and does not call like
- [x] 6.2 Signed-in: like and unlike update state and count; Copy / Install still only track download
- [x] 6.3 Stats or like failure does not block identity or install actions; no Trending UI
