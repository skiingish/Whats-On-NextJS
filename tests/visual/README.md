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

## The data situation — read this before your first run

**No seeding is needed any more. The baselines are pinned to live data
instead, and that has its own cost.**

This used to require three `PWTEST `-prefixed fixture venues seeded into an
otherwise-empty database, because with no venues `/map` has no markers and the
homepage's event list is blank. That is no longer the case: the database now
holds real venue and event data permanently, so every screen has content
without any setup. The fixture rows were deleted.

The tradeoff, stated plainly: **the baselines now capture whatever is in the
shared database.** Adding a venue, editing a price or removing a special
legitimately changes these images, and the suite will fail until
`npm run test:visual:update` is re-run and the new PNGs committed. A failure
here means "the rendered output changed", which now includes "the data
changed" — it is not necessarily a code regression. Check what moved before
assuming the worst.

To limit the blast radius, the *test logic* is deliberately data-independent:
no hardcoded marker count, no fixture venue name. The waits only assert that
data has rendered (at least one marker; at least one event card, located via
the Report button's `aria-label`), and let the screenshot be the assertion. So
a data change updates the images but never breaks the tests themselves.

### If you want isolation back

The right fix is a database the suite controls — a local `supabase start`
stack, or a dedicated preview project — pointed at via
`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` for the run.
`tests/visual/fixtures/seed.sql`, `cleanup.sql` and
`seed-with-service-role.mjs` are kept for exactly that: they still describe a
known-good three-venue dataset. They are no longer part of the normal
workflow, and seeding them into the shared database now would *add* to the
real data rather than replace it.

Two properties of that fixture set are worth preserving in any replacement,
because both were learned the hard way:

- **Every fixture event's `when` lists all seven days** (renders as "Everyday"
  per `utils/dataformatter.ts`). `EventsDisplay.tsx` defaults its day filter to
  *today's* weekday, so an event scoped to a single day vanishes from the
  homepage list on other days — making "a real regression" and "a Wednesday
  happened" indistinguishable causes of a failed diff. (The current real data
  does *not* have this property, which is one more reason the images move.)
- **Every fixture event gets an explicit, distinct `created_at`.** Not
  cosmetic: `EventsSection.tsx`'s query has no `.order()` and
  `EventsDisplay.tsx` falls back to `created_at` descending as a tiebreaker. A
  single multi-row `INSERT` evaluates `now()` once for the whole statement, so
  all three fixture events shared one timestamp, and Postgres does not
  guarantee row order for an unordered `select` — the homepage list's order
  silently flipped between two otherwise-identical runs. Still worth fixing
  upstream: the app has no explicit `ORDER BY` backing a sort its UI depends
  on.

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

## CI gap, summarized

The original blocker — needing a `SUPABASE_SERVICE_ROLE_KEY` to seed, which
does not exist in this repo — **is gone**, since nothing needs seeding. A CI
runner now needs only the two `NEXT_PUBLIC_` Supabase values the app already
uses, plus `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`.

What still argues against turning it on in CI:

1. **Baselines track live data.** Every venue added would turn CI red until
   someone regenerates the PNGs — noisy while this project is actively
   collecting venues.
2. **Screenshots are OS-dependent.** The committed baselines are `-win32`
   suffixed. A Linux runner generates different files and would fail on
   filename alone; it needs its own baselines, generated on that platform.

So `.github/workflows/ci.yml` still runs typecheck/lint/unit only. Point the
suite at an isolated database (see above) before wiring it up.
