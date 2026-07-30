-- D1 (docs/tech-debt-backlog.md): venue deletion must not cascade-delete
-- live events.
--
-- events_venue_id_fkey and events_pending_venue_id_fkey were both
-- ON DELETE CASCADE, and "authenticated users can delete venues" is
-- `using (true)` with no confirmation step above it. Removing a duplicate or
-- mistaken venue therefore hard-deleted every published event (and every
-- queued submission) at that venue, with no soft delete and no recovery.
--
-- Switched to ON DELETE RESTRICT: deleting a venue that still has events now
-- fails with a foreign_key_violation instead of silently destroying them. An
-- admin has to reassign or remove those events first.
--
-- Judgement call: RESTRICT alone vs. a `deleted_at` soft-delete column.
-- Soft delete is the fuller answer -- it would let an admin hide a venue
-- from the public map without touching the history of events that were
-- once there, and it gives a recovery path a hard RESTRICT error does not.
-- But it has real knock-on effects that don't belong in this migration:
-- every read of `venues` (the public map, the venue combobox on the submit
-- form, any future admin list) would need a `deleted_at is null` filter
-- added, and the "readable by everyone" / update / delete RLS policies on
-- `venues` would all need to account for the new state. Nothing in the app
-- exposes venue deletion yet -- the venue management screen in Phase 4 of
-- docs/admin-moderation-plan.md is unbuilt -- so there is no UI in front of
-- this today and no read path anywhere depends on "deleted but still
-- present" venues existing. RESTRICT is the cheap, immediately-correct fix
-- that stops the data loss now; soft delete is better left to whoever
-- builds that screen, where "hide without losing history" becomes a real,
-- scoped product requirement instead of a speculative one bolted onto a
-- migration that isn't touching any of those read paths.
--
-- issues_event_id_fkey is deliberately left ON DELETE CASCADE: deleting an
-- event should remove its issue reports (docs/admin-moderation-plan.md,
-- Phase 5 says so explicitly).

alter table public.events
  drop constraint events_venue_id_fkey,
  add constraint events_venue_id_fkey
    foreign key (venue_id) references public.venues (id)
    on update cascade on delete restrict;

alter table public.events_pending
  drop constraint events_pending_venue_id_fkey,
  add constraint events_pending_venue_id_fkey
    foreign key (venue_id) references public.venues (id)
    on update cascade on delete restrict;
