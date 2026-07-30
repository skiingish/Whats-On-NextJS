-- Add an optional per-special source link.
--
-- `venues.website` already records the venue's front door, but that is not the
-- same thing: a special usually lives on a specific page (a /whats-on, a menus
-- page), and some venues have no website at all while still having a usable
-- link (a Facebook post, an aggregator listing). So this is nullable and lives
-- on the event, not the venue.
--
-- Added to events_pending as well so a visitor submission can carry the link
-- it came from, and so promoting a pending row to a live event stays a
-- straight column-for-column copy.

alter table public.events         add column if not exists link text;
alter table public.events_pending add column if not exists link text;

comment on column public.events.link is
  'Optional URL the special was sourced from — usually the venue page it is published on. Null when there is no usable link.';
comment on column public.events_pending.link is
  'Optional URL the submitter sourced the special from.';
