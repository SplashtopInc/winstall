## MODIFIED Requirements

### Requirement: Server-rendered Pack reads use the API

Homepage recommended or official packs, the packs sitemap, and any other SSR or build-time Pack reads MUST obtain Pack data from winstall-api. They MUST NOT query a local Pack collection as authority. Those server-side requests MUST NOT attach `AuthKey` or `AuthSecret`; public Pack list and detail reads MUST succeed without those headers.

#### Scenario: Homepage recommended packs from API
- **WHEN** the homepage is generated or revalidated
- **THEN** recommended pack data MUST come from the API Pack surface

#### Scenario: Pack sitemap from API
- **WHEN** the packs sitemap is generated
- **THEN** listed pack ids MUST come from API-backed public pack data

#### Scenario: SSR Pack read without AuthKey
- **WHEN** the server fetches public packs from winstall-api during render or revalidation
- **THEN** the request MUST NOT include `AuthKey` or `AuthSecret`
