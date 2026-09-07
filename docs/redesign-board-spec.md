# Specials Spotter — "THE BOARD"

Replaces `docs/redesign-2026-spec.md`. That direction ("Warm Editorial") was
competent and completely forgettable — rounded cards on a page with a purple
accent, which describes roughly every SaaS product shipped since 2020. It had
no argument, and nothing in it came from what this app actually *is*.

## The idea

**Specials live on a chalkboard.** Every pub in the Dandenongs writes its parma
night on an A-frame slate out the front, in chalk, by hand. That is the native
physical object of this entire product. The app should be that object.

So the app is a board, and it flips with the light:

| | |
|---|---|
| **Dark** | **The chalkboard.** Deep slate, warm chalk lettering, chalk dust in the grain, purple neon glow like the beer sign in the window. |
| **Light** | **The menu card.** Warm butcher paper, charcoal ink, purple stamped like a rubber stamp on a docket. |

Both are real objects from the same pub. That is what makes the two themes feel
like one product rather than a palette and its inversion.

Crucially this *keeps the brief*: the cream is the paper and the chalk, the
purple is the neon and the ink. Same brand colours, doing a job.

## What someone remembers

The **price**. It is the reason anyone opens this app. It gets set in heavy
display type inside a hand-drawn chalk ring (dark) or a stamped ink box
(light) — rotated a degree or two off true, because nothing on a real board is
straight. Every other design decision defers to making that one element sing.

## Type

Three faces, each doing a specific job. No system stack.

| Face | Role | Why |
|---|---|---|
| **Fraunces** (variable, high `wonk` + `soft` axes) | Display, venue names, prices | A serif with deliberate irregularity in its curves. Reads as hand-cut signage rather than a font, which is exactly the chalkboard register. |
| **Archivo** | Body, controls | A grotesque with real width and warmth. Holds up small on a phone without going anonymous like Inter. |
| **Courier Prime** | Day, time, source links, the hero kicker | Typewriter. Dockets, receipts, laminated bistro menus. Cheap in the right way. |

**Each face has exactly one job, and mono has the narrowest.** `.text-meta`
(Courier, uppercase, tracked) is for **short data tokens only** — a day, a
time, a label, a source link. Never a sentence. All small supporting prose —
help text, empty states, page subtitles, hints — uses `.text-note` (Archivo).

Collapsing those two is what made the first cut of this direction look
scattered: mono was setting whole sentences in uppercase, including page
subtitles and "Hey, {email}", which is both unreadable and makes three faces
read as no system at all.

Agbalumo is retired: it was doing the "characterful display" job that Fraunces
now does properly, and two display faces fight.

## Texture — non-negotiable

Flat fills are what made the last attempt generic. Every surface carries grain:

- **Dark**: fine chalk-dust noise over slate, plus a soft vignette so the board
  has a lit centre.
- **Light**: coarser paper fibre, slightly warm.

Implemented as an SVG `feTurbulence` data URI on a fixed overlay at low opacity.
One element, no images, no layout cost.

## Rules

- **Nothing is perfectly straight.** Cards, price rings and the segmented
  control carry sub-degree rotations. Never more than `1.2deg` — it should read
  as handmade, not broken.
- **Chalk borders are irregular** — hairlines at partial opacity, never a crisp
  1px box.
- **Neon glows only in dark.** In light, the same element is a flat stamped ink
  block. Glow in light mode looks like a mistake.
- **Purple is punctuation, not upholstery.** Active states, the price, one CTA.
- Everything from the previous pass that was *structural* stays: bottom sheets
  under 640px, 44px targets, the shell layout fix, focus rings, reduced-motion,
  the contrast bar. That work was right; only the skin was wrong.

## Contrast still applies

Chalk on slate and ink on paper are both naturally high-contrast, which helps,
but the glow and the grain must not erode it. Body text >= 4.5:1 in both themes,
measured, not assumed.

## Motion

One orchestrated arrival: cards chalk in on load with a staggered reveal
(80ms apart, opacity + a few px of rise, no scale). Hover lifts a card and
brightens its rule. Nothing else moves. Suppressed entirely under
`prefers-reduced-motion`.
