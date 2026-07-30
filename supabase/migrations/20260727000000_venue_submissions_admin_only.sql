-- Venue creation becomes an admin-only action.
--
-- Previously anonymous visitors could insert straight into `venues`, so a
-- typo or a spam entry went live and world-readable with no review. Visitors
-- now name an unknown venue as free text on their pending submission instead,
-- and an admin creates the real venue row when approving it.

alter table public.events_pending
  add column if not exists venue_name text;

comment on column public.events_pending.venue_name is
  'Free-text venue name for a venue that does not exist yet. An admin creates the venues row on approval. Mutually exclusive with venue_id in practice.';

-- A pending submission is useless without some way to identify the venue.
alter table public.events_pending
  drop constraint if exists events_pending_venue_present;

alter table public.events_pending
  add constraint events_pending_venue_present
  check (venue_id is not null or nullif(btrim(venue_name), '') is not null);

-- Anonymous visitors may no longer create venues directly.
drop policy if exists "anyone can add a venue" on public.venues;

create policy "authenticated users can add venues"
  on public.venues for insert
  to authenticated
  with check (true);
