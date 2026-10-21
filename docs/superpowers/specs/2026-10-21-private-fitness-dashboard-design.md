# akshath.fit — private fitness dashboard

Date: 2026-10-21

Status: Proposed design for user review. Application implementation has not started.

## Purpose and confirmed requirements

Build a complete redesign of the existing akshath.fit tracker for Akshath's personal use. The dashboard should make daily logging quick and show whether recorded nutrition and training are consistent with his configured goals. Keep the existing meal and training reference material accessible.

Confirmed in conversation:

- The application is private, with login for one owner only.
- Akshath uses an iPhone without an Apple Watch.
- Strava, Hevy, and MyFitnessPal accounts are all on free plans.
- Automatic app integrations are optional. The first version will use manual entries.
- Cardio and nutrition can be copied manually from Strava and MyFitnessPal.
- Workout logging needs selectable muscle groups; detailed sets and reps can stay in the existing Hevy/Strava workflow.
- Supabase Free is the proposed backend; Akshath can create an account.
- The user chose the attached charcoal, lime, and violet dashboard references as the visual direction.

Proposed defaults to review:

- Use email and password for the single owner account.
- Keep the current recomposition context and existing nutrition targets as editable starting values, not new dietary recommendations.
- Provide manual steps, body weight, and waist entries alongside training, cardio, and nutrition.
- Use Asia/Kolkata for the owner's calendar, Monday as the start of the training week, kilograms for weight, centimeters for waist, and kilometers for distance.

## Approach and alternatives

Recommended: a responsive React and TypeScript application built with Vite, with Supabase Auth and Postgres. The frontend can be hosted as static files on the existing domain; authenticated database rules protect personal records. This adds useful structure for forms, charts, and navigation while keeping deployment small.

Alternatives considered:

1. Extend the existing buildless HTML and JavaScript. This has fewer tooling requirements, but the current inline renderers and browser-only checklist state would become difficult to maintain across the new screens and data flows.
2. Use a server-rendered full-stack application. This supports more server-side features, but adds a separate application runtime without a clear need for this manual, single-user first version.

Use the recommended static frontend and Supabase approach. External API credentials, sync jobs, and a custom application server are outside this version.

## Visual direction

Treat the screenshots as inspiration for palette, spacing, card shapes, typography, and restrained chart styling. The application name is akshath.fit.

Approximate palette inspired by the reference images:

| Role | Color | Use |
| --- | --- | --- |
| Background | `#171719` | Main application canvas |
| Surface | `#252527` | Large dashboard cards and panels |
| Raised surface | `#303033` | Inputs, navigation, and secondary controls |
| Lime | `#D4FF56` | Primary actions, active states, and selected progress indicators |
| Violet | `#8170FF` | Secondary chart series and nutrition accents |
| Main text | `#F4F4F2` | Headings and important values |
| Muted text | `#ADADB5` | Supporting labels with readable contrast |
| Border | `#3A3A3E` | Subtle panel and input separation |

Use generous rounded cards, simple outline icons, clear numbers, and a compact greeting such as “Hello, Akshath.” Lime should direct attention to the next action. Use violet to distinguish a second data series. Charts must also have labels and units, so meaning does not depend on color.

Keep glow effects subtle and localized. Use a compact greeting and date header so the dashboard gives most of its space to progress and quick entry. Water-wave artwork, coach appointments, stock athlete portraits, and connected-app badges from the references are not required features.

Use a system font stack for the first implementation. Favor readable text, clear focus indicators, reduced-motion support, and touch targets of at least 44 pixels.

## Navigation and responsive layout

Desktop: persistent navigation with Overview, Training, Nutrition, Progress, Plan, and Settings. Main content uses a flexible card grid with a wider primary content column where appropriate.

iPhone: single-column cards, with a compact bottom navigation for Overview, Training, Nutrition, Progress, and More. More provides Plan, Settings, and sign out. Account for the screen safe area and keep save actions reachable without horizontal scrolling.

Use hash-based navigation initially so direct links and refreshes work on static hosting without custom server routing.

## Screens and behavior

### Login

A focused form using the same charcoal/lime theme. The owner enters email and password. Show useful validation, loading, and sign-in errors. Personal records and profile details load only after authentication and owner authorization succeed.

Missing Supabase configuration produces a setup-required state. It must not fall back to a working-looking unlocked dashboard or fake authentication.

### Overview

- Greeting, selected date, and a compact date selector.
- Prominent quick actions to log training, cardio, nutrition, or a daily check-in.
- Calories and protein against editable daily targets, with a link to the full macro breakdown.
- Selected-day steps as a count against an optional configured target. Cardio distance remains a separate quantity in kilometers.
- Weekly training count and a seven-day chart of recorded session counts, distinguishing strength and cardio. Duration remains available in session details.
- Latest weight and a trend when enough measurements exist.
- Recent entries with links to edit them.

Distinguish “not logged” from an explicit zero. A day without sessions can be marked as a rest day; adding a session clears that marker. Empty states offer the appropriate logging action. Do not populate the live account with sample sessions or invented health metrics. For calories, show the amount remaining or over the configured target without treating a larger intake as better progress.

### Training

Two related entry types:

1. Strength session: date, one or more muscle groups, optional duration in minutes, and optional notes. Provide chest, back, shoulders, biceps, triceps, quadriceps, hamstrings, glutes, calves, core, and full body. Allow owner-defined groups and multi-selection.
2. Cardio session: date, activity type, duration in minutes, optional distance in kilometers, and optional notes. Include walking, running, cycling, and other.

