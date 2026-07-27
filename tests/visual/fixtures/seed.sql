-- Visual-regression fixture data.
--
-- Seeds 3 venues (real Melbourne coordinates, close enough together to all
-- land on screen at the map's default zoom) with one event each. Names are
-- prefixed "PWTEST " so cleanup.sql (and any human poking at the DB) can spot
-- and remove them unambiguously. Events cascade-delete with their venue
-- (events_venue_id_fkey is ON DELETE CASCADE), so cleanup only needs to
-- target venues.
--
-- Every event's "when" column lists all seven days, which utils/dataformatter.ts
-- collapses to "Everyday" for display. That's deliberate: EventsDisplay.tsx
-- defaults its day filter to *today's* weekday, so if a fixture event only
-- listed e.g. "Monday" it would silently vanish from the homepage list on
-- every other day of the week — turning "the app changed" and "a Tuesday
-- happened" into indistinguishable causes of a failed diff. Listing every day
-- keeps the fixture events visible regardless of which real-world day the
-- suite happens to run on.
--
-- Run via the Supabase MCP `execute_sql` tool (project ref
-- mdvurkoeokvxzgznyxut) or the SQL editor. See ../README.md for why this
-- can't run through the app's anon key, and what CI would need instead.
--
-- Events get explicit, distinct `created_at` values (a few seconds apart)
-- rather than the column default. EventsDisplay.tsx's secondary sort key is
-- `created_at` descending, and a single multi-row INSERT evaluates `now()`
-- once for the whole statement — so without this, all three events would
-- share one identical timestamp, and an unordered `select` (EventsSection.tsx
-- has no `.order()`) can return tied rows in a different physical order from
-- one request to the next. That surfaced for real: the first capture session
-- had the fixture events silently swap positions in the homepage list between
-- two consecutive (otherwise-unchanged) test runs.

insert into public.venues (name, address, latitude, longitude) values
  ('PWTEST CBD Test Bar', '250 Bourke St, Melbourne VIC 3000', -37.813600, 144.963100),
  ('PWTEST Fitzroy Test Bar', '297 Brunswick St, Fitzroy VIC 3065', -37.798600, 144.978700),
  ('PWTEST Southbank Test Cafe', '50 Southbank Blvd, Southbank VIC 3006', -37.822600, 144.964800);

insert into public.events ("desc", "when", special_price, event_time, venue_id, created_at)
select 'PWTEST Happy Hour Every Day', 'Monday Tuesday Wednesday Thursday Friday Saturday Sunday', '$5 beers', '4pm - 6pm', id, now() - interval '2 seconds'
  from public.venues where name = 'PWTEST CBD Test Bar'
union all
select 'PWTEST Live Jazz Nights', 'Monday Tuesday Wednesday Thursday Friday Saturday Sunday', '$10 cocktails', '8pm - late', id, now() - interval '1 second'
  from public.venues where name = 'PWTEST Fitzroy Test Bar'
union all
select 'PWTEST Riverside Brunch Special', 'Monday Tuesday Wednesday Thursday Friday Saturday Sunday', '$15 brunch set', '9am - 12pm', id, now()
  from public.venues where name = 'PWTEST Southbank Test Cafe';
