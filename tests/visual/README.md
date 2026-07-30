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

(10 screenshots — 5 screens x 2 colour schemes. The `/sign-up` capture listed
here previously is gone along with the route itself; see backlog D11.)

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

## Where the data comes from

**Committed fixtures, served by a fake Supabase. Nothing to seed, no
credentials, and production data cannot affect a baseline.**

`npm run test:visual` starts two servers:

1. `tests/visual/fixtures/mock-supabase.mjs` on port 54331 — a ~100-line HTTP
   server that answers the three requests this app makes and returns the rows
   in `tests/visual/fixtures/dataset.mjs`.
2. `next dev -p 3100` with `NEXT_PUBLIC_SUPABASE_URL` pointed at that server.

So a screenshot changes only when someone edits `dataset.mjs`. Adding a venue
in production moves nothing.

### Why a fake server rather than intercepting requests

The pages under test are Server Components — they query Supabase from Node
during the render, not from the browser. Playwright's `page.route` never sees
those requests, so browser-level mocking cannot work here. What *is*
interceptable is the URL the app dials: `lib/supabase/server.ts` reads
`NEXT_PUBLIC_SUPABASE_URL` at runtime, so overriding that env var for the dev
server redirects every query — server-side and browser-side — with **no
application code changed**. The real `@supabase/ssr` client, the real wire
format and the real render path all still run; only the data source is swapped.

`@next/env` does not overwrite variables already in `process.env`, which is
why the value set in `playwright.config.ts` wins over `.env.local`.

### Why not `supabase start`

A local stack would be higher fidelity — real Postgres, real RLS, real
migrations. It is also a Docker dependency, tens of seconds of startup per run,
and another prerequisite before anyone can run the suite. None of that fidelity
changes the pixels; the app only needs deterministic rows. Use it if you ever
need to test RLS behaviour itself: `supabase start`, apply migrations, seed
`fixtures/seed.sql`, and point the same two env vars at `http://127.0.0.1:54321`.

### Editing the dataset

Change `dataset.mjs`, re-run `npm run test:visual:update`, commit the new PNGs.
Three properties in that file are load-bearing and documented inline: every
event lists all seven days (the homepage filters to *today*), every event has a
distinct `created_at` (the list sorts on it, and ties reorder nondeterministically
— a real flake that cost a debugging session), and the coordinates are spread
enough to exercise the map's bounds fitting without pushing a pin off-frame.

Worth fixing upstream regardless: `EventsSection.tsx` orders explicitly now,
but the app generally has no `ORDER BY` backing sorts its UI depends on.

### The tripwire

Every test asserts the sentinel venue name (`Fixture Arms`) is on screen before
capturing. If the env override ever silently stops working, the suite fails
immediately rather than quietly overwriting the baselines with production data.
Both `webServer` entries also set `reuseExistingServer: false` — reusing a dev
server left over from `npm run dev` would point at the real project.

## Mapbox: hidden, not masked, not tolerance-based

Mapbox raster tiles come from a live tile server and will never be
byte-identical run to run (CDN routing, cache state, label placement), so they
have to be excluded from the comparison somehow.

The tiles are removed by hiding the canvas —
`.mapboxgl-canvas { visibility: hidden }` — injected just before the
screenshot. Layout is untouched, and the markers, navigation control and event
drawer are separate DOM nodes that keep rendering, so they are genuinely
compared pixel-for-pixel.

**This previously used Playwright's `mask` option and was broken.** A mask
paints an opaque box over the locator's *bounding box*, regardless of what
Chromium stacked on top of it. The canvas's bounding box is the whole map, and
the markers sit over it — so masking the canvas painted over the markers too.
The `map > markers visible` baseline was a solid magenta rectangle asserting
nothing but the page heading and a bordered box; it could not have caught a
marker regression or the markers vanishing outright. It survived the fixture
data going from three venues to seven without a diff, which is how the problem
surfaced. Hiding the canvas also made the synthetic partial-mask element that
the drawer test needed (to avoid blotting out the drawer) unnecessary.

The rejected alternative is unchanged: waiting for the map's idle state and
accepting a small `maxDiffPixelRatio` trades a hard guarantee for a fuzzy one.
A "small" tolerance either isn't small enough (tiles genuinely vary more than
that between runs) or is so tight it's meaningless.

The remaining blind spot: a regression visible *only* in the tile imagery
(e.g. a Mapbox GL major version subtly altering raster rendering) is invisible
to this harness. That was an accepted tradeoff for the Next/React/Tailwind
upgrade work this was built for, and remains one.

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

## CI

Both original blockers are gone. There is nothing to seed, so no
`SUPABASE_SERVICE_ROLE_KEY` is needed; and the suite no longer touches the
shared database, so adding a venue cannot turn CI red. A runner needs only
`NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` — the Supabase values are supplied by the
config and point at the fixture server.

One thing still has to be handled before enabling it: **screenshots are
OS-dependent.** The committed baselines are `-win32` suffixed (see
`snapshotPathTemplate`). A Linux runner produces `-linux` files and would fail
on filename alone — font rendering differs too. Either generate and commit
Linux baselines alongside the Windows ones, or run the suite in a container
matching the CI platform so one set serves both.

Until someone does that, `.github/workflows/ci.yml` runs typecheck/lint/unit
only.
