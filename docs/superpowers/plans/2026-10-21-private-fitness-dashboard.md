# Private Fitness Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign akshath.fit as a private, single-owner fitness dashboard with manual training, cardio, nutrition, and progress logs.

**Architecture:** Build a responsive React/TypeScript frontend with Vite and a small Supabase repository layer. Supabase Auth and database policies enforce the owner restriction; production fails closed when setup or authentication is missing. Keep the user's existing generic plan material as reference content and deploy static output on the existing domain after live setup is verified.

**Tech Stack:** React, TypeScript, Vite, Supabase JavaScript client and Postgres, plain CSS, Lucide icons, native SVG charts; Vitest, Testing Library, and Supabase/pgTAP for focused behavior and security checks.

**Spec:** [Approved design](../specs/2026-10-21-private-fitness-dashboard-design.md)

## Global Constraints

- The application is private, with login for one owner only.
- Automatic app integrations are optional. The first version will use manual entries.
- Akshath uses an iPhone without an Apple Watch.
- Use Asia/Kolkata for the owner's calendar, Monday as the start of the training week, kilograms for weight, centimeters for waist, and kilometers for distance.
- Metric units are fixed for this version and clearly labeled.
- Use hash-based navigation initially so direct links and refreshes work on static hosting without custom server routing.
- Palette: background `#171719`, surface `#252527`, raised surface `#303033`, lime `#D4FF56`, violet `#8170FF`, main text `#F4F4F2`, muted text `#ADADB5`, border `#3A3A3E`.
- Use a system font stack, reduced-motion support, clear focus indicators, and touch targets of at least 44 pixels.
- Distinguish “not logged” from an explicit zero.
- Show a saved state only after the server confirms the mutation.
- Do not populate the live account with sample sessions or invented health metrics.
- Profile values and new tracking records must not be embedded into public frontend assets.
- The frontend receives only the project URL and public publishable key.
- Disable public signup and enforce the configured owner identity in database policies, not just in the interface.
- Keep the initial version online-first; no offline-save or phone-sync promise.
- Preserve existing meal schedules, training reference, workout nutrition notes, grocery lists, meal prep material, and extras.
- Import existing nutrition targets only as editable settings: 1900 kcal, 150 g protein, 190 g carbohydrates, and 55 g fat; do not create food-consumption records from them.

## Review Focus

1. An expired session or sign-out during an outstanding request must remove owner data and prevent its late response from restoring the dashboard (Task 3).
2. Rapid date changes and slow, out-of-order requests must not show or save one day's entries under another date (Task 4).
3. UTC/India midnight and Sunday/Monday boundaries must assign records to the selected local calendar date and correct week (Task 4 calendar helpers; Task 5 summaries).
4. Partial forms, blank numeric inputs, zero, negative values, nonfinite values, and an interrupted save must preserve the intended data and avoid a false success state (Task 4).
5. Editing a multi-muscle session, deleting its last group, or marking a training day as rest must preserve server-enforced consistency even through direct API calls (Task 2).

---

## Current Repository and Execution Conditions

- Existing tracked application: `index.html` (249 lines), `meal-plan-data.js` (278 lines), `meal-plan.css` (127 lines), and `CNAME` containing `akshath.fit`.
- Source remote: `github.com/Akshath-dev/akshath-fit.git`. Hosting settings still need read-only inspection; the CNAME alone does not establish the current deployment mechanism.
- Node `v24.11.1` and npm `11.6.2` are available. A Docker CLI is available; daemon availability is not yet verified. Supabase CLI and database credentials are not configured.
- Worktree policy: use the using-git-worktrees skill at execution time. No attached worktree currently exists. Keep any requested checkout in an approved writable location and preserve the approved spec/plan commit when isolating work.
- Do not install product dependencies or change application code until the user has reviewed this plan and selected execution.
- Recommend native execution: the UI, domain types, and repository interfaces are closely related, and the single-owner scope does not benefit much from repeatedly transferring context. A final independent review should focus on access control and persistence.

## File and Responsibility Map

