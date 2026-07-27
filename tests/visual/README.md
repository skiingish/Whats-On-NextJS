# Visual regression harness

Playwright screenshot baselines of the app as it stood before the Next
13→16 / React 18→19 / etc. dependency upgrades. Later upgrade tasks are
expected to run this suite and diff against these baselines to catch visual
regressions the type checker and unit tests can't.

## Screens captured

Each of these is captured under both `light` and `dark` color schemes (12
screenshots total), because `components/VenueMap.tsx` switches the Mapbox
style itself on `prefers-color-scheme`, so dark mode is a genuinely different
render, not a CSS filter over the same one:

| Screen | Test |
| --- | --- |
| `/` logged out | `home > logged out` |
| `/` with the "Something Missing?" add-event modal open | `home > add event modal open` |
| `/map` with venue markers | `map > markers visible` |
| `/map` with the event drawer open (marker clicked) | `map > drawer open` |
| `/login` | `login` |
| `/sign-up` | `sign-up` |

## Running it

```
npm run test:visual            # run against committed baselines
npm run test:visual:update     # regenerate baselines after an intentional change
```

Playwright drives its own dev server (`next dev -p 3100`, via the
`webServer` block in `playwright.config.ts`) — you don't need `npm run dev`
running first, and it won't collide with port 3000 or a stray port-3001
process. Viewport is pinned at 1280x900, `deviceScaleFactor: 1`, and every
`toHaveScreenshot` call runs with `animations: 'disabled'` (handles both
`tailwindcss-animate` classes and the custom `.animate-in` keyframe in
`app/globals.css`, plus vaul's drawer transition and the day-selector's
`animate-bounce`).

Only Chromium is installed (`npx playwright install chromium`) — that's the
one browser this harness needs.

## The data problem — read this before your first run

**The suite needs seeded fixture data, and it cannot seed itself.**

The Supabase database is normally empty. With no venues, `/map` has no
markers and the homepage's event list is blank — most of these screenshots
would just be empty chrome. RLS blocks anonymous inserts into `venues`, so
the app's own anon key (the only credential in `.env.local`) can't seed
through the app. There is no `SUPABASE_SERVICE_ROLE_KEY` in this repo.

This baseline was captured by seeding through the **Supabase MCP tools**
(`execute_sql` against project `mdvurkoeokvxzgznyxut`), which have direct
database access and bypass RLS. That works fine for an interactive agent
session but **does not exist for a CI runner**.

- `tests/visual/fixtures/seed.sql` / `cleanup.sql` — the exact SQL used to
  seed and remove the fixture rows. Three venues (`PWTEST `-prefixed, real
  Melbourne coordinates, clustered so all three markers land on screen at the
  map's default zoom), one event each. Cleanup is a single
  `delete ... where name like 'PWTEST %'` — events cascade-delete with their
  venue.
- `tests/visual/fixtures/seed-with-service-role.mjs` — the same fixture,
  runnable as a plain Node script against a `SUPABASE_SERVICE_ROLE_KEY`.
  **This is what CI would need**: a service-role secret plus a step that runs
  this script (`seed`) before `test:visual` and (`cleanup`) after, since MCP
  isn't available outside an interactive agent session. No such key is
  invented or committed here — wiring this up is future work once that
  secret exists.

To reproduce a capture session by hand today: run `seed.sql` (via MCP or the
Supabase SQL editor), run `npm run test:visual` / `test:visual:update`, then
run `cleanup.sql` and confirm `select count(*) from venues` and
`select count(*) from events` are both 0. **Never leave fixture rows in the
shared database outside of an active capture session.**

Every fixture event's `when` column lists all seven days (renders as
"Everyday" per `utils/dataformatter.ts`). `EventsDisplay.tsx` defaults its
day filter to *today's* weekday, so an event scoped to a single day would
disappear from the homepage list on any other day of the week — turning "a
real regression" and "a Wednesday happened" into indistinguishable causes of
a failed diff. Listing every day keeps the homepage screenshot's event list
stable regardless of which day a future task happens to run this on.

Every fixture event also gets an explicit, distinct `created_at` (see the
comment in `seed.sql`). This isn't cosmetic — the first capture session hit a
real flake from its absence: `EventsSection.tsx`'s query has no `.order()`,
and `EventsDisplay.tsx`'s sort falls back to `created_at` descending as a
tiebreaker. A single multi-row `INSERT` evaluates `now()` once for the whole
statement, so all three fixture events shared one identical timestamp, and
Postgres does not guarantee a stable row order for an unordered `select` —
so the homepage list's event order silently flipped between two otherwise-
identical `npm run test:visual` runs. Worth flagging upstream regardless of
this harness: the app itself has no explicit `ORDER BY` backing a sort its
UI depends on.

## Mapbox: masked, not tolerance-based

Mapbox raster tiles come from a live tile server and will never be
byte-identical run to run (CDN routing, cache state, label placement). Two
ways to handle that were considered:

1. **Mask `.mapboxgl-canvas`** (chosen). The canvas is painted over before
   comparison; everything else — markers, the navigation control, the event
   drawer — is ordinary DOM that Chromium lays out deterministically, so it's
   still compared pixel-for-pixel.
2. Wait for the map's idle/load state and accept a small
   `maxDiffPixelRatio`. Rejected: it trades a hard guarantee for a fuzzy one.
   A "small" tolerance either isn't small enough (tiles genuinely do vary
   more than that between runs) or is so tight it's meaningless — and the
   entire point of a baseline is that a failure means something changed.

The tradeoff: this harness cannot catch a regression that is *only* visible
in the tile imagery itself (e.g. a Mapbox GL JS major-version change that
subtly alters raster rendering). Given the upgrade plan in scope for this
project (Next/React/Tailwind), that's an acceptable blind spot — Mapbox
itself isn't being upgraded here.

The homepage's hero image is masked too, for an unrelated reason: `app/page.tsx`
picks one of 8 pictures at random on every server render
(`Math.floor(Math.random() * pictures.length)`), which is nondeterministic
across runs independent of any dependency upgrade. Masking it keeps that
noise out of the diff without touching app code.

## CI gap, summarized

To run this suite in CI you would need, at minimum:
1. A `SUPABASE_SERVICE_ROLE_KEY` secret (does not exist today).
2. A seed step (`node tests/visual/fixtures/seed-with-service-role.mjs seed`)
   before `test:visual`, and a cleanup step (`... cleanup`) after — including
   in the failure path, so a failed run doesn't leave fixture data behind.

Neither exists yet. This is flagged rather than worked around.
