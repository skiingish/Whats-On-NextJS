-- Fix-up for 20260727020000_add_updated_at.sql (D13): the trigger used
-- `now()`, which is fixed for the whole enclosing transaction (it is an
-- alias for `transaction_timestamp()`), not the moment each row is actually
-- written. Two updates to the same row inside one transaction -- exactly
-- what supabase/tests/rls_access_model.sql does, and plausible in any
-- request handler that does more than one write -- would get an identical
-- `updated_at`, silently defeating the point of the column (a race between
-- two admins editing the same row, D13's whole motivation, needs the actual
-- moment of write).
--
-- `clock_timestamp()` returns true wall-clock time at the point it's
-- evaluated, advancing on every call regardless of transaction boundaries,
-- so `updated_at` means what it says: when this row was last written.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := clock_timestamp();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Shared BEFORE UPDATE trigger: stamps updated_at with clock_timestamp() (true wall-clock time, unlike now()/transaction_timestamp()) on every row update. Attached to venues, events, events_pending, issues and feedback.';
