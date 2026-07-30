# Whats On / Specials Spotter

[Specials Spotter](https://specials-spotter.com) — find bar and restaurant
specials near you, and see them on a map.

Built with Next.js (App Router) and Supabase (Postgres + Auth), Mapbox for
the venue map.

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in real values, see below
npm run dev
```

The app runs at `http://localhost:3000`.

### Environment variables

See [`.env.example`](./.env.example) for the full list with descriptions.
In short:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public API key |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Mapbox token for `components/VenueMap.tsx` |

Ask an existing contributor for real values, or create your own Supabase and
Mapbox projects and point the app at those.

### Access model

There is no public sign-up. Accounts are created deliberately by an admin
(`auth.admin.createUser` / `auth.admin.inviteUserByEmail`, service-role only)
rather than through a self-serve form — every signed-in user is treated as an
admin. `supabase/config.toml` version-controls `enable_signup = false` for
local `supabase start`; the hosted project has the equivalent toggle set by
hand in the Supabase dashboard (Authentication -> Providers -> Email ->
"Allow new users to sign up"), which this file does not and cannot change.
See [`docs/admin-moderation-plan.md`](./docs/admin-moderation-plan.md) for
where the admin UI is headed.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve a production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (flat config, `eslint.config.mjs`) |
| `npm test` | Unit tests (Vitest) — `lib/`, `utils/` |
| `npm run test:watch` | Unit tests in watch mode |
| `npm run test:visual` | Playwright visual regression suite (see below) |
| `npm run test:visual:update` | Regenerate Playwright screenshot baselines |

## Database

Schema and RLS policies live in [`supabase/migrations/`](./supabase/migrations/),
applied in filename order. `supabase/seed.sql` seeds local development data.
`supabase/config.toml` holds local Supabase CLI configuration (ports, auth
settings, etc.) for `supabase start`.

```bash
supabase start        # local Postgres + Auth + Studio, seeded from seed.sql
supabase db reset      # re-run migrations + seed against the local database
```

`supabase/tests/rls_access_model.sql` asserts the row-level-security policies
behave as documented (e.g. that anonymous callers cannot delete rows).

## Testing

- **Unit tests** (`npm test`, Vitest): `lib/venue-selection.test.ts`,
  `utils/dataformatter.test.ts`, `utils/favouritesHandler.test.ts`.
- **Visual regression** (`npm run test:visual`, Playwright): see
  [`tests/visual/README.md`](./tests/visual/README.md) before your first run
  — it needs seeded fixture data that has no automated seeding path yet (no
  `SUPABASE_SERVICE_ROLE_KEY` in this repo), so it is not run in CI.

## CI

`.github/workflows/ci.yml` runs `npm ci`, `npm run typecheck`, `npm run lint`
and `npm test` on every pull request and push. The Playwright suite is
intentionally left out of CI for the reason above.

## Package manager

npm is canonical (`package-lock.json`). There is no `bun.lockb` — an old one
that predated the Next 13 -> 16 upgrade was removed; don't regenerate it.

## Further reading

- [`docs/tech-debt-backlog.md`](./docs/tech-debt-backlog.md) — prioritised
  list of known issues and cleanup work.
- [`docs/admin-moderation-plan.md`](./docs/admin-moderation-plan.md) — plan
  for the admin moderation UI (venue/event/issue/feedback management, admin
  invites).
