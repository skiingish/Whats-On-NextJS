-- Access-control tests for the What's On schema.
--
-- These assert the rule the whole app depends on: anonymous visitors may read
-- published content and submit things for review, and nothing else. Every
-- admin action requires a login, because every login is an admin
-- (see docs/admin-moderation-plan.md).
--
-- Everything runs inside one transaction that ends in ROLLBACK, so a run
-- leaves no rows behind. Still, point it at a non-production database.
--
--   psql "$DATABASE_URL" -f supabase/tests/rls_access_model.sql
--
-- Or paste it into the Supabase SQL editor. A pass prints one notice per rule
-- and ends with ALL ACCESS-CONTROL TESTS PASSED. A failure raises an
-- exception naming the rule that broke and rolls everything back.

begin;

-- Assert two values match, or abort naming the rule.
create or replace function pg_temp.assert_eq(
  label text, actual anyelement, expected anyelement
) returns void language plpgsql as $$
begin
  if actual is distinct from expected then
    raise exception 'FAIL: % — expected %, got %', label, expected, actual;
  end if;
  raise notice 'pass: %', label;
end $$;

-- Assert a statement is refused. `sql` runs in a nested block so the refusal
-- is caught without swallowing our own failure signal.
--
-- Recognises the refusal shapes this schema actually produces: RLS
-- (insufficient_privilege), a check constraint (check_violation), an
-- ON DELETE RESTRICT foreign key (foreign_key_violation, see D1 — venue
-- deletion no longer cascades), and a unique index (unique_violation, see
-- D21 — venue names are now unique case/whitespace-insensitively).
create or replace function pg_temp.assert_blocked(label text, sql text)
returns void language plpgsql as $$
declare
  blocked boolean := false;
begin
  begin
    execute sql;
  exception
    when insufficient_privilege
      or check_violation
      or foreign_key_violation
      or unique_violation
    then blocked := true;
  end;

  if not blocked then
    raise exception 'FAIL: % — the statement was allowed', label;
  end if;
  raise notice 'pass: %', label;
end $$;

-- ---------------------------------------------------------------------------
-- Baseline. The shared dev database this suite runs against keeps its own
-- fixture rows around between runs (the PWTEST venues/events the Playwright
-- baselines depend on — see docs/tech-debt-backlog.md). Total-row-count
-- assertions below compare against a baseline captured here rather than
-- assuming the tables start empty, so the suite passes whether it's pointed
-- at a pristine test database or this shared one.
-- ---------------------------------------------------------------------------
create temporary table pg_temp_test_baseline as
select
  (select count(*) from public.venues)::int as venues,
  (select count(*) from public.events)::int as events;

-- The sections below run as anon/authenticated (see `set local role`), and a
-- freshly created table is readable only by its owner by default.
grant select on pg_temp_test_baseline to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Fixtures, inserted as the owner so RLS does not interfere.
-- ---------------------------------------------------------------------------
insert into public.venues (id, name, latitude, longitude)
  overriding system value
  values (900001, 'RLS Test Tavern', -37.813000, 144.963100);

insert into public.events (id, "desc", "when", venue_id)
  overriding system value
  values (900001, 'RLS test special', 'Monday', 900001);

-- A venue with no events, so the RESTRICT tests below can also show the
-- fenced-in case: a venue nothing points at still deletes cleanly.
insert into public.venues (id, name)
  overriding system value
  values (900002, 'RLS Test Empty Venue');

insert into public.feedback (name, email, message)
  values ('Test Person', 'test@example.com', 'private message');

insert into public.issues (event_id, issue) values (900001, 'notvaild');

insert into public.events_pending ("desc", "when", venue_name)
  values ('RLS pending', 'Friday', 'Proposed Venue');

-- ===========================================================================
-- ANONYMOUS VISITOR
-- ===========================================================================
set local role anon;

-- Reads: published content only. Compared against the baseline plus what
-- this suite itself just inserted (one event, two venues), not an absolute
-- number — see the baseline note above.
select pg_temp.assert_eq('anon reads published events',
  (select count(*) from public.events)::int,
  (select events from pg_temp_test_baseline) + 1);

select pg_temp.assert_eq('anon reads venues',
  (select count(*) from public.venues)::int,
  (select venues from pg_temp_test_baseline) + 2);

select pg_temp.assert_eq('anon CANNOT read feedback (holds names and emails)',
  (select count(*) from public.feedback)::int, 0);

select pg_temp.assert_eq('anon CANNOT read the issues queue',
  (select count(*) from public.issues)::int, 0);

select pg_temp.assert_eq('anon CANNOT read the moderation queue',
  (select count(*) from public.events_pending)::int, 0);

-- Writes that must be allowed: the whole point of the public site.
insert into public.events_pending ("desc", "when", venue_name)
  values ('anon submission', 'Tuesday', 'Somewhere New');
