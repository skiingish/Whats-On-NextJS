# Specials Spotter — 2026 redesign spec

The single source of truth for the `redesign-2026` branch. Every agent working
on this branch reads this file first and implements against it. Do not invent
tokens, spacing or colours that are not described here — if something is
missing, add it here first so the next chunk stays consistent.

## Brief

Complete front-end redesign. Backend, route handlers, `lib/`, `utils/`,
Supabase schema and all data flow stay exactly as they are.

Decisions already made by the owner:

- **Keep the purple and the cream.** They are the brand.
- **One direction, fully built** — not several explorations.
- **Dark mode must look deliberate**, staying on `prefers-color-scheme`.
- **Mobile-first.** Phone is the primary device; desktop is the adaptation.
- Every existing screen, modal and flow survives. This is visual/UX only.

## The direction: "Warm Editorial"

The current look is neo-brutalist — 2px near-black outlines on everything, flat
fills, hard shadows. It reads as loud and slightly dated, and on a phone the
heavy outlines eat space and make dense content feel cramped.

The redesign keeps the *warmth* (cream, purple) but changes the *structure*:

| From | To |
|---|---|
| 2px near-black outline on every surface | Hairline borders, and mostly none — separation comes from surface elevation |
| Flat fills | Layered surfaces: page → card → popover, each a step lighter (dark: lighter; light: whiter) |
| Hard offset shadows | Soft, low-opacity, large-radius shadows |
| One radius (1rem) everywhere | A scale: 0.625 / 0.875 / 1.25 / 1.75rem, larger on bigger surfaces |
| Purple as a big button fill | Purple as a considered accent — primary actions, active states, focus rings |
| Uniform type weight | A real type scale with confident display headings |

The feeling to aim for: a well-set magazine listing. Calm, warm, generous
whitespace, content-first, with the purple doing the pointing.

## Tokens

Implemented in `app/globals.css`. HSL triplets, consuming the existing
`@theme` mapping so `bg-background` / `text-foreground` keep working.

### Light

```
--background:            36 44% 94%   /* cream, softer than before */
--background-secondary:  40 60% 99%   /* raised card surface */
--surface-raised:        0 0% 100%    /* popovers, modals, top layer */
--foreground:            265 25% 11%  /* near-black, faintly purple */
--muted:                 36 24% 88%
--muted-foreground:      265 8% 42%
--primary:               261 84% 62%  /* deeper than before: needs contrast on cream */
--primary-hover:         261 84% 55%
--primary-foreground:    0 0% 100%
--secondary:             36 30% 90%
--secondary-hover:       36 30% 85%
--secondary-foreground:  265 25% 11%
--accent:                24 90% 55%   /* warm orange, sparing — prices/highlights */
--accent-foreground:     0 0% 100%
--destructive:           2 72% 48%
--destructive-foreground:0 0% 100%
--border:                265 12% 87%  /* hairline, NOT foreground */
--input:                 265 12% 82%
--ring:                  261 84% 62%
```

### Dark

Warm near-black, not grey. Purple lifts slightly for contrast.

```
--background:            265 20% 8%
--background-secondary:  265 17% 12%
--surface-raised:        265 15% 16%
--foreground:            40 30% 96%
--muted:                 265 12% 20%
--muted-foreground:      265 8% 65%
--primary:               261 90% 72%
--primary-hover:         261 90% 78%
--primary-foreground:    265 30% 10%
--secondary:             265 15% 18%
--secondary-hover:       265 15% 23%
--secondary-foreground:  40 30% 96%
--accent:                24 85% 58%
--border:                265 12% 20%
--input:                 265 12% 24%
--ring:                  261 90% 72%
```

### Structure

```
--radius:       1.25rem       /* cards */
--radius-sm:    0.625rem      /* inputs, small controls */
--radius-md:    0.875rem      /* buttons */
--radius-lg:    1.25rem
--radius-xl:    1.75rem       /* hero, map frame, sheets */
--border-width: 1px           /* was 2px */

--shadow-sm: 0 1px 2px hsl(265 25% 11% / 0.04);
--shadow-md: 0 4px 16px -4px hsl(265 25% 11% / 0.08);
--shadow-lg: 0 12px 32px -8px hsl(265 25% 11% / 0.12);
```

Dark mode shadows are near-useless on dark surfaces — in dark, separation comes
from the surface ramp, so drop shadow opacity to ~0.4 of the light value and
rely on `--background-secondary` / `--surface-raised` instead.

## Type

System stack as today; no webfont is being added (it would cost a network
round trip on mobile for little gain).

