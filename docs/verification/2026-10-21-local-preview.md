# Local preview verification — 21 October 2026

The requested local dashboard is implemented on `codex/fitness-dashboard`. No push, merge, deployment, hosting setting, or real Supabase account change was performed.

## Evidence

- `npm test -- --run`: 34 tests across 11 files passed.
- `npm run test:db`: 14 PostgreSQL checks passed using PGlite and a test-only Supabase auth-role shim.
- `npm run build`: TypeScript and production Vite build passed.
- `npm run check:build`: domain preserved; development fixtures, environment files, and private API keys excluded.
- `git diff --check`: passed.
- Browser inspection: 1440×1000 desktop and 390×844 iPhone layout, all six routes, manual strength/cardio, partial nutrition, check-in, save/edit/delete confirmation, goals/custom muscles, preserved plan sections, empty/failed-save states, focus trap, Escape, and preview sign-out. No runtime errors in the inspected preview. Reduced-motion CSS inspected.
- Browser regression checks: selecting Monday retains the complete week's three sample workouts, with recent history bounded to Monday; daily nutrition date remains fixed while editing.

## Independent review

One fresh reviewer examined the entire implementation. Five Important findings were reproduced with failing tests, fixed, and verified with the green suite: auth events after sign-out, expiry without a sign-out event, a committed workout followed by a failed read, daily-date overwrites, and truncated weekly totals. No Critical or Minor findings were raised. No second reviewer was used.

## Remaining external setup

Create/provision the Supabase project following README.md, verify actual login and persisted records after reload, test anonymous/non-owner API denial and expiry against the hosted project, and test Safari on the physical iPhone. Hosting remains on its existing configuration until the user is ready to publish. Preview changes reset on reload and are not real saved fitness history.

## Execution decisions

- Ruling: Use a dedicated branch in the original writable checkout after sandbox denied writes in the native worktree — preserves authorized branch isolation without granting broad filesystem access — cost if wrong: main checkout displays the feature branch until integration.
- Ruling: Docker daemon is unavailable; database runtime checks will be reported separately and a portable local Postgres harness may be used if available — never claim hosted security verified without a configured project — cost if wrong: Supabase-specific runtime behavior awaits deployment checks.
- Task 1: Ruling: Pin jsdom 26 because the newest release requires a newer Node patch than installed — use a compatible test runtime — cost if wrong: test DOM differs from newest browser APIs; browser QA remains necessary.
- Task 2: Ruling: Use PGlite's real Postgres engine with a test-only auth schema/role shim for executable SQL/RLS checks because Docker is unavailable — this checks actual policies and constraints, not source text — cost if wrong: hosted Supabase Auth/PostgREST integration still needs live verification.
- Task 7: Ruling: Finish the local preview and keep the feature branch without merging or publishing, as the user explicitly requested local preview before creating Supabase — cost if wrong: real login/persistence and domain cutover await the user's project setup.
- Final: Ruling: Hosted Supabase Auth/PostgREST, signup settings, and deployment were set aside by the reviewer — this follows the user's explicit local-preview-first instruction — cost if wrong: hosted access and real persistence remain unverified before cutover.
- Final: Ruling: saveTraining now resolves void after the confirmed RPC; a dashboard refresh is separate — no consumer used the returned session, and this prevents an acknowledged insertion being presented as a failed save — cost if wrong: future consumers must reload to obtain server-generated fields.

Deferred minors: none.
