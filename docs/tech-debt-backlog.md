# Tech debt backlog

Compiled 2026-07-27 from four parallel audits covering frontend components,
data/auth/security, test/build/infrastructure, and dead code/docs/design system.

**Scoring:** `Priority = (Impact + Risk) × (6 − Effort)`, each scored 1–5.
Effort is inverted, so cheap high-value fixes float to the top. Categories are
Code, Architecture, Test, Dependency, Documentation, Infrastructure.

Items that touch the same files have been merged — three tickets editing
`globals.css` is how a backlog rots. Where two audits disagreed, the scoring
below reflects what was verified against the database and source, not the
higher of the two claims.

---

## Corrections applied during consolidation

**`DELETE /events` was reported as "any anonymous caller can delete any event",
scored Risk 5. That is wrong and it is not in this backlog at that severity.**
The only DELETE policy on `events` is `authenticated users can delete events`,
scoped to the `authenticated` role, so an anonymous request matches no policy
and removes zero rows. Verified against `pg_policies`, and asserted by
`supabase/tests/rls_access_model.sql`. The real defect is milder and is listed
as **D8** below.

**Two errors in existing docs, found by the audits and fixed:**
`docs/admin-moderation-plan.md` cited `@react-google-maps/api` and
`react-google-recaptcha` as existing dependencies; both were removed the same
day that plan was written. Phase 4 therefore undercounted its own effort — it
needs to *add* a geocoding dependency, not reuse one.

---

## Tier 1 — data loss and access control

### D1. Deleting a venue silently destroys every event attached to it
**Architecture · Impact 5 · Risk 5 · Effort 2 · Priority 40**

**Done (2026-07-27):** `supabase/migrations/20260727010000_restrict_venue_deletion.sql`
changed both FKs to `ON DELETE RESTRICT`. `issues_event_id_fkey` was left on
CASCADE, as this doc says to. Soft delete (`deleted_at`) was considered and
deliberately not done here — it has real knock-on effects on every read of
`venues` and on the `venues` RLS policies, and nothing in the app exposes
venue deletion yet, so there's no UI in front of this to design against.
Left for whoever builds the Phase 4 venue screen. Covered by two new
assertions in `supabase/tests/rls_access_model.sql`: a venue with live events
is refused, a venue with none still deletes.

`events_venue_id_fkey` and `events_pending_venue_id_fkey` are both
`ON DELETE CASCADE` (verified via `pg_constraint`), and the policy
`"authenticated users can delete venues"` is `using (true)`. So any admin
removing a duplicate venue hard-deletes every published special at that venue,
plus anything queued for it. No confirmation, no soft delete, no audit trail,
no recovery.

This was inherited from the 2025 schema and carried forward verbatim in
`supabase/migrations/20260726000000_init_whats_on.sql`. Nothing in the app
exposes venue deletion yet, which is the only reason it hasn't bitten — the
venue management screen in Phase 4 of the admin plan would expose it directly.

*Fix:* change the FK to `ON DELETE RESTRICT`, or add `deleted_at` and soft
delete. Fence this before building any venue UI.

### D2. There is no way to create the first admin without leaving signup open
**Infrastructure · Impact 4 · Risk 5 · Effort 2 · Priority 36**

`auth.users` is empty. The access model rests entirely on accounts being
handed out deliberately — but the only mechanism that can create one is the
public signup form, which has to be disabled for the model to hold. Disable it
first and nobody can ever get in; leave it open and anyone who registers is an
admin.

Compounding it: the setting lives in an undocumented dashboard toggle. There is
no `supabase/config.toml` in the repo, so nothing version-controls
`enable_signup = false` and nothing catches a reset.

*Fix:* create the first admin via `auth.admin.createUser` with the service role,
*then* disable signup, and commit a `supabase/config.toml` so the invariant is
reviewable.

### D3. Route handlers return raw Postgres errors to the client
**Code · Impact 3 · Risk 3 · Effort 1 · Priority 30**

**Done (2026-07-27):** all three handlers now log the `PostgrestError`
server-side with `console.error` and return a generic message to the
client — `app/events/route.ts` GET, `app/feedback/route.ts` POST, and
`app/issues/route.ts` POST.

`app/events/route.ts:148`, `app/feedback/route.ts:30` and
`app/issues/route.ts:34` forward the `PostgrestError` object straight to the
caller — constraint names, hints, sometimes fragments of detail. The POST
handler in the same file deliberately swallows the same class of error into a
generic message, so there are two contradictory error contracts in one file.

*Fix:* log server-side, return a generic message to the client everywhere.

---

## Tier 2 — cheap fixes with real leverage

### D4. Delete is unguarded and fails silently — Fixed
**Code · Impact 3 · Risk 4 · Effort 1 · Priority 35**