| Role | Size (mobile → desktop) | Weight | Tracking |
|---|---|---|---|
| Display (app title) | 2.25rem → 3.5rem | 800 | -0.03em |
| H1 (page title) | 1.75rem → 2.25rem | 700 | -0.02em |
| H2 (section) | 1.25rem → 1.5rem | 650 | -0.015em |
| Venue name (card title) | 1.125rem | 650 | -0.01em |
| Body | 1rem | 400 | 0 |
| Meta (day, time) | 0.875rem | 500 | 0 |
| Price | 1.125rem | 700 | -0.01em |

Line height: 1.15 for display/headings, 1.5 for body. Never centre body text.

## Spacing and layout

- 4px base scale. Prefer `gap` over margins.
- Page gutter: `1rem` mobile, `1.5rem` ≥640px, `2rem` ≥1024px. Content max
  width `72rem`.
- Card internal padding: `1rem` mobile, `1.25rem` desktop.
- Vertical rhythm between sections: `2rem` mobile, `3rem` desktop.

## Mobile-first rules

These are requirements, not suggestions — mobile is the primary device.

1. **Design at 375px first.** Every component must work there before any
   `sm:`/`lg:` variant is added.
2. **Tap targets ≥44px.** The current icon buttons on event cards are ~32px
   and are too small.
3. **Filter/search bar sticks to the top** on scroll, with the List/Map toggle,
   so it is reachable one-handed on a long list.
4. **No horizontal scroll at any width.** Long venue names wrap; they do not
   force the card wider.
5. **Modals become bottom sheets under 640px** — full-width, rounded top
   corners only, dismissible by swipe-down where the library supports it.
6. **The map fills more of the viewport on mobile** (`70vh` is fine) but the
   drawer must not cover the whole screen.

## Component direction

- **Event card** — the core unit, and it gets the most attention. Venue name as
  the heading, the special's description as the body, price as a distinct
  accent-coloured tag rather than plain bold text, and day/time as quiet meta
  with icons. Favourite and report actions become ≥44px targets, top-right,
  visible but low-contrast until hover/focus. Card is a raised surface with a
  hairline border and `--shadow-sm`; hover lifts to `--shadow-md`.
- **Buttons** — solid purple for primary, tinted surface for secondary, ghost
  for tertiary. `--radius-md`. Never a hard black outline.
- **Inputs / search** — filled surface, hairline border, purple focus ring at
  2px offset. Generous height (44px minimum).
- **Navbar** — slim, sticky, blurred translucent background over content.
- **Map frame** — `--radius-xl`, hairline border, no heavy outline. Markers
  restyled to match the new purple; keep `VenueMap`'s logic untouched (it was
  only just stabilised — restyle `components/ui/mapmarker.tsx` and classNames
  only).
- **Drawer / sheet** — raised surface, `--radius-xl` top corners, a grab handle
  on mobile.
- **Empty states** — currently mostly blank. Every list/map empty case gets a
  short line of copy and, where sensible, a call to action.

## Accessibility bar

Non-negotiable, and cheap to get right while rebuilding:

- Text contrast ≥4.5:1, large text ≥3:1, **in both themes**. Check purple on
  cream especially — the old `261 98% 80%` fails against white foreground,
  which is why primary is deeper now.
- Every icon-only control needs an `aria-label` (several are missing today).
- Visible focus ring on every interactive element — `--ring`, 2px, 2px offset.
- Respect `prefers-reduced-motion`: no transform/opacity transitions when set.

## Work plan

Each chunk is committed separately so progress survives an interrupted session.

| # | Chunk | Status |
|---|---|---|
| 1 | Tokens, type scale, base layer in `globals.css` | done |
| 2 | UI primitives: button, dialog, drawer, popover, combobox, command | done |
| 3 | Navbar, Footer, app shell + layout | done |
| 4 | Event card (`EventsCards`) | |
| 5 | Homepage: hero, search, filters, List/Map toggle (`EventsDisplay`, `page.tsx`) | |
| 6 | Modals: AddSpecial, Feedback, Report | |
| 7 | Map page, drawer, marker restyle | |
| 8 | Login, not-found, error, Footer extras | |
| 9 | Mobile pass at 375/414px + dark-mode audit + contrast check | |
| 10 | Regenerate visual baselines, full suite, final review | |

## Rules for agents

- Read this file before touching anything.
- **Do not change** `lib/`, `utils/`, `app/**/route.ts`, `supabase/`, or any
  Supabase query. Presentation only.
- Use tokens (`bg-background`, `text-muted-foreground`, `rounded-lg`). Never
  hardcode a hex or a raw Tailwind palette class like `bg-slate-500`.
- No `dark:` utilities. Tokens already carry both themes.
- Keep every existing prop, handler and piece of state. If a component's
  behaviour must change, say so rather than silently altering it.
- Run `npx tsc --noEmit` and `npx eslint <files>` before reporting done.
- The visual baselines **will** break — that is expected and handled in chunk
  10. Do not regenerate them mid-way.