| Files | Responsibility |
| --- | --- |
| `package.json`, `package-lock.json`, `tsconfig*.json`, `vite.config.ts`, `vitest.config.ts`, `.gitignore`, `.env.example` | Build, configuration, dependencies, and ignored local state |
| `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles.css` | Production entry, app composition, palette and responsive styling |
| `src/components/AppShell.tsx`, `src/components/EntrySheet.tsx`, `src/components/Charts.tsx`, `src/components/Ui.tsx` | Navigation, accessible entry dialogs, simple labeled charts, and shared UI primitives |
| `src/lib/types.ts`, `src/lib/config.ts`, `src/lib/dates.ts`, `src/lib/metrics.ts`, `src/lib/validation.ts` | Stable domain contracts, public configuration, calendar arithmetic, summaries, and validation |
| `src/lib/repository.ts`, `src/lib/supabase-repository.ts` | Persistence contract and Supabase implementation |
| `src/auth/AuthProvider.tsx`, `src/auth/LoginPage.tsx` | Session lifecycle, owner verification, and login/setup states |
| `src/data/DashboardProvider.tsx` | Date-scoped loading and successful-mutation refreshes |
| `src/features/overview/OverviewPage.tsx` | Selected-day summary, weekly activity, quick actions, and recent entries |
| `src/features/training/TrainingPage.tsx`, `TrainingForm.tsx` | Session history and strength/cardio entry |
| `src/features/nutrition/NutritionPage.tsx`, `NutritionForm.tsx` | Daily macro totals, history, and entry |
| `src/features/progress/ProgressPage.tsx`, `CheckinForm.tsx` | Steps, weight, waist, rest days, and trends |
| `src/features/plan/PlanPage.tsx`, `src/data/reference-plan.ts` | Preserved reference content and plan-aid checklist |
| `src/features/settings/SettingsPage.tsx` | Owner settings, goals, and custom muscle groups |
| `supabase/config.toml`, `supabase/migrations/202610210001_dashboard.sql`, `supabase/owner-setup.sql` | Local auth config, schema/policies/RPCs, and administrator-only provisioning template |
| `supabase/tests/database.test.sql` | Transactional security and data-integrity checks in the local test database |
| `src/test/setup.ts`, colocated `*.test.ts(x)` | Focused behavior checks, not snapshots of visual implementation |
| `dev/preview.html`, `dev/preview.tsx`, `dev/memory-repository.ts` | Explicit local design preview with synthetic fixtures; not imported by production |
| `scripts/check-build.mjs`, `public/CNAME`, `.github/workflows/verify.yml`, `.github/workflows/deploy.yml`, `README.md` | Build-artifact check, domain preservation, verification workflow, manual deployment, and setup instructions |

Resolve feature-local filenames above relative to their feature directory. Do not add a routing, charting, form, or global-state package unless a concrete unmet need appears.

## Shared Contracts

Define the following in `src/lib/types.ts`; use camelCase at the UI boundary and explicit mapping for database snake_case fields:

```ts
type LocalDate = string; // validated YYYY-MM-DD calendar date
type SessionKind = 'strength' | 'cardio';
type Goals = { calories: number | null; protein: number | null; carbs: number | null;
  fat: number | null; steps: number | null; weeklyTraining: number | null };
type Profile = { userId: string; displayName: string; timeZone: string };
type MuscleGroup = { id: string; name: string; isCustom: boolean };
type TrainingInput = { id?: string; date: LocalDate; kind: SessionKind;
  activityType: string | null; durationMinutes: number | null;
  distanceKm: number | null; notes: string; muscleGroupIds: string[] };
type TrainingSession = TrainingInput & { id: string; createdAt: string };
type NutritionInput = { date: LocalDate; calories: number | null; protein: number | null;
  carbs: number | null; fat: number | null; notes: string };
type CheckinInput = { date: LocalDate; steps: number | null; weightKg: number | null;
  waistCm: number | null; restDay: boolean; notes: string };
type DateRange = { start: LocalDate; end: LocalDate };
type DashboardSnapshot = { profile: Profile; goals: Goals; muscleGroups: MuscleGroup[];
  training: TrainingSession[]; nutrition: NutritionInput[]; checkins: CheckinInput[];
  latestWeight: CheckinInput | null };
type ValidationResult<T> = { ok: true; value: T } |
  { ok: false; errors: Record<string, string> };
```