`components/DeleteItemButton.tsx:17-19` — no confirmation step, and on error it
only `console.error`s. Success toasts; failure shows nothing, so a denied
delete is indistinguishable from a completed one. This component is the
obvious template for the admin approve/reject buttons, so the pattern
propagates if not fixed first.

*Fix:* confirmation dialog plus an error toast mirroring the success path.

### D5. `user: any` in every component that gates admin UI — Partially fixed
**Code · Impact 4 · Risk 4 · Effort 2 · Priority 32**

**Status:** `EventsDisplay.tsx`, `EventsSection.tsx`, `EventsCards.tsx` and
`VenueMap.tsx` now type `user` as `User | null` from `@supabase/supabase-js`.
`Navbar.tsx` and the call sites in `app/page.tsx` are out of scope for this
pass (owned by another agent / off-limits respectively) — still `any` there.
`app/page.tsx:89` still passes `user?.aud` to `AddEventDisplay` as the signal
for "is this an admin"; that call site needs to change to something like
`!!user` (or a real role once one exists) by whoever owns `app/page.tsx`.

Six independent `any` declarations for the single value that authorises
destructive actions: `EventsDisplay.tsx:11`, `EventsSection.tsx:6`,
`EventsCards.tsx:11`, `VenueMap.tsx:12`, `Navbar.tsx:11`, and the call sites in
`app/page.tsx`. `app/page.tsx:89` passes `user?.aud` as the admin signal, which
is Supabase's audience claim, not a role.

*Fix:* import Supabase's `User` type once and use it; consider a context rather
than drilling once the admin UI adds consumers.

### D6. ESLint is installed but completely inert
**Infrastructure · Impact 3 · Risk 3 · Effort 1 · Priority 30**

`eslint` and `eslint-config-next` are both dependencies, but there is no
`eslint.config.*` or `.eslintrc*` anywhere and no `lint` script. Nothing has
ever linted this codebase — notable given the React 18→19 upgrade, where hook
dependency violations are exactly what a linter catches.

*Fix:* `eslint.config.mjs` extending `eslint-config-next`, plus a `lint` script.

### D7. Labels are not associated with their inputs — Mostly fixed
**Code · Impact 3 · Risk 3 · Effort 1 · Priority 30**