Each entry can be edited or deleted, and multiple sessions on one date are allowed. Deletion requires confirmation. The weekly view includes history and a clear summary of recorded strength and cardio sessions.

Count a session once in the workout total even if it includes multiple muscle groups. Muscle-group summaries describe recorded training frequency, not inferred training stimulus or recovery.

The existing training schedule remains available as reference material. Its exercise checklist is a plan aid, separate from completed, dated session records.

### Nutrition

One editable daily total record per date: calories, protein, carbohydrates, and fats, with optional notes. Require at least one nutrition value. Support saving calories or protein without forcing the remaining fields to zero. Use explicit units and nonnegative finite values.

Show totals against the owner's configured targets and a short history. Missing fields remain unknown. Treat entered calories as the recorded total, rather than silently replacing it with a calculation from macros. Logging a meal plan does not automatically count it as food consumed.

### Progress

- Dated body-weight and waist entries, with each field optional.
- Manual daily steps and optional short check-in notes.
- Weight charts over 7, 30, and 90 days, using only recorded measurements.
- Weekly strength/cardio frequency and nutrition logging consistency.
- A seven-day weight average over the available measurements, with the number of measurements visible; missing days do not contribute zeros.

Do not show a fabricated trend when only one measurement exists. Separate logging consistency from hitting a nutrition target. The current owner-configured targets are not used to rewrite historical records.

### Plan

Retain the existing meal schedules, training reference, workout nutrition notes, grocery lists, meal prep material, and extras. Organize them into readable sections rather than the current long horizontal tab list.

Preserve the existing content during migration. Profile values and new tracking records must not be embedded into public frontend assets. The existing generic plan material can be treated as reference templates; it does not imply the owner completed any meal or exercise.

### Settings

- Owner display name and timezone. Metric units are fixed for this version and clearly labeled.
- Editable calorie, protein, carbohydrate, fat, step, and weekly training goals; optional goals can be left unset.
- Custom muscle groups.
- Sign out.

Start with the existing nutrition targets only after clearly presenting them as editable imported settings. Do not present Strava, Hevy, MyFitnessPal, or Apple Health as connected to this application.

## Supabase data and access

Suggested tables:

| Table | Purpose |
| --- | --- |
| `profiles` | Owner display name and timezone |
| `goals` | Configured nutrition, steps, and weekly training targets |
| `muscle_groups` | Built-in and custom selectable muscle groups |
| `training_sessions` | Strength/cardio records, duration, distance, and notes |
| `session_muscle_groups` | Muscle selections belonging to strength sessions |
| `nutrition_days` | One daily calories/macros record per owner and date |
| `daily_checkins` | One daily steps, weight, waist, rest-day marker, and notes record per owner and date |

Store calendar dates independently from creation timestamps. Use unique owner/date constraints for daily totals and check-ins. Use database constraints as well as form validation for units, valid numeric ranges, and required fields.

Access requirements:

- Provision the sole owner account through Supabase administration and disable public signup.
- Enforce the configured owner identity in database policies, not just in the interface.
- Enable row-level security on all exposed tables. Anonymous users and authenticated users other than the configured owner cannot read or change records.
- Apply equivalent ownership checks to session/muscle relations, so a join row cannot reference another account's records.
- The frontend receives only the project URL and public publishable key. Database passwords and service-role keys do not belong in frontend code, tracked files, or chat.
- Keep configuration examples free of real credentials. Use local environment files and deployment configuration for actual setup values.

The initial version needs no third-party API secrets or scheduled sync functions. Supabase Free availability and limits remain subject to the provider's current plan; account setup is required before testing live authentication and persistence.

## Data flow and failure handling

After sign-in, load settings and query the records needed for the selected dates. Mutations go to Supabase under the owner's session, and the interface updates after a successful response. Keep failed form submissions available for correction or retry.

Handle expired sessions, missing setup, loading, empty results, validation errors, and network failures explicitly. Show a saved state only after the server confirms the mutation. Keep the initial version online-first and do not promise offline saves or background phone syncing.

The old localStorage checklist has no dates. If imported later, treat it as existing checklist state only; do not invent historical workout dates or completed sessions from it.

## Implementation and acceptance boundaries

This design covers the manual, private first version. Automatic integrations, a native iPhone app, HealthKit access, wearable-only metrics, detailed exercise set logging, coaching appointments, push reminders, and automated fitness advice are outside it.

Acceptance checks before calling the application complete:

- The frontend builds and its navigation, forms, charts, and existing plan content work on desktop and an iPhone-sized viewport.
- The owner can sign in, sign out, create, edit, delete, and reload saved records.
- Anonymous access, a non-owner authenticated identity, and direct database requests cannot bypass the owner restriction.
- Disabled signup, expired-session behavior, and missing-configuration behavior are verified.
- Daily totals, weekly boundaries, multiple sessions, multi-muscle counting, missing values, and zero values behave correctly.
- Keyboard access, readable contrast, touch targets, empty states, and error states receive visual/interaction review.
- Live Supabase checks are reported separately from local checks if the account/project configuration is not yet available.

Existing hosting and domain routing will be inspected before deployment. Keep the akshath.fit domain association and provide the required static build/deployment configuration. Do not claim the live site has changed until deployment is verified.

## User setup needed later

1. Create the free Supabase account and project.
2. Configure the public project URL/publishable key in local and hosting environment settings.
3. Apply the reviewed schema, owner restrictions, and provision the single owner account.
4. Verify login and persistence against the real project.

Passwords, database secrets, and service-role keys should be entered directly into the relevant setup interface or secret store, rather than posted into the conversation.
