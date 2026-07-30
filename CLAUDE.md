# CLAUDE.md

Guidance for an agent or developer picking up this repo cold. Dense on
purpose — see the two docs linked at the bottom for the full narrative.

## What this is

"Specials Spotter" — a Next.js 16 (App Router) + Supabase app where
anonymous visitors browse published bar/restaurant specials and pin them on
a Mapbox map, and submit new specials for review. Stack: React 19,
TypeScript 7, Tailwind, Supabase Postgres/Auth via `@supabase/ssr`, deployed
on Vercel. Package manager is **npm** (`package-lock.json` is canonical; do
not regenerate `bun.lockb`, it was removed on purpose).

Core tables (`supabase/migrations/20260726000000_init_whats_on.sql`):
`venues`, `events` (published/live), `events_pending` (visitor submissions
awaiting review), `issues` (visitor reports against a live event),
`feedback` (general site feedback). Anonymous (`anon`) can read `venues`/
`events` and insert into `events_pending`/`issues`/`feedback`. Nothing reads
`events_pending`, `issues`, or `feedback` in the app yet — today the only way
to review a submission is the Supabase dashboard; see
`docs/admin-moderation-plan.md` for the admin UI that closes that loop.

## The access model — read this before touching auth or RLS

**Every logged-in user is an admin. There are no roles, no per-user
ownership, no admin flag anywhere in the schema.** Every RLS policy that
grants a mutating right grants it to the Postgres `authenticated` role,
full stop — `to authenticated ... using (true)`. There is no policy anywhere
that checks `auth.uid()` against a row owner, because there is no ownership
column to check.

This means **account creation is the entire security boundary.** Anyone who
successfully creates a Supabase Auth account for this project becomes an
admin the moment they log in. Consequences that follow directly from that:

- **Supabase signup must stay disabled**, both locally (`supabase/config.toml`
  version-controls `enable_signup = false` for `supabase start`) and on the
  hosted project (a manual dashboard toggle under Authentication → Providers
  → Email → "Allow new users to sign up" — `config.toml` cannot reach this,
  it only governs the local CLI stack). If that hosted toggle is ever
  flipped on, anyone who registers gets full admin rights with no further
  gate.
- New admins are added deliberately via `auth.admin.createUser` /
  `auth.admin.inviteUserByEmail` with the **service-role key** (bypasses
  RLS, never `NEXT_PUBLIC_`-prefixed, never shipped to the client — see
  Phase 6 of `docs/admin-moderation-plan.md`). There is no
  `SUPABASE_SERVICE_ROLE_KEY` in this repo today; nothing currently needs it.
- Do not add a "role" column or per-user check as a quick fix without
  reading `docs/admin-moderation-plan.md` first — it would invalidate every
  existing RLS policy in `20260726000000_init_whats_on.sql`, all of which
  assume `authenticated == admin`.
- `getUser()` vs `getSession()` matters here more than usual: `getSession()`
  trusts the cookie without revalidating against the auth server;
  `getUser()` round-trips to confirm the session is still valid. Anything
  that gates admin-only behavior should use `getUser()` (see
  `lib/supabase/middleware.ts` for the existing pattern; the admin UI's own
  layout guard needs a second, server-side `getUser()` check independent of
  the proxy — middleware alone is not a complete security boundary).

## RLS invariants and how to check them

`supabase/tests/rls_access_model.sql` is the executable spec for the access
model above: anonymous visitors may read published content and insert
submissions, and nothing else; every mutation beyond that requires
`authenticated`. It runs entirely inside one transaction that ends in
`ROLLBACK`, so a run leaves no rows behind — still, point it at a
non-production database.

```bash
psql "$DATABASE_URL" -f supabase/tests/rls_access_model.sql
```

(Or paste it into the Supabase SQL editor.) A pass prints one `notice` per
rule and ends with `ALL ACCESS-CONTROL TESTS PASSED`; a failure raises an
exception naming the specific rule that broke and rolls everything back. Add
a new assertion here whenever a migration touches a policy — this file is
what would have caught the venue-deletion CASCADE bug (D1 in the tech-debt
backlog) before it shipped.

## Test setup

- **Unit tests — Vitest** (`npm test`, currently 39 tests; `npm run
  test:watch` for watch mode). Covers pure logic: `lib/venue-selection.test.ts`,
  `utils/dataformatter.test.ts`, `utils/favouritesHandler.test.ts`. Config in
  `vitest.config.ts`; `include: ['**/*.test.ts']`, node environment, `@/`
  alias resolved to repo root.
- **Visual regression — Playwright** (`npm run test:visual`, screenshots
  under `tests/visual/__screenshots__/`, light and dark). **Why this needs
  fixture data seeded out of band:** the suite needs real venues/events on
  screen (empty map, empty homepage otherwise), but RLS blocks anonymous
  inserts into `venues` — the only credential available to the app (and to
  a CI runner) is the `anon` key, which cannot write there by design. There
  is no `SUPABASE_SERVICE_ROLE_KEY` in this repo to bypass that. The
  original baseline was seeded via the Supabase MCP tools' direct database
  access (`execute_sql`), which works in an interactive agent session but
  not for CI. `tests/visual/fixtures/seed.sql` / `cleanup.sql` document the
  exact fixture rows; `seed-with-service-role.mjs` is the same seed as a
  Node script, ready to run once a service-role secret exists. Read
  `tests/visual/README.md` in full before your first run — it also covers
  why Mapbox tiles are masked rather than tolerance-compared, and a real
  flake that came from fixture rows sharing one `created_at`. Consequently
  `npm run test:visual` is **not** run in CI (`.github/workflows/ci.yml`
  runs typecheck/lint/unit tests only, and says why in a comment).

