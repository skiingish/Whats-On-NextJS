-- D13 (docs/tech-debt-backlog.md): every table has created_at but nothing
-- tracks when a row was last changed.
--
-- Phase 5 of docs/admin-moderation-plan.md adds inline editing of venues,
-- events, issues and feedback under `using (true) with check (true))`
-- policies with no version check -- two admins editing the same row race
-- silently, last write wins, invisibly. `updated_at`, stamped by a trigger
-- rather than trusted to whatever app code happens to write the row, is the
-- minimum a future optimistic-concurrency check (or even just an honest
-- "last edited 3 minutes ago" in the UI) needs to exist.
--
-- One shared trigger function, reused by all five tables, so the behaviour
-- can't drift table to table.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Shared BEFORE UPDATE trigger: stamps updated_at with the current time on every row update. Attached to venues, events, events_pending, issues and feedback.';

alter table public.venues         add column if not exists updated_at timestamptz not null default now();
alter table public.events         add column if not exists updated_at timestamptz not null default now();
alter table public.events_pending add column if not exists updated_at timestamptz not null default now();
alter table public.issues         add column if not exists updated_at timestamptz not null default now();
alter table public.feedback       add column if not exists updated_at timestamptz not null default now();

drop trigger if exists set_updated_at on public.venues;
create trigger set_updated_at
  before update on public.venues
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.events;
create trigger set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.events_pending;
create trigger set_updated_at
  before update on public.events_pending
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.issues;
create trigger set_updated_at
  before update on public.issues
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.feedback;
create trigger set_updated_at
  before update on public.feedback
  for each row execute function public.set_updated_at();