do $$ begin raise notice 'pass: anon submits an event for review'; end $$;

insert into public.feedback (message) values ('anon feedback');
do $$ begin raise notice 'pass: anon submits feedback'; end $$;

insert into public.issues (event_id, issue) values (900001, 'notvaild');
do $$ begin raise notice 'pass: anon reports an issue'; end $$;

-- Writes that must be refused: these are admin actions.
select pg_temp.assert_blocked(
  'anon cannot publish straight to events',
  $sql$insert into public.events ("desc", "when") values ('anon publish', 'Monday')$sql$);

select pg_temp.assert_blocked(
  'anon cannot create a live venue',
  $sql$insert into public.venues (name) values ('Anon Venue')$sql$);

-- Deletes and updates affect zero rows rather than erroring, so assert
-- survival rather than expecting an exception.
delete from public.events;
select pg_temp.assert_eq('anon cannot delete published events',
  (select count(*) from public.events)::int,
  (select events from pg_temp_test_baseline) + 1);

delete from public.venues;
select pg_temp.assert_eq('anon cannot delete venues',
  (select count(*) from public.venues)::int,
  (select venues from pg_temp_test_baseline) + 2);

delete from public.events_pending;
select pg_temp.assert_eq('anon cannot clear the moderation queue',
  (select count(*) from public.events_pending)::int, 0);  -- invisible, so 0 either way

update public.events set "desc" = 'defaced' where id = 900001;
select pg_temp.assert_eq('anon cannot edit a published event',
  (select "desc" from public.events where id = 900001), 'RLS test special');

-- A submission has to identify a venue somehow, or the queue fills with rows
-- an admin cannot action.
select pg_temp.assert_blocked(
  'submission naming no venue at all is rejected',
  $sql$insert into public.events_pending ("desc", "when") values ('no venue', 'Monday')$sql$);

select pg_temp.assert_blocked(
  'submission with a whitespace-only venue name is rejected',
  $sql$insert into public.events_pending ("desc", "when", venue_name)
       values ('blank', 'Monday', '   ')$sql$);

-- ===========================================================================
-- ADMIN (any authenticated user)
-- ===========================================================================
reset role;
set local role authenticated;

select pg_temp.assert_eq('admin reads the moderation queue',
  (select count(*) from public.events_pending)::int > 0, true);

select pg_temp.assert_eq('admin reads feedback',
  (select count(*) from public.feedback)::int > 0, true);

select pg_temp.assert_eq('admin reads the issues queue',
  (select count(*) from public.issues)::int > 0, true);

insert into public.venues (name) values ('Admin Created Venue');
do $$ begin raise notice 'pass: admin creates a venue'; end $$;

insert into public.events ("desc", "when", venue_id)
  values ('admin published', 'Monday', 900001);
do $$ begin raise notice 'pass: admin publishes an event'; end $$;

update public.events set "desc" = 'admin edited' where id = 900001;
select pg_temp.assert_eq('admin edits a published event',
  (select "desc" from public.events where id = 900001), 'admin edited');

-- D13: updated_at is stamped by the shared trigger, not trusted to the
-- caller, so it advances on every update regardless of what changed.
do $$
declare
  before_ts timestamptz;
  after_ts  timestamptz;
begin
  select updated_at into before_ts from public.events where id = 900001;
  perform pg_sleep(0.01);
  update public.events set "desc" = 'admin edited again' where id = 900001;
  select updated_at into after_ts from public.events where id = 900001;

  if after_ts <= before_ts then
    raise exception
      'FAIL: updated_at did not advance on update (before=%, after=%)',
      before_ts, after_ts;
  end if;
  raise notice 'pass: updated_at advances on update (events)';
end $$;

-- D1: a venue that still has events cannot be deleted (ON DELETE RESTRICT
-- replaced ON DELETE CASCADE) — even though the delete policy on venues is
-- `using (true)` and would otherwise allow it outright.
select pg_temp.assert_blocked(
  'admin cannot delete a venue with live events (ON DELETE RESTRICT)',
  $sql$delete from public.venues where id = 900001$sql$);

select pg_temp.assert_eq('venue with live events survives the blocked delete',
  (select count(*) from public.venues where id = 900001)::int, 1);

select pg_temp.assert_eq('the event at that venue survives too',
  (select count(*) from public.events where id = 900001)::int, 1);

-- RESTRICT only fences in venues with something still pointing at them —
-- a venue with no events deletes exactly as before.
delete from public.venues where id = 900002;
select pg_temp.assert_eq('admin deletes a venue with no events',
  (select count(*) from public.venues where id = 900002)::int, 0);

delete from public.events_pending;
select pg_temp.assert_eq('admin clears the moderation queue',
  (select count(*) from public.events_pending)::int, 0);

reset role;

do $$ begin raise notice 'ALL ACCESS-CONTROL TESTS PASSED'; end $$;

rollback;
