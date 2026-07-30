-- Removes the visual-regression fixture data seeded by seed.sql.
-- Events cascade-delete with their venue (ON DELETE CASCADE), so this one
-- statement is sufficient. Run this after every capture session — the
-- database should be empty (0 venues, 0 events) when the suite isn't
-- actively running against it.

delete from public.venues where name like 'PWTEST %';
