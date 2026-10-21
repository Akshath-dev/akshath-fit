# Production release — 21 October 2026

Published at https://akshath.fit/ at the user's explicit request.

- Application commit: `8a9be1135140104158a42432061a3833117d48a1`.
- [Successful deployment run](https://github.com/Akshath-dev/akshath-fit/actions/runs/39578341314).
- [Successful verification run](https://github.com/Akshath-dev/akshath-fit/actions/runs/39578326250).
- Existing `main` advanced without rewriting history; previous live source was `1daa9f27619dc80abf46a1fde57ae062f7f97b11`.
- Existing custom domain retained; Pages switched from legacy builds to the deployment workflow. HTTPS is enforced and HTTP redirects to HTTPS.
- Public Supabase URL and publishable key configured as repository Actions variables. Local environment files and the user's customized owner-provisioning file were not committed in this release.

## Verification

Local and GitHub release checks passed: 34 app tests, 14 PostgreSQL checks, TypeScript/Vite production build, and build artifact inspection.

The production page, JavaScript, and CSS return HTTP 200. The published bundle contains the intended public backend configuration and excludes actual secret-key values and the development preview entry. The live sign-in screen renders successfully with no recorded browser console errors.

Hosted read-only Supabase checks confirmed seven fitness tables are present, anonymous reads return no rows, the anonymous owner predicate is false, public signup is disabled, and anonymous sign-in is disabled. These checks do not establish authenticated owner CRUD or a non-owner authenticated account's behavior.

The user should sign in at the production URL and verify one actual entry survives a refresh. No fabricated tracking history or test accounts were created in the hosted project. Automatic app integrations remain outside this release.
