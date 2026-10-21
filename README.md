# akshath.fit

A private fitness dashboard for one owner. Manual workout/muscle, cardio, nutrition, steps, weight, and waist logs, plus the original training and meal reference plans. Charcoal, lime, and violet; responsive for iPhone and desktop.

## Run locally

Requires a supported Node 24 release and npm.

```sh
npm ci
npm run dev
```

- Application: `http://127.0.0.1:5173/`
- Design preview: `http://127.0.0.1:5173/dev/preview.html`

The design preview has clearly labeled synthetic data and resets on reload. It is a separate development entry and is excluded from the production build. `?state=empty` opens an empty design preview; `?failSave=1` simulates a failed save for checking form recovery. Production has no preview login bypass.

## Connect your free Supabase project

1. Create a Supabase project. In its SQL Editor, run `supabase/migrations/202610210001_dashboard.sql` once.
2. Under Authentication → Users, add your email/password user. Enter your password directly in Supabase, not in this repository or chat. You can provision an already confirmed owner without configuring signup email delivery.
3. Copy your new user's UUID. Replace the example UUID in `supabase/owner-setup.sql` with it and run that statement in the SQL Editor. This provisions your sole owner profile, built-in muscle groups, and editable starting goals. It creates no tracking history.
4. In Authentication settings, turn off **Allow new users to sign up**. Leave anonymous sign-ins disabled. In URL configuration, use your final website URL and permit your local development URL while developing.
5. Copy `.env.example` to `.env.local`. Fill in your **project URL** and **publishable key** from the project dashboard:

   ```dotenv
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

6. Restart the dev server if it does not reload automatically, open the application URL, and sign in using the owner account.

The publishable key is intended for browser use; RLS is what protects the records. Never use a secret/service-role key or a database password in a `VITE_` variable. Environment files containing actual values are ignored by Git. The application stays locked if configuration is missing or invalid, or the authenticated account is not the configured owner.

Authentication recovery is administered through Supabase. A password-reset flow and public signup are not included in this single-owner version. Supabase Free may pause inactive projects; resume the project in its dashboard if necessary.

## Verify

```sh
npm test -- --run
npm run test:db
npm run build
npm run check:build
```

The database suite runs the actual migration in PGlite's Postgres engine with test-only equivalents of Supabase roles and `auth.uid()`. It checks RLS, owner/non-owner access, atomic session edits, rest-day rules, and numeric constraints. This verifies SQL behavior locally. It does **not** verify a hosted Supabase project's Auth settings, API gateway, or deployed configuration.

After connecting the hosted project, verify:

- Owner login, sign-out, session expiry, and disabled signup.
- Add/edit/delete records, then reload and confirm persistence.
- Anonymous and non-owner API access cannot read or change records.
- Missing/zero nutrition, multiple sessions, custom muscles, and timezone/date boundaries.

`supabase/tests/database.test.sql` is a small administrator smoke check for the provisioned hosted schema. Local behavior/security fixtures never need to be seeded into the live project.

## Deploy on the existing domain

The dashboard is published at **https://akshath.fit/** using GitHub Actions and GitHub Pages, with HTTPS enforced. The first dashboard release was deployed on 2026-10-21 from commit `8a9be11`; see [the release verification record](docs/verification/2026-10-21-production-release.md). The workflow remains manually triggered for future releases. Public Supabase build settings are configured as repository Actions variables.

1. Put this branch through review and integrate it into your chosen deployment branch.
2. Add repository **Actions variables** named `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` with the same public settings as local development.
3. Set the Pages source to **GitHub Actions** if this repository is using Pages. Keep the custom domain as `akshath.fit` and enable HTTPS before using real sign-in. The build also copies `public/CNAME` to the output.
4. Run the **Deploy akshath.fit** workflow against the reviewed branch. It checks tests and the production bundle before publishing `dist/`.
5. Verify the live URL and real owner login before considering deployment complete. Update DNS only if the verified existing hosting requires it.

Routes use `/#/overview`, `/#/training`, and similar hashes, allowing refresh/direct links on static hosting. CI verifies changes automatically, while deployment remains manually triggered.

## Data behavior

- Choose the dashboard date before opening nutrition or check-in forms. Their date is fixed to prevent overwriting another day while editing.
- Weekly training summaries include the whole Monday–Sunday week, while daily metrics and journals stop at the selected date.
- A confirmed workout save is separate from refreshing the dashboard. If refreshing fails, use Retry to reload records.
- Daily nutrition and check-ins are upserted by owner/date. Blank values stay unknown; zero is recorded as zero. Saving nutrition updates that date's daily totals rather than adding a meal.
- Strength sessions have multiple muscle groups but count as one session. Cardio distance is separate from step count.
- Adding a workout clears a matching rest-day marker. Existing steps and measurements are retained.
- Weight averages use only recorded measurements; absent days are not zeros.
- Goals are editable; changing them does not alter historical entries.
- The plan checklist is an owner-scoped browser aid, separate from dated workouts. Original undated checks are never turned into fabricated workout history.
- Saves require a connection. No offline queue, third-party app integration, or Apple Health bridge is included.