## TypeScript 7 wrinkle

This repo is on `typescript@^7.0.2` (the Go-based rewrite), which dropped
the classic JS compiler API that `next build`'s built-in type-check step
used. Without a workaround, `next build` fails with `"TypeScript 7.0.2 does
not provide the compiler API required by Next.js."` The fix is
`experimental.useTypeScriptCli: true` in `next.config.js`, which makes Next
shell out to the `tsc` CLI instead — keep that flag if you ever touch
`next.config.js`. It's a deliberate, load-bearing setting, not leftover
config.

## ESLint divergence

`eslint.config.mjs` does **not** do the standard
`export { default } from 'eslint-config-next/core-web-vitals'` — that import
chain requires `typescript-eslint`, which throws synchronously at
require-time under TypeScript 7
([typescript-eslint#10940](https://github.com/typescript-eslint/typescript-eslint/issues/10940)).
Working around the guard just moves the crash one layer down into
`@typescript-eslint/typescript-estree`'s internals, which read compiler-API
members TS 7 no longer exposes. So `eslint.config.mjs` hand-assembles the
same plugin set `eslint-config-next` uses (`eslint-plugin-react`,
`eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`, `eslint-plugin-import`,
`@next/eslint-plugin-next`) with the same merged rules, parsed via
`@babel/eslint-parser` + `@babel/preset-react` + `@babel/preset-typescript`
(Next's own vendored parser export and `next/babel` preset both predate
current ESLint/Babel major versions and crash outright — see the long
comment at the top of `eslint.config.mjs` for the exact chain). This is
tracked as its own backlog item (D32) — revert to the real
`eslint-config-next` import once the TypeScript-ESLint ecosystem ships TS 7
support.

A second, related wrinkle: `eslint-plugin-react` / `eslint-plugin-import` /
`eslint-plugin-jsx-a11y` all cap their `eslint` peer dependency below the
`eslint@10` this repo needs for flat-config support. `.npmrc` sets
`legacy-peer-deps=true` so `npm install`/`npm ci` don't treat that mismatch
as fatal — the peer ranges are compatible in practice, just unstated by the
plugins yet. Do not remove `.npmrc` without checking whether the plugin
ecosystem has caught up.

13 React Compiler lint rules are currently downgraded from `error` to `warn`
in `eslint.config.mjs` (tracked as D31) so CI isn't red by default; promote
them back once the flagged violations (`setState` inside effects in a few
components, a mutated local, `Math.random()` during render) are cleared.

## Gotchas worth knowing

- **`"desc"` and `"when"` are quoted column names** on `events` and
  `events_pending` — both are reserved-adjacent SQL words, so every raw SQL
  reference needs the double quotes or Postgres will throw a syntax error.
  See the comment at the top of `20260726000000_init_whats_on.sql`.
- **`"when"` stores a space-joined string of days** (e.g. an event on
  Mon/Wed/Fri is one string, not a set), not a normalized day-of-week
  column — see `utils/dataformatter.ts` for how it's parsed back out. This
  means there's no index-backed "what's on today" query possible today
  (backlog D30); it's a known, deliberately deferred modelling gap, not an
  oversight to silently "fix" mid-task.
- **`middleware.ts` is now `proxy.ts`**, per the Next.js 16 rename — the
  Supabase session-refresh logic lives in `lib/supabase/middleware.ts` and
  is invoked from `proxy.ts`'s exported `proxy()` function. Its
  `config.matcher` deliberately excludes `_next/static`, `_next/image`,
  favicon/sitemap/robots, and image extensions, so static assets don't each
  trigger a `getUser()` round-trip (backlog D24).
- **Signup routes are gone.** `app/sign-up/`, `app/invite/`,
  `app/auth/sign-up/`, `app/auth/generate-invite/`, and
  `components/InviteUserButton.tsx` were all deleted (backlog D11) — the
  JWT-based invite flow they implemented was both broken (`JWT_SECRET`
  unset) and unsafe by design (a forgeable, non-revocable, indefinitely-
  reusable URL granting admin). If you see a reference to any of these
  paths (there's a stray commented-out button in `app/login/page.tsx` and a
  Playwright test in `tests/visual/screens.spec.ts` that still navigates to
  `/sign-up`), it's dead and should be removed, not resurrected.
- **No service-role key exists in this repo.** Anything that needs one
  (seeding visual-test fixtures, admin invites in Phase 6 of the admin plan)
  is currently a manual/interactive-only step for exactly that reason.
- **`app/error.tsx` / `app/global-error.tsx` / `app/not-found.tsx`** are the
  only error-handling surfaces in the app; route handlers otherwise only
  `console.error`. See `docs/observability-options.md` for what a real
  tracker would look like and why one isn't installed yet.

## Further reading

- `docs/tech-debt-backlog.md` — prioritized, scored backlog of known issues;
  most Tier 1/2 items are already resolved and marked as such, with notes on
  what was verified vs. what was fixed.
- `docs/admin-moderation-plan.md` — the plan for the admin moderation UI
  (design tokens, component library, moderation queue, venues, live events/
  issues/feedback, admin invites) that will eventually read `events_pending`
  and friends. States the access-model constraints above as hard
  requirements on every phase.
- `docs/observability-options.md` — evaluation of error-tracking options
  (Sentry, Vercel's built-in monitoring, Axiom, self-hosted GlitchTip) for
  when this app needs one; nothing has been installed yet.
- `README.md` — quick start, env vars, script table, local Supabase
  workflow.
