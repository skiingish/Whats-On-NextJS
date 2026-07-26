# Admin & Moderation UI — plan

Status: draft, 2026-07-27. Target branch: `2026-refresh`.

The database was restarted and locked down (see `supabase/migrations/`), but
nothing in the app reads `events_pending`, `issues` or `feedback`. Right now the
only way to approve a submission is the Supabase dashboard. This plan builds the
admin surface that closes that loop.

## Scope

Six areas, all admin-only:

1. **Moderation queue** — approve/reject pending events, including creating the
   venue a visitor proposed by name.
2. **Venues** — create and edit venues, including map coordinates.
3. **Live events** — edit and delete already-published events.
4. **Issues inbox** — visitor reports against live events.
5. **Feedback inbox** — general site feedback.
6. **Admin invites** — bring another admin in.

## Constraints this has to respect

**`authenticated` means admin.** Every RLS policy grants blanket rights to that
role; there is no per-user ownership and no admin flag. Account creation *is*
the security boundary, so Supabase signup must stay disabled and admins get
added deliberately. Anything that changes this assumption invalidates every
policy in `20260726000000_init_whats_on.sql`.

**RLS is the backstop, not the UI.** Admin pages read `events_pending`,
`issues` and `feedback` — all three are invisible to `anon` at the database
level. A routing mistake leaks nothing. Keep it that way: never reach for the
service-role key to render a page.

**Approval is multi-step.** Approving a submission with a proposed venue means
creating a venue, inserting an event, and deleting the pending row. Half-done
leaves orphan venues.

---

## Phase 0 — Design tokens

This has to come first, because the component library is built on it and the
current token setup can't carry an admin UI.

### The problem

`app/globals.css` defines two competing systems:

| System | Tokens | Who uses them |
|---|---|---|
| Brand | `background`, `foreground`, `btn-background`, `highlight`, `dark-background`, `dark-text-foreground` | the app's own components |
| Stock shadcn | `primary`, `secondary`, `muted`, `accent`, `card`, `border`, `ring`, `chart-*` | almost nothing |

Worse, they disagree about dark mode. The `.dark` block overrides only the stock
tokens; the brand ones are re-specified per element as manual utilities:

```
dark:bg-dark-background dark:text-dark-text-foreground
```

So dark mode is applied by hand, on every element, forever. `AddSpecialModal`
repeats this on all five inputs:

```
rounded-2xl px-4 py-2 bg-inherit border-2 border-foreground bg-white
  dark:bg-dark-background mb-6
```

That string is the design system. It's copy-pasted, and `bg-inherit` is
immediately overridden by `bg-white` in the same class list.

### The fix

1. Express the neo-brutalist palette in the **standard** shadcn token names, so
   `Card`, `Input`, `Badge` etc. inherit the brand for free:
   `--background` cream, `--foreground` near-black, `--primary` the purple
   (`261 98% 80%`), `--accent` the orange (`28 100% 50%`), `--border`
   `--foreground` so `border` is black by default.
2. Give `.dark` a real override for **every** brand token.
3. Delete the `dark-*` token family and strip every manual `dark:` utility.
4. Add the two structural constants as tokens, since they *are* the look:
   `--radius: 1rem` (rounded-2xl) and a `--border-width: 2px`.

Done once, `bg-background text-foreground border` produces the correct look in
both themes with no `dark:` prefixes anywhere.

---

## Phase 1 — Component library

`components.json` already points at shadcn with `baseColor: gray`. The existing
`ui/` folder has button, combobox, command, dialog, drawer, popover, select.

### Approach

Wrap shadcn primitives in a **brutalist variant layer** using `cva` (already a
dependency) so the thick-border look is a named variant rather than a repeated
class string:

```ts
// components/ui/card.tsx
const cardVariants = cva(
  'rounded-2xl border-2 border-foreground bg-background-secondary',
  {
    variants: {
      tone: {
        default: '',
        pending: 'border-accent',
        danger:  'border-destructive',
      },
      density: {
        comfortable: 'p-6',
        compact:     'p-3',
      },
    },
    defaultVariants: { tone: 'default', density: 'comfortable' },
  }
);
```

