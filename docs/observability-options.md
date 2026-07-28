# Observability options

Status: recommendation, 2026-07-29. Written for backlog item D10 (no error
tracking, no error boundaries). `app/error.tsx` and `app/global-error.tsx`
now exist (see below) but only `console.error` — nothing aggregates,
deduplicates, or alerts on what they catch. **This document does not install
anything.** Every option below needs either a hosted account (Sentry, Axiom)
or a server the user would have to stand up and pay for (GlitchTip) — none
of that can be created on the user's behalf, and adding a dependency right
now would collide with the parallel Tailwind/component-library work.

## Why this matters for this app specifically

- Every current failure path (`app/events/route.ts`, `app/feedback/route.ts`,
  `app/issues/route.ts`, and now `app/error.tsx` / `app/global-error.tsx`)
  ends at `console.error`, which reaches **Vercel's function logs and
  nothing else**. Logs are unindexed text, retained on a rolling window, and
  nobody is notified when a new one appears.
- The app has no users to complain on your behalf yet, and no staging
  environment — production is the only environment. That argues for
  something that costs nothing until it's actually catching real errors.
- The team is one person. Anything that needs its own server to operate
  (self-hosted GlitchTip) is a maintenance burden competing with the
  product itself.

## The options

### 1. Sentry

The default answer for a reason: purpose-built for this, first-class
Next.js App Router support via `@sentry/nextjs`.

- **Cost at this scale:** free tier is 5k errors/month, 1 team member,
  30-day retention. This app is well inside that.
- **Integration:** `npx @sentry/wizard@latest -i nextjs` wires up
  `sentry.server.config.ts` / `sentry.client.config.ts` /
  `sentry.edge.config.ts`, wraps `next.config.js` in `withSentryConfig`, and
  — the part relevant here — auto-instruments `app/error.tsx` /
  `app/global-error.tsx` (or adds `Sentry.captureException(error)` inside
  them if you keep your own copy). Source maps upload on build for readable
  stack traces.
- **Downside for right now:** it's an npm dependency and a config-file
  change to `next.config.js`, both of which are owned by other agents mid-
  migration in this branch. Also needs a DSN, which means creating a
  Sentry account/project — a step only the user can do.
- **Verdict:** the right long-term answer, but not installable in this pass.

### 2. Vercel's built-in error monitoring (Observability tab)

Since the app is already deployed on Vercel, this is the zero-dependency
option.

- **Cost at this scale:** included on Vercel's Hobby and Pro plans. Runtime
  Logs and the Monitoring/Observability tab already capture unhandled
  exceptions in Server Components, Route Handlers, and Edge/middleware —
  no code change required, it reads the same stderr `console.error` calls
  already in place.
- **Integration:** none. It's already active by virtue of deploying to
  Vercel. What it lacks compared to Sentry: no deduplication/grouping of
  repeat errors into one issue, no alerting rules beyond basic Slack/email
  integrations on Pro+, no client-side (browser) error capture — it only
  sees what reaches a server-side `console.error`, so a React render
  crash caught by `app/error.tsx` in the browser needs its own
  `console.error` call to show up there at all (which is why both boundary
  files added in this pass call it explicitly).
- **Verdict:** already the effective baseline. Free, requires nothing
  further, but weaker than a real tracker once traffic grows.

### 3. Axiom

Log-management-first rather than error-tracking-first; Vercel has a native
Log Drain integration for it.

- **Cost at this scale:** free tier is 0.5GB ingest/month, which is
  generous for an app this size's log volume.
- **Integration:** connect via the Vercel Integrations marketplace (no code
  change for basic log shipping) or `next-axiom` for structured
  `log.error()` calls from within route handlers and boundaries. Gives
  search/filter/dashboards over logs, not error grouping — you'd still be
  reading individual `console.error` lines, just indexed and queryable
  instead of Vercel's rolling raw log view.
- **Verdict:** better logs, not really error *tracking*. Worth it once log
  volume or retention becomes the actual pain point; it doesn't solve
  "tell me when something new breaks" as directly as Sentry does.

### 4. Self-hosted GlitchTip

An open-source, Sentry-protocol-compatible error tracker. Same client SDK
(`@sentry/nextjs` points its DSN at your GlitchTip instance instead of
Sentry's), so the App Router integration story is identical to option 1.

- **Cost at this scale:** free in dollars, not in effort — needs a Postgres
  + Redis-backed server (a small Fly.io/Render instance or a Docker
  Compose box), which is one more thing to patch, back up, and keep
  online. For comparison, the entire rest of this stack (Vercel + Supabase)
  is already managed.
- **Integration:** identical code path to Sentry (`@sentry/nextjs`), only
  the DSN host differs.
- **Verdict:** makes sense if there's a reason to avoid a third-party SaaS
  (cost at much higher volume, data residency). For a one-person project
  with no compliance constraint, the ops burden isn't worth it yet.

## Recommendation

**Do nothing further today beyond what this pass already added — lean on
Vercel's built-in Observability tab as the current baseline, and adopt
Sentry's free tier (`@sentry/nextjs`) as the first real dependency once
someone other than the maintainer is relying on this app, or once a bug
report shows up that the Vercel logs can't explain.**

Reasoning: the free tier of Sentry comfortably covers this app's expected
volume, so cost isn't the blocker — availability of a DSN is. That's a
five-minute step (create a Sentry account, create a project, copy the DSN
into a Vercel env var) that only the account owner can do, and it's cleanly
decoupled from any code in this branch. `@sentry/nextjs`'s wizard finds
`app/error.tsx` and `app/global-error.tsx` and instruments them directly —
having those two files in place *now* (this pass) means the future Sentry
install is additive, not a rewrite. Axiom and GlitchTip both solve a real
problem but a different one (log search at volume, and vendor independence
respectively) than the immediate gap, which is "get told when something
breaks in production without someone reading raw Vercel logs."

## What already exists as a hook point

- `app/error.tsx` — route-segment boundary, logs to console, offers retry.
- `app/global-error.tsx` — root-layout boundary, same, renders its own
  `<html>`/`<body>` since no ancestor layout survives to provide one.
- `app/not-found.tsx` — 404s, not wired to any tracker (they aren't errors).

Wiring in a tracker later means adding one `Sentry.captureException(error)`
call (or equivalent) inside each `useEffect` in these two files, next to the
existing `console.error`, plus the SDK's own instrumentation for anything
these boundaries don't reach (e.g. a route handler's `catch` block).