`FitnessRepository` in `src/lib/repository.ts` provides:

```ts
getSnapshot(range: DateRange, signal?: AbortSignal): Promise<DashboardSnapshot>;
saveTraining(input: TrainingInput): Promise<TrainingSession>;
deleteTraining(id: string): Promise<void>;
saveNutrition(input: NutritionInput): Promise<NutritionInput>;
deleteNutrition(date: LocalDate): Promise<void>;
saveCheckin(input: CheckinInput): Promise<CheckinInput>;
deleteCheckin(date: LocalDate): Promise<void>;
saveSettings(profile: Pick<Profile, 'displayName' | 'timeZone'>, goals: Goals):
  Promise<{ profile: Profile; goals: Goals }>;
addMuscleGroup(name: string): Promise<MuscleGroup>;
```

Repository methods throw normalized errors, keep null distinct from zero, and never claim successful persistence without a database response. The owner identity comes from the verified session, never from form values. `getSnapshot` includes the latest non-null weight at or before `range.end`, even if it predates `range.start`.

### Task 1: Create the application foundation and reference-inspired shell

**Files:** Create build/config files, `src/main.tsx`, `src/App.tsx`, `src/styles.css`, `src/lib/types.ts`, `src/lib/config.ts`, `src/components/AppShell.tsx`, `src/components/Ui.tsx`, and `src/test/setup.ts`; modify `index.html`; test `src/lib/config.test.ts` and `src/components/AppShell.test.tsx`.

**Interfaces:** Consumes the approved palette and route names. Produces `readPublicConfig(env: Record<string, string | undefined>): { url: string; publishableKey: string } | null` and `AppShell({ route, onNavigate, children }: AppShellProps)` with route union `overview | training | nutrition | progress | plan | settings`.