`density` matters: the playful look eats vertical space, and a moderation queue
is a list you scan. Cards get `comfortable` on the public site and `compact` in
admin tables, without forking the component.

### To add

| Component | Why |
|---|---|
| `card` | queue items, inbox rows, venue tiles |
| `badge` | `NEW VENUE`, pending counts, issue types |
| `input` / `textarea` / `label` / `field` | replaces the repeated class string |
| `table` | venues and live events; `compact` density |
| `tabs` | admin section nav |
| `alert-dialog` | confirm reject and delete |
| `dropdown-menu` | row actions |
| `skeleton` | loading states |
| `empty-state` | every inbox starts empty — worth designing deliberately |

`sonner` already covers toasts; keep it.

### Preview route

Add `app/admin/components/page.tsx` — a live gallery rendering every component
in every variant, light and dark. It doubles as a visual regression check when
tokens change and costs nothing to maintain, since it imports the real
components.

---

## Phase 2 — Admin shell and auth guard

```
app/admin/
  layout.tsx        shell: header, tab nav, pending-count badge
  page.tsx          dashboard: counts per queue
  queue/page.tsx
  venues/page.tsx
  venues/[id]/page.tsx
  events/page.tsx
  issues/page.tsx
  feedback/page.tsx
  admins/page.tsx
  components/page.tsx
```

Guard in **two** places:

- `middleware.ts` — already creates a Supabase client to refresh the session;
  extend it to redirect `/admin/*` to `/login` when there's no session. Cheap,
  runs before render.
- `app/admin/layout.tsx` — re-check server-side with `getUser()`. Middleware
  alone is not a security boundary; it can be bypassed in some deployment
  configurations and doesn't run for every rendering path.

Use `getUser()`, not `getSession()`, in the layout — `getSession()` trusts the
cookie without revalidating it against the auth server. The existing routes use
`getSession()`; for the admin guard that's not good enough.

---

## Phase 3 — Moderation queue

The core of the feature.

### Approve must be atomic

Do it in Postgres, not in three client round-trips:

```sql
create function public.approve_pending_event(pending_id bigint)
returns bigint
language plpgsql
security invoker   -- caller's RLS still applies: anon cannot call this
as $$
declare
  p       public.events_pending;
  v_id    integer;
  new_id  bigint;
begin
  select * into strict p from public.events_pending where id = pending_id;

  v_id := p.venue_id;

  -- Proposed venue: reuse an existing name-match before creating one, since
  -- venues.name is UNIQUE and a blind insert would fail.
  if v_id is null then
    select id into v_id from public.venues
      where lower(name) = lower(btrim(p.venue_name));

    if v_id is null then
      insert into public.venues (name) values (btrim(p.venue_name))
        returning id into v_id;
    end if;
  end if;

  insert into public.events ("desc", "when", special_price, event_time, venue_id)
    values (p."desc", p."when", p.special_price, p.event_time, v_id)
    returning id into new_id;

  delete from public.events_pending where id = pending_id;

  return new_id;
end $$;

revoke execute on function public.approve_pending_event(bigint) from anon;
```

`security invoker` is deliberate: the function runs with the caller's rights, so
RLS blocks an anonymous caller at the insert. A `security definer` function here
would be a privilege-escalation hole.

One statement, one transaction — no orphan venues.

### UI

Card per submission (`tone="pending"` when the venue is proposed):

- description, venue, day, price, time, relative submitted-at
- an orange `NEW VENUE` badge when `venue_id is null`, showing the proposed name
- **Approve** — calls the RPC
- **Approve & edit** — approve, then jump to the new event to fill in details
- **Reject** — `alert-dialog` confirm, then delete

Server Actions with `revalidatePath('/admin/queue')`, not the redirect-dance the
current `app/events/route.ts` does. Optimistic removal via `useOptimistic` so
the card leaves immediately.

Empty state matters — this screen is empty most of the time. Make it a
deliberate "nothing to review" rather than a blank page.

---

## Phase 4 — Venues

List with search; create/edit form.

The interesting part is **coordinates** — `venues.latitude` / `longitude` are
`numeric(9,6)` and drive the map, and `EventsSection` filters out any venue
missing them. A venue born from an approval has a name and nothing else, so the
admin needs a fast way to fix that:

1. Type an address
2. **Find on map** — Google Geocoding, using the existing
   `@react-google-maps/api` dependency and API key
3. Drag the marker to fine-tune
4. Save writes address + lat/lng together

Show an "incomplete" badge on venues without coordinates, since those are
invisible on the public map. A filter for them turns the venue list into a
work queue.

---

## Phase 5 — Live events, issues, feedback

**Live events** — table of `events` joined to `venues`, with inline edit and
delete. Deleting an event cascades to its issues (`issues_event_id_fkey` is
`on delete cascade`), which is the behaviour you want; say so in the confirm
dialog.

**Issues inbox** — group by event so five reports against one event read as one
problem. Each row links to the event's edit form. Resolving is deleting.

**Feedback inbox** — reverse-chronological list, name/email/message, `mailto:`
link on the email. There's no read/unread column; either add one
(`read_at timestamptz`) or treat deletion as the workflow. Adding the column is
cleaner and is a one-line migration.

---

## Phase 6 — Admin invites

This one has real prerequisites.

The existing flow (`app/auth/generate-invite/route.ts` → JWT → `sign-up`) is
already dead — `JWT_SECRET` is unset, so it throws on every call — and once
signup is disabled it can never work, because it ends in `supabase.auth.signUp`.

**Replace it with Supabase's own invite:**

```ts
// lib/supabase-admin.ts
import 'server-only';   // hard build error if this reaches a client bundle
```

`auth.admin.inviteUserByEmail(email)` sends an invite and creates the user in a
pending state. It requires the **service-role key**, which bypasses RLS
entirely — so:

- `SUPABASE_SERVICE_ROLE_KEY`, never `NEXT_PUBLIC_`-prefixed
- confined to one module marked `server-only`
- the Server Action must verify the *caller* is signed in before calling it —
  otherwise it's an open invite endpoint
- add it to Vercel as an encrypted env var

Then delete `app/invite/`, `app/sign-up/`, `app/auth/sign-up/`,
`app/auth/generate-invite/`, `components/InviteUserButton.tsx`, and drop the
`jsonwebtoken` and `@types/jsonwebtoken` dependencies.

**Email delivery is a prerequisite.** Supabase's built-in SMTP is rate-limited
to a handful of messages per hour and is explicitly not for production. Invites
will silently fail to arrive without custom SMTP configured (Resend, Postmark,
SES). Set this up before relying on invites.

The admins screen itself lists `auth.users` (email, invited/confirmed, last
sign-in) with an invite form and a revoke action.

---

## Sequencing

Phases 0–1 are shared foundation. Phase 2 is the feature that actually matters —
everything before it is scaffolding, everything after is filling in screens.

| Phase | Blocked by | Notes |
|---|---|---|
| 0 Tokens | — | do first; touches every component |
| 1 Component lib | 0 | preview route lands here |
| 2 Admin shell | 1 | + middleware guard |
| 3 Queue | 2 | needs the approve RPC migration |
| 4 Venues | 2 | needs Geocoding API enabled |
| 5 Events/issues/feedback | 2 | optional `feedback.read_at` migration |
| 6 Invites | 2 | needs service-role key **and** custom SMTP |

If you want the shortest path to "I can stop using the Supabase dashboard":
0 → 1 (only card/badge/button) → 2 → 3.

## Migrations this plan adds

1. `approve_pending_event(bigint)` function + `revoke ... from anon`
2. `feedback.read_at timestamptz` (optional, Phase 5)

## Open questions

- **Rejections vanish.** Reject deletes the row, so there's no record and a
  spammer can resubmit the same thing forever. Worth a `rejected_at` +
  `rejected_reason` soft delete instead?
- **No submission rate limit.** `events_pending`, `issues` and `feedback` all
  accept unlimited anonymous inserts. The queue is the thing that suffers.
  Cloudflare Turnstile or a per-IP limit is the usual answer —
  `react-google-recaptcha` is already a dependency but appears unused.
- **Map API key exposure.** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` ships in the
  bundle, which is normal, but it must be restricted by HTTP referrer in the
  Google Cloud console or it can be used from anywhere and billed to you.
  Geocoding in Phase 4 increases what an unrestricted key costs you.
