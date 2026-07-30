-- D21 (docs/tech-debt-backlog.md): venue-name uniqueness didn't match the
-- normalisation the planned approval flow uses.
--
-- venues_name_key was a plain `UNIQUE (name)` -- case- and
-- whitespace-sensitive. The direct-publish path in app/events/route.ts
-- inserted whatever the submitter typed, unnormalised, while the
-- approve_pending_event RPC planned in docs/admin-moderation-plan.md
-- (Phase 3) matches existing venues on `lower(btrim(name))` before creating
-- a new one. The two paths disagreed about what counts as "the same venue",
-- so "The Local" and "the local " (or " The Local") could each get their
-- own row, fragmenting that venue's events across duplicates.
--
-- Judgement call: replace venues_name_key rather than add the normalised
-- index alongside it. Any two names that collide under lower(btrim(name))
-- also collide once case and surrounding whitespace are ignored -- so the
-- normalised index is strictly stronger than the plain one it replaces.
-- Nothing that satisfied the old constraint and would fail the new one was
-- ever actually a distinct venue; keeping both would just be two indexes
-- enforcing the same invariant, with the weaker one masking violations of
-- the one that actually matters. Checked for existing collisions before
-- writing this migration -- none found -- so the replacement applies
-- cleanly against current data.
alter table public.venues drop constraint if exists venues_name_key;

create unique index venues_name_normalized_key
  on public.venues (lower(btrim(name)));

comment on index venues_name_normalized_key is
  'Case- and whitespace-insensitive uniqueness on venue name, matching the lower(btrim(name)) lookup used by the planned approve_pending_event RPC (docs/admin-moderation-plan.md) so the direct-publish path in app/events/route.ts cannot create a venue that only differs from an existing one by case or surrounding whitespace.';

-- Small helper so app/events/route.ts (the direct-publish path, run only for
-- signed-in users) can reuse an existing venue by normalised name instead of
-- attempting a raw insert and racing the unique index. Exact match only --
-- deliberately not `ilike`, which would treat literal `%`/`_` in a venue
-- name as wildcards.
create or replace function public.find_venue_id_by_name(p_name text)
returns integer
language sql
stable
security invoker
as $$
  select id from public.venues
  where lower(btrim(name)) = lower(btrim(p_name))
  limit 1;
$$;

comment on function public.find_venue_id_by_name(text) is
  'Case- and whitespace-insensitive venue lookup by name, used by app/events/route.ts to reuse an existing venue instead of creating a near-duplicate. security invoker: caller''s RLS on venues (readable by everyone) still applies.';

revoke all on function public.find_venue_id_by_name(text) from public;
grant execute on function public.find_venue_id_by_name(text) to authenticated;