- [x] **Step 1: Write failing configuration and navigation tests.** Assert missing either public environment value or an invalid URL returns null; a key beginning `sb_secret_` or a legacy JWT declaring `role: service_role` is rejected even when assigned to the public-key environment variable. Render `AppShell`, select Nutrition and More, and assert route callbacks and access to Plan/Settings. Do not test CSS class names or reproduce markup in snapshots.
- [x] **Step 2: Create only the build/test tooling needed to run those tests and confirm they fail because the production modules are absent.** Add React, the Supabase client, and Lucide as runtime dependencies; add TypeScript, Vite, Vitest, jsdom, and Testing Library as development dependencies, resolving compatible current releases once and retaining the lockfile. Run `npm test -- --run src/lib/config.test.ts src/components/AppShell.test.tsx`; expect failing imports, not dependency/runtime errors.
- [x] **Step 3: Implement configuration, typed routes, and the shell.** Use the exact palette, labeled icons, visible focus states, large card radii, and iPhone bottom navigation with safe-area padding. Production initially renders an explicit setup/login boundary; shell unit tests supply their own children. Add `.env.example` containing only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`, and ignore real environment files.
- [x] **Step 4: Verify the deliverable.** Rerun the targeted tests and `npm run build`; expect tests passing and a successful TypeScript/Vite build. Inspect the setup screen at desktop and iPhone widths before proceeding.
- [x] **Step 5: Commit the foundation.** Stage only this task's files and commit as `feat: establish private dashboard shell and theme`.

### Task 2: Enforce one owner and valid records in Supabase

**Files:** Create `supabase/config.toml`, `supabase/migrations/202610210001_dashboard.sql`, `supabase/owner-setup.sql`, and `supabase/tests/database.test.sql`.

**Interfaces:** Produces the seven public tables from the spec, private owner configuration, `app_private.is_owner() returns boolean`, administrator-only `app_private.provision_owner(p_owner_id uuid) returns void`, `public.owner_access() returns boolean`, `public.save_training_session(p_id uuid, p_date date, p_kind text, p_activity_type text, p_duration_minutes numeric, p_distance_km numeric, p_notes text, p_muscle_group_ids uuid[]) returns uuid`, and `public.save_settings(p_display_name text, p_time_zone text, p_goals jsonb) returns void`. Use snake_case equivalents of the shared domain fields for columns, `user_id` as owner, and `created_at` for timestamps. The goals RPC accepts the six camelCase keys from `Goals` and maps `weeklyTraining` to `weekly_training`.

- [x] **Step 1: Write failing local database tests.** In a rolled-back transaction, create owner/non-owner fixtures. Assert anonymous/non-owner reads expose no records; writes and both mutation RPCs are denied; the owner can save and reload records; a relation cannot combine different owners' sessions/groups; empty nutrition records and negative/nonfinite metrics fail. Test strength sessions with zero groups, cardio with groups, duplicate group selection, removal of a strength session's last group, rollback of failed edits, and training/rest-day consistency. Set the configured owner fixture only inside the test transaction.
- [x] **Step 2: Run the tests against an isolated local Supabase project and confirm the schema assertions fail.** Verify Docker daemon availability first, install/use the Supabase CLI as a development tool, and run `npx supabase start`, `npx supabase db reset --local`, and `npx supabase test db`. Never reset a remote or unrelated database. If the runtime cannot start, preserve the tests and record that verification limit; do not substitute a static SQL scan for a database-security pass.
- [x] **Step 3: Implement schema, policies, and atomic saves.** Use UUID keys, `user_id` ownership, calendar-date columns, finite/nonnegative numeric checks, positive non-null weight/waist, and uniqueness for daily totals. Require positive duration for cardio; strength duration is optional. Use composite ownership foreign keys for `session_muscle_groups`. Protect every public table with RLS and the configured owner predicate; an unset owner denies all application access. Store the owner in a private singleton table and fix privileged helpers' search paths; revoke provisioning access from application roles. Give the owner atomic invoker-rights RPCs for session/group replacement and profile/goals updates. Enforce strength/cardio group rules with deferred database constraint triggers, and clear a matching rest marker when adding or moving a session; reject a rest marker when sessions exist. Validate timezones against Postgres timezone names.
- [x] **Step 4: Verify access and provisioning.** Rerun `npx supabase db reset --local` and `npx supabase test db`; expect all assertions passing. Provide an administrator-only, idempotent owner-provisioning function/template that creates the private owner mapping, profile, editable existing targets, and the 11 built-in muscle groups from the spec. Reject changing an already configured owner through normal provisioning. Disable signup in local config and document the equivalent hosted setting. Do not seed tracking history.
- [x] **Step 5: Commit the backend schema.** Commit as `feat: enforce single-owner fitness records in Supabase` after successful checks, or clearly record any unavailable database check without claiming it passed.

### Task 3: Connect real authentication and the repository boundary

**Files:** Create `src/lib/repository.ts`, `src/lib/supabase-repository.ts`, `src/auth/AuthProvider.tsx`, and `src/auth/LoginPage.tsx`; modify `src/App.tsx`; test `src/auth/AuthProvider.test.tsx` and `src/lib/supabase-repository.test.ts`.

**Interfaces:** Consumes Task 1 domain/config types and Task 2 tables/RPCs. Produces `createFitnessRepository(client: SupabaseClient, ownerId: string): FitnessRepository` and `AuthProvider`/`useAuth()` with explicit `setup-required | checking | signed-out | unauthorized | error | ready` states; ready includes the verified user and repository.

- [x] **Step 1: Write failing auth and repository tests.** Assert missing config keeps private content unmounted; failed sign-in preserves the form and displays an error; a valid session without `owner_access()` approval cannot load records; sign-out or token expiry purges data; late promises from the old session cannot restore it. Verify partial nutrition fields survive mapping and saves use the session owner rather than a payload-supplied owner.
- [x] **Step 2: Run `npm test -- --run src/auth/AuthProvider.test.tsx src/lib/supabase-repository.test.ts` and confirm failures originate in missing behavior.** Use an injected auth/client adapter in tests, not a production bypass or real credentials.
- [x] **Step 3: Implement login, owner verification, and persistence.** Subscribe to Supabase auth changes, verify owner access before mounting the app, unsubscribe on cleanup, and invalidate old-session requests. Use `signInWithPassword` and `signOut`; include no registration flow. Implement the exact repository contract with explicit field mapping, abort support for reads, transactional RPCs, and error normalization. Distinguish setup, access denial, and connection errors.
- [x] **Step 4: Rerun the targeted tests and `npm run build`.** Expect passing tests and a successful build; inspect signed-out, checking, unauthorized, failed-login, and setup-required states without showing personal records.
- [x] **Step 5: Commit as `feat: add owner authentication and fitness persistence`** with the task's files only.

### Task 4: Deliver manual logging and durable daily history

**Files:** Create `src/data/DashboardProvider.tsx`, `src/lib/validation.ts`, `src/lib/dates.ts`, `src/components/EntrySheet.tsx`, and Training/Nutrition/Progress page and form files from the file map; test `src/lib/validation.test.ts`, `src/lib/dates.test.ts`, `src/data/DashboardProvider.test.tsx`, and `src/features/training/TrainingForm.test.tsx`.

**Interfaces:** Consumes `FitnessRepository`. Produces `DashboardProvider({ repository, selectedDate, children })`, `useDashboard()` returning snapshot/loading/error/refresh and mutation methods, calendar helpers `localDate(now: Date, timeZone: string): LocalDate`, `weekRange(date: LocalDate): DateRange`, `daysEnding(date: LocalDate, count: number): LocalDate[]`, and validators `validateTraining(input: TrainingFormValues): ValidationResult<TrainingInput>`, `validateNutrition(input: NutritionFormValues): ValidationResult<NutritionInput>`, `validateCheckin(input: CheckinFormValues): ValidationResult<CheckinInput>`. Form-value types are their respective input types with numeric fields represented as strings, preserving blank versus zero.

- [x] **Step 1: Write failing behavior tests.** Assert strength requires at least one muscle group; multi-selection persists a single session; cardio requires type and duration; blank optional macros become null while `0` stays zero; all-empty nutrition fails; negative/nonfinite metrics fail; steps must be an integer; weight/waist must be positive when supplied. Assert failed saves retain inputs and have no success state, duplicate save clicks cannot duplicate sessions, date changes cannot mislabel a submitted record, and a late load cannot replace a newer selected date's snapshot.
- [x] **Step 2: Add the calendar assertions and run the failing tests.** Assert `2026-10-20T18:29:59Z` maps to `2026-10-20` in Asia/Kolkata and `2026-10-20T18:30:00Z` maps to `2026-10-21`; the week containing `2026-10-21` spans `2026-10-19` through `2026-10-25`; month/year crossings retain seven days. Run `npm test -- --run src/lib/validation.test.ts src/lib/dates.test.ts src/data/DashboardProvider.test.tsx src/features/training/TrainingForm.test.tsx`; expect assertion/import failures. Use a controllable fake repository for response ordering and save failures.
- [x] **Step 3: Implement calendar helpers and dated CRUD flows.** Use owner timezone for today's date and calendar-date arithmetic for stored dates. Provide selected-date history, strength/cardio forms, calories/macros entry, and steps/weight/waist/rest-day check-ins. Freeze the form's intended date during a save; await the repository before success and refresh. Provide deletion confirmation for records, accessible sheet focus/escape behavior, and visible retry states. Keep multiple sessions and daily upserts distinct.
- [x] **Step 4: Rerun targeted tests and `npm run build`; expect success.** Manually exercise adding, editing, cancelling deletion, confirming deletion, partial nutrition, and a failed request. Reload data through the repository rather than trusting local state as persistence proof.
- [x] **Step 5: Commit as `feat: add manual fitness logs and daily history`.**

### Task 5: Build useful summaries and progress views

**Files:** Create `src/lib/metrics.ts`, `src/components/Charts.tsx`, and `src/features/overview/OverviewPage.tsx`; complete the Progress/Nutrition/Training summaries; test `src/lib/metrics.test.ts`.

**Interfaces:** Consumes `DashboardSnapshot` and Task 4 calendar helpers. Produces `summarize(snapshot: DashboardSnapshot, selectedDate: LocalDate): DashboardSummary`. The summary defines daily metrics, Monday–Sunday strength/cardio counts, the seven-day observed weight average/count, recent records, and current-goal comparisons.

- [x] **Step 1: Write failing summary tests.** One session with chest/back counts as one session. Weight values 75 and 74 average to 74.5 with sample count 2, not a seven-day denominator. Unset calorie targets, missing entries, explicit zero, and one weight measurement produce appropriate states without division errors or invented trends. A Sunday session is included in the preceding Monday's week and excluded from the following Monday's week.
- [x] **Step 2: Run `npm test -- --run src/lib/metrics.test.ts` and confirm the assertions fail before implementing the helpers.**
- [x] **Step 3: Implement deterministic calendar/summary helpers and the dashboard.** Use owner timezone for today's date and calendar-date arithmetic for stored dates. Show calories/protein, steps, weekly sessions, weight, recent records, and quick entry actions. Add labeled native SVG charts for weekly sessions and 7/30/90-day weight views. Do not interpolate absent weight measurements into new observations; show sample counts and useful empty states.
- [x] **Step 4: Run the targeted tests and `npm run build`; expect success.** Check both an empty account and a populated synthetic test state. Verify calorie over-target copy remains neutral, steps are counts, distance is kilometers, and current goal edits leave historical inputs intact.
- [x] **Step 5: Commit as `feat: add daily overview and fitness progress charts`.**

### Task 6: Preserve the plan and add owner settings

**Files:** Create `src/data/reference-plan.ts`, `src/features/plan/PlanPage.tsx`, and `src/features/settings/SettingsPage.tsx`; update app navigation; test `src/features/settings/SettingsPage.test.tsx`. Remove old unused `meal-plan.css` and `meal-plan-data.js` only after the content has been migrated and verified.

**Interfaces:** Consumes repository settings/custom-muscle methods and existing plan constants. Produces named reference exports `TARGETS`, `DAYS`, `WORKOUT_NUTRITION`, `GROCERY`, `MEAL_PREP`, `SUPPLEMENTS`, `SUBSTITUTIONS`, `AVOID_FOODS`, `CHEAT_MEAL`, `TRAINING_DAYS`, and `COACH_NOTES`; `PlanPage` and `SettingsPage` integrate with the shared shell.

- [x] **Step 1: Write failing settings behavior tests.** Assert changing a target or display name waits for persistence, failure retains edits, timezone changes refresh the local-date presentation, and a new custom muscle group becomes selectable in Training. Assert changing goals does not mutate historical nutrition values.
- [x] **Step 2: Run `npm test -- --run src/features/settings/SettingsPage.test.tsx` and verify the expected failures.**
- [x] **Step 3: Implement settings and migrate reference content.** Preserve all 11 named constants, four meal schedules, and seven training days. Keep the plan-aid checklist scoped to the signed-in owner and explicitly separate from dated workout records; an existing undated checklist may populate the plan aid but never history. Present imported nutrition targets as editable settings. Provide optional steps/weekly-training goals, custom muscles, and sign out. Keep hard-coded profile/measurement values out of the production header and metadata.
- [x] **Step 4: Rerun settings tests and `npm run build`; expect success.** Compare migrated reference text and list counts against the original content before deleting obsolete files, and inspect every Plan section. This is content verification, not a brittle snapshot test.
- [x] **Step 5: Commit as `feat: preserve fitness plans and add owner settings`.**

### Task 7: Verify the experience, document setup, and prepare deployment

**Files:** Create the `dev/` preview files, `scripts/check-build.mjs`, `public/CNAME`, `.github/workflows/verify.yml`, `.github/workflows/deploy.yml`, and `README.md`; adjust styles and accessibility only where inspection finds issues.

**Interfaces:** Consumes completed screens and `FitnessRepository`. Produces a separately served local preview with a `DESIGN_PREVIEW_ONLY` fixture marker, production `dist/`, setup instructions, a verification workflow, and a manual deployment workflow for the verified existing hosting target.

- [x] **Step 1: Create a development-only preview entry.** Inject an in-memory repository into the completed dashboard components and display a persistent “Design preview · sample data” indicator. Keep this entry out of the production import graph and configure the build to use only root `index.html`. Normal production startup must still require real auth/config; do not add a query-string login bypass.
- [x] **Step 2: Exercise the finished UI in the supported browser tooling.** Read the applicable local-preview instructions before starting browser QA. Inspect 1440×1000 and 390×844 layouts, all routes, navigation, every entry form, a failed-save state, sign-out behavior, keyboard focus, reduced motion, and long notes/custom muscle names. Capture desktop/mobile evidence. Fix observed failures and rerun only affected checks.
- [x] **Step 3: Verify production artifacts and the database.** `npm test -- --run` and `npm run build` must pass. `node scripts/check-build.mjs` must verify the CNAME is `akshath.fit` and the output excludes preview markers, fixture code, source environment files, and service-role configuration. Run the local database suite if available. Record local versus hosted checks separately; never describe policy files or mocks as verified live security.
- [x] **Step 4: Complete Supabase setup and hosting instructions.** Document creating/provisioning the owner account, disabling hosted signup, applying migrations, setting the public environment values, and recovery via the Supabase administrator interface. Inspect current hosting before choosing the deployment workflow. For GitHub Pages, copy `CNAME` into output, retain hash routing, build using repository environment values, and keep deployment manually triggered. Verify real owner login/reload, anonymous/non-owner denial, failed requests, and session expiry when the user configures the project. A missing project does not prevent finishing local UI/code checks, but blocks a live-auth completion claim and production cutover.
- [x] **Step 5: Perform final review and handoff.** Run the requesting-code-review and verification-before-completion workflows, fix actionable findings, and commit as `feat: prepare private fitness dashboard for deployment`. Use the finishing-a-development-branch workflow to integrate the approved work. Publish to the existing domain only after configuration and checks pass; attach any created PR. Return the preview/result, actual verification evidence, and the precise remaining setup if live configuration is unavailable.

## Verification and External Setup Boundary

The frontend, manual forms, summaries, reference content, and production bundle checks can be completed before the user creates a Supabase project. Local database checks also require a working local Docker/Supabase runtime. Hosted login, signup settings, real persistence, and production deployment require the configured project and hosting access.

Do not request passwords or service-role/database secrets in chat. The user can enter public project settings in `.env.local` and their hosting environment, provision their own account in Supabase, and supply only the non-secret owner UUID to the administrator-only setup template.

References for implementation: [Vite guide](https://vite.dev/guide/), [Supabase password auth](https://supabase.com/docs/guides/auth/passwords), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [database testing](https://supabase.com/docs/guides/database/testing).

## Self-Review

- Spec coverage: all six screens, owner login, manual CRUD, fixed metric units/timezone behavior, legacy reference content, palette/responsive layout, online-first states, access constraints, and deployment boundaries have owning tasks.
- Interface consistency: use the shared contracts above; null is preserved at every form/repository/database boundary. Session replacement and settings updates are atomic RPCs.
- Review Focus: each of the five listed conditions is pinned to explicit assertions in its owning task.
- Scope: no API integrations, phone bridge, wearable metrics, automated coaching, or unrelated features were added.
- Verification honesty: live Supabase checks and production cutover remain distinct from passing local tests and a successful build.

Status: Local implementation and verification complete on `codex/fitness-dashboard`. User requested the local preview first on 2026-10-21. Hosted Supabase configuration, live integration checks, and production cutover remain pending; final independent review is recorded in the verification note.
