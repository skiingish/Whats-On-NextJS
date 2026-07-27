#!/usr/bin/env node
/**
 * Seeds or cleans up the visual-regression fixture data using a Supabase
 * service-role key instead of the Supabase MCP tools.
 *
 * Why this exists: RLS blocks anonymous inserts into `venues` (see
 * tests/visual/README.md), so `npm run test:visual` cannot seed its own data
 * through the app's anon key, and MCP tools (used interactively to seed/clean
 * up for this baseline capture) are not available to a CI runner. A CI
 * pipeline that wants to run this suite needs a SUPABASE_SERVICE_ROLE_KEY
 * secret and would run this script before/after `playwright test`, e.g.:
 *
 *   SUPABASE_SERVICE_ROLE_KEY=... node tests/visual/fixtures/seed-with-service-role.mjs seed
 *   npm run test:visual
 *   SUPABASE_SERVICE_ROLE_KEY=... node tests/visual/fixtures/seed-with-service-role.mjs cleanup
 *
 * No such key exists in this repo or its .env.local — it is intentionally
 * not invented, committed, or wired into any npm script. This file is
 * reference/documentation made runnable, not part of the currently-working
 * pipeline.
 */

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const action = process.argv[2];

if (!url || !serviceRoleKey) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY env vars.'
  );
  process.exit(1);
}

if (action !== 'seed' && action !== 'cleanup') {
  console.error('Usage: node seed-with-service-role.mjs <seed|cleanup>');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false },
});

// Mirrors tests/visual/fixtures/seed.sql — see that file for why every event
// lists all seven days in "when" (keeps fixture events visible on the
// homepage regardless of what day the suite runs) and why each event gets an
// explicit, distinct `created_at` a few seconds apart (EventsDisplay.tsx
// sorts by `created_at` descending as a tiebreaker; identical timestamps plus
// an unordered `select` let the homepage list's order flip between runs).
const now = Date.now();
const FIXTURE_VENUES = [
  {
    name: 'PWTEST CBD Test Bar',
    address: '250 Bourke St, Melbourne VIC 3000',
    latitude: -37.8136,
    longitude: 144.9631,
    event: {
      desc: 'PWTEST Happy Hour Every Day',
      when: 'Monday Tuesday Wednesday Thursday Friday Saturday Sunday',
      special_price: '$5 beers',
      event_time: '4pm - 6pm',
      created_at: new Date(now - 2000).toISOString(),
    },
  },
  {
    name: 'PWTEST Fitzroy Test Bar',
    address: '297 Brunswick St, Fitzroy VIC 3065',
    latitude: -37.7986,
    longitude: 144.9787,
    event: {
      desc: 'PWTEST Live Jazz Nights',
      when: 'Monday Tuesday Wednesday Thursday Friday Saturday Sunday',
      special_price: '$10 cocktails',
      event_time: '8pm - late',
      created_at: new Date(now - 1000).toISOString(),
    },
  },
  {
    name: 'PWTEST Southbank Test Cafe',
    address: '50 Southbank Blvd, Southbank VIC 3006',
    latitude: -37.8226,
    longitude: 144.9648,
    event: {
      desc: 'PWTEST Riverside Brunch Special',
      when: 'Monday Tuesday Wednesday Thursday Friday Saturday Sunday',
      special_price: '$15 brunch set',
      event_time: '9am - 12pm',
      created_at: new Date(now).toISOString(),
    },
  },
];

async function cleanup() {
  const { error, count } = await supabase
    .from('venues')
    .delete({ count: 'exact' })
    .like('name', 'PWTEST %');
  if (error) throw error;
  console.log(`Deleted ${count ?? 0} PWTEST venue(s) (events cascaded).`);
}

async function seed() {
  await cleanup(); // defensive: venues.name is unique, so a stale run would conflict.

  for (const { event, ...venue } of FIXTURE_VENUES) {
    const { data: insertedVenue, error: venueError } = await supabase
      .from('venues')
      .insert(venue)
      .select('id')
      .single();
    if (venueError) throw venueError;

    const { error: eventError } = await supabase
      .from('events')
      .insert({ ...event, venue_id: insertedVenue.id });
    if (eventError) throw eventError;
  }

  console.log(`Seeded ${FIXTURE_VENUES.length} PWTEST venue(s) with events.`);
}

try {
  if (action === 'seed') await seed();
  else await cleanup();
} catch (err) {
  console.error(err);
  process.exit(1);
}