**Status:** Fixed in `app/login/page.tsx` (both email and password — the
password input was missing an `id` too, not just email as originally
scoped), `AddSpecialModal.tsx`, `ReportEventModal.tsx` and
`FeedbackFormModal.tsx` (same defect, not explicitly named here but present).
`app/sign-up/page.tsx` is untouched — that tree is being deleted by another
agent per D11. The day-toggle switches in `AddSpecialModal` were checked:
each `sr-only peer` checkbox is already wrapped by its `<label>`, so it has
an implicit accessible name and remains keyboard-reachable (`sr-only` hides
visually, not from the accessibility tree or tab order) — no change needed
there. One label (`AddSpecialModal`'s "Where", paired with `VenueComboBox`)
is still unassociated: the combobox trigger in `components/ui/combobox.tsx`
exposes no `id`, and that file is out of scope for this pass.

`app/login/page.tsx:35` has `htmlFor='email'` but the input at line 40 carries
only `name='email'` — no `id`. Same defect on `app/sign-up/page.tsx`, and the
labels in `AddSpecialModal.tsx` and `ReportEventModal.tsx` have no `htmlFor` at
all. Screen readers announce these as unlabelled; clicking a label doesn't
focus its field. This affects both auth forms and both submission modals.

*Fix:* matching `id`/`htmlFor` pairs.

### D8. `DELETE /events` reports success regardless of what happened
**Code · Impact 2 · Risk 2 · Effort 2 · Priority 16**

`app/events/route.ts:154-170` returns a 301 redirect whether or not any row was
affected, and has no application-level auth check — it relies entirely on RLS
to no-op. It is also unreferenced: `DeleteItemButton` calls Supabase directly
and `AddSpecialModal.tsx:57` only POSTs, so nothing invokes this method.

RLS does block anonymous deletes (see the correction above), so this is a
correctness and defence-in-depth issue, not a live vulnerability.

*Fix:* delete the handler, or add a `getUser()` guard and check the affected
row count before redirecting.

**Done (2026-07-27):** deleted the handler. Confirmed nothing calls it —
`DeleteItemButton` uses the Supabase client directly and
`AddSpecialModal.tsx` only POSTs — so there was no caller to migrate to a
guarded version.

---

## Tier 3 — structural, do before the admin UI

### D9. A third colour system, and a 7×-duplicated toggle
**Code / Architecture · Impact 4 · Risk 3 · Effort 2 · Priority 28**

Beyond the two known token systems in `globals.css`, there is a third layer:
raw Tailwind palette classes (`bg-gray-200`, `ring-blue-300`, `bg-orange-500`,
`bg-neutral-900`, …) across 13 files, routing through neither token system.

The worst instance is the day-of-week toggle in `AddSpecialModal.tsx:165-227` —
a ~400-character class string copy-pasted verbatim seven times, once per day,
instead of mapping over a `DAYS` array.

**Merge note:** this, the known dual-token problem, the two competing
`@layer base { * {...} }` blocks at `globals.css:71-75` and `96-103` (the first
is dead — the second wins on cascade order), the Tailwind 4 migration, and
Phase 0 of the admin plan are all *the same piece of work*. Do them as one
pass. The Tailwind 4 codemod is a syntax translator that would faithfully carry
this mess into `@theme` unchanged.

### D10. No error tracking, no error boundaries
**Infrastructure · Impact 3 · Risk 4 · Effort 2 · Priority 28**

`@vercel/analytics` and `speed-insights` are page-view and performance metrics,
not error capture. There is no `app/error.tsx` or `app/global-error.tsx`, and
route handlers only `console.error`. Production failures surface nowhere except
raw Vercel function logs — no aggregation, no alerting, no fallback UI.

### D11. The invite feature is broken and visible to users right now
**Code · Impact 3 · Risk 4 · Effort 2 · Priority 28**

Every signed-in user sees an "Invite User" button in the nav. It routes to
`/invite` → `/auth/generate-invite`, which throws immediately because
`JWT_SECRET` is unset, and redirects to a generic error. The downstream
`/sign-up` route has the same guard, so the second half is unreachable too.

Worse than dead code: even with the secret set, the design is unsafe. The
payload is `{ data: inviterUserId }` — not the invitee's email — with no `jti`
to revoke, delivered in a query string that persists in access logs, browser
history and `Referer` headers for seven days. Anyone obtaining that URL becomes
an admin. Do not fix this by setting `JWT_SECRET`.

*Fix:* delete `app/invite/`, `app/sign-up/`, `app/auth/sign-up/`,
`app/auth/generate-invite/`, `components/InviteUserButton.tsx`, and drop
`jsonwebtoken`. Phase 6 of the admin plan replaces it with
`auth.admin.inviteUserByEmail`.

### D12. No CI
**Infrastructure · Impact 5 · Risk 4 · Effort 3 · Priority 27**

No `.github/` directory. Because `experimental.useTypeScriptCli` is set, a
Vercel deploy does typecheck as a side effect of `next build` — but that is the
only automatic gate in existence. The 39 unit tests and the visual suite run
only when someone remembers. Branch protection isn't possible without a check
to require.

*Fix:* a workflow running `npm ci`, `typecheck`, `lint`, `test` on PRs.
Playwright can stay manual until D14 is resolved.

### D13. No `updated_at` on any table
**Architecture · Impact 3 · Risk 2 · Effort 1 · Priority 25**

All five tables have `created_at` only. Phase 5 of the admin plan adds inline
editing under `using (true) with check (true)` policies with no version check —
two admins editing the same row race silently, last write wins, invisibly.

*Fix:* one migration adding `updated_at` plus a `BEFORE UPDATE` trigger.

**Done (2026-07-27):** `supabase/migrations/20260727020000_add_updated_at.sql`
added `updated_at` to all five tables plus one shared
`public.set_updated_at()` trigger function, attached to each. A follow-up,
`20260727021000_updated_at_use_clock_timestamp.sql`, switched the function
from `now()` to `clock_timestamp()` — `now()` is fixed for the whole
enclosing transaction, so two updates to the same row inside one transaction
would get an identical timestamp, which defeats the point for the race D13
describes. Covered in `supabase/tests/rls_access_model.sql`.

---

## Tier 4 — hygiene

### D14. Playwright verifies pixels, nothing else
**Test · Impact 3 · Risk 3 · Effort 3 · Priority 18**

Every scenario asserts element visibility, then screenshots. `login` and
`sign-up` never submit; nothing posts an event. Even once the seeding gap is
solved, the suite covers CSS and layout drift only — no auth or submission
regression coverage. Worth stating plainly so "we have Playwright" isn't
mistaken for functional coverage.

### D15. Dead code sweep
**Code · Impact 3 · Risk 2 · Effort 1 · Priority 25**

Verified unreferenced by repo-wide grep:

| Path | Origin |
|---|---|
| `components/Logo.tsx` | Supabase starter template |
| `components/RainingAnimatation.tsx` | abandoned animation; imported but usage commented out |
| `components/ui/select.tsx` | shadcn CLI output, never wired up |
| `app/globals_v1.css` | predates the `.dark` overrides |
| `public/assets/burger_png.png` | only consumer is the dead animation |
| `public/assets/{android-chrome-*,apple-touch-icon,favicon-*}.png` | superseded by root `public/icon-*.png` |

Plus `app/page.tsx:38-49` — `getSubdomainFromUrl` ignores its parameter,
hardcodes `jasper.specials-spotter.com`, and `console.log`s on every request
since the page is `force-dynamic`. Its only consumer is commented-out JSX at
line 75. And `EventsDisplay.tsx:17` — `setActiveList` has exactly one
occurrence, its own declaration, so the favourites filter branch is
unreachable.

### D16. Other items

| ID | Item | Cat | Pri |
|---|---|---|---|
| D17 | ~~`ReportEventModal.tsx:34-37` throws before the `try`, leaving the spinner stuck with no reachable Cancel~~ **Fixed** — guard moved before `setLoading(true)`, returns early instead of throwing | Code | 25 |
| D18 | `public/sitemap.xml` is invalid XML (malformed prolog, HTML comment before the document) and lists only `/` with a 2023 `lastmod` | Doc | 25 |
| D19 | No `.env.example`; `JWT_SECRET` is required by two routes and set nowhere, failing invisibly inside a try/catch | Infra | 24 |
| D20 | ~~`EventsDisplay.tsx:60-97` mutates prop objects and the prop array, and re-sorts/filters on every keystroke unmemoized~~ **Fixed** — derives into new arrays via a chain of `useMemo`s, props untouched | Code | 24 |
| D21 | ~~`venues.name` is uniquely indexed case- and whitespace-sensitively, but the publish path inserts unnormalised while the planned approve RPC normalises — "The Local" and "the local " become two venues~~ **Fixed** — unique index on `lower(btrim(name))`, and the publish path normalises to match | Code | 24 |
| D22 | ~~`EventsCards.tsx:112` renders an Edit button with no handler on every card~~ **Fixed** — button removed (Phase 5 of the admin plan builds real editing) | Code | 21 |
| D23 | The auth/invite routes — the actual authorisation boundary — have zero test coverage | Test | 21 |
| D24 | `proxy.ts` has no `config.matcher`, so every request including static assets triggers a `getUser()` round trip | Infra | 20 |
| D25 | README is 7 lines with no env vars, scripts, or pointers to the migrations and test suites; no CLAUDE.md | Doc | 20 |
| D26 | ~~Validation is inconsistent — `AddSpecialModal` defines a Zod schema it never parses; the two modals that do validate surface `error.message`, the raw JSON issues array~~ **Fixed** — `AddSpecialModal` now parses its schema (and its stray unused `set` import is gone); all three modals show `z.prettifyError(result.error)` and return early on failure instead of double-toasting (validation toast + generic catch-all toast) | Code | 20 |
| D27 | `dayformatter`'s separator bug is pinned by tests rather than fixed — the two collapse branches have never fired in production | Code | 16 |
| D28 | ~~`EventDrawer.tsx:30` reads `window.innerWidth` in the render body, never recomputes, and risks a hydration mismatch~~ **Fixed** — now uses a `matchMedia('(min-width: 1024px)')` listener, same pattern as `VenueMap`'s dark-mode query | Code | 16 |
| D29 | `bun.lockb` predates the entire Next 13→16 upgrade; npm is canonical | Dep | 15 |
| D30 | `"when"` stores multiple days as one space-joined string — no index-backed "what's on today" query is possible | Arch | 12 |

**D21, done 2026-07-27:** `venues_name_key` (plain `UNIQUE (name)`) was
replaced by `venues_name_normalized_key`, a unique index on
`lower(btrim(name))`, in
`supabase/migrations/20260727030000_normalize_venue_names.sql`. Replaced
rather than kept alongside, since the normalised index is strictly stronger
— nothing that passed the old constraint and fails the new one was ever a
distinct venue, and no existing rows collided when checked beforehand. The
same migration added `public.find_venue_id_by_name(text)`, a small
`security invoker` lookup helper; `app/events/route.ts` now trims a
submitted venue name and calls it to reuse a matching venue before falling
back to inserting a new one, matching the normalisation the planned
`approve_pending_event` RPC uses.

---

## Suggested sequencing

**Before any admin UI work:** D1, D2, D13, D9. These change the schema or the
design system, and every screen built beforehand would need reworking. D2 in
particular blocks *testing* any admin feature, since no admin account exists.

**Alongside, cheap and independent:** D3, D4, D6, D7, D11, D15, D18. Small,
self-contained, mostly deletions.

**Before the team grows past one person:** D12, D10, D19, D25. All about a
second contributor being able to run, deploy and debug the thing safely.

**Fold into existing planned work:** D9 into Phase 0. D11 into Phase 6. D5 and
D22 into whatever builds the admin screens. D21 into the approve RPC in
Phase 3.

**Deliberately deferred:** D30 is a real modelling problem but a large migration
with no forcing function yet. D14 matters once there is functionality worth
regression-testing.
