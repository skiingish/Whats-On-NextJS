import { createClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it } from 'vitest';
import { server } from './server';
import { scenarios } from './handlers';

/**
 * Contract tests for the Supabase queries the app's pages actually issue.
 *
 * `components/EventsSection.tsx` and `app/map/page.tsx` build their queries
 * inline, so nothing previously verified them — the only thing exercising
 * those code paths was rendering the whole app against a live database, where
 * a subtly wrong filter shows up as "some rows are missing" rather than a
 * failure. These assert two things per query:
 *
 *  1. the request that goes over the wire (filters and ordering are encoded in
 *     the URL, so this catches a `.not()` or `.order()` being dropped), and
 *  2. the shape supabase-js hands back, including nested relations.
 *
 * Plus the failure and empty cases, which are unreachable from the visual
 * suite and are exactly what MSW is here for.
 */

const SUPABASE_URL = 'https://fixture.supabase.co';
const ANON_KEY = 'fixture-anon-key';

function client() {
  return createClient(SUPABASE_URL, ANON_KEY);
}

/** Captures the outgoing request URL so query construction can be asserted. */
function captureRequests() {
  const urls: string[] = [];
  const listener = ({ request }: { request: Request }) => {
    urls.push(decodeURIComponent(request.url));
  };
  server.events.on('request:start', listener);
  return {
    urls,
    stop: () => server.events.removeListener('request:start', listener),
  };
}

let captured: ReturnType<typeof captureRequests>;

beforeEach(() => {
  captured = captureRequests();
  return () => captured.stop();
});

describe('events query (components/EventsSection.tsx)', () => {
  it('requests events with their venue, newest first, id as tiebreaker', async () => {
    const { data, error } = await client()
      .from('events')
      .select('*, venue:venues (*)')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false });

    expect(error).toBeNull();

    // supabase-js strips whitespace out of the select expression before
    // sending it, so compare against a whitespace-free form rather than the
    // prettified string the component passes in.
    const url = captured.urls
      .find((u) => u.includes('/rest/v1/events'))!
      .replace(/\s/g, '');
    expect(url).toContain('select=*,venue:venues(*)');
    // Both orders must survive. The id tiebreaker exists because rows sharing
    // a created_at otherwise come back in arbitrary order — a real flake the
    // visual suite caught once already.
    expect(url).toContain('order=created_at.desc,id.desc');

    expect(data).toBeTruthy();
    expect(data!.length).toBeGreaterThan(0);
    // The UI reads `event.venue.name`, so the relation must be an object.
    expect(data![0]).toHaveProperty('venue.name');
    expect(typeof data![0].venue.name).toBe('string');
  });

  it('returns rows already ordered newest-first', async () => {
    const { data } = await client()
      .from('events')
      .select('*, venue:venues (*)')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false });

    const timestamps = data!.map((row) => row.created_at);
    const sorted = [...timestamps].sort().reverse();
    expect(timestamps).toEqual(sorted);
  });

  it('surfaces an error rather than throwing when the table fails', async () => {
    server.use(scenarios.failure('events'));

    const { data, error } = await client().from('events').select('*');

    expect(data).toBeNull();
    expect(error).not.toBeNull();
    // EventsSection does `if (!events) return null`, so a failure must produce
    // null data rather than an exception escaping the server component.
    expect(error!.message).toBeTruthy();
  });

  it('returns an empty array, not null, when there are no events', async () => {
    server.use(scenarios.empty('events'));

    const { data, error } = await client().from('events').select('*');

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });
});

describe('venues query (app/map/page.tsx)', () => {
  it('excludes venues without coordinates and sorts by name', async () => {
    const { data, error } = await client()
      .from('venues')
      .select('*, events(*)')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .order('name');

    expect(error).toBeNull();

    const url = captured.urls.find((u) => u.includes('/rest/v1/venues'))!;
    // Both null-guards must be present: a venue missing either coordinate
    // cannot be placed on the map, and VenueMap's bounds fitting would be
    // dragged across the planet by a NaN.
    expect(url).toContain('latitude=not.is.null');
    expect(url).toContain('longitude=not.is.null');
    expect(url).toContain('order=name.asc');
    expect(url).toContain('select=*,events(*)');

    expect(data!.length).toBeGreaterThan(0);
  });

  it('nests each venue’s events as an array', async () => {
    const { data } = await client().from('venues').select('*, events(*)');

    for (const venue of data!) {
      expect(Array.isArray(venue.events)).toBe(true);
    }
    // At least one venue must carry events, or the map drawer has nothing to
    // show and the fixture would be silently useless.
    expect(data!.some((venue) => venue.events.length > 0)).toBe(true);
  });

  it('every returned venue has usable coordinates', async () => {
    const { data } = await client()
      .from('venues')
      .select('*, events(*)')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    for (const venue of data!) {
      expect(Number.isFinite(parseFloat(venue.latitude))).toBe(true);
      expect(Number.isFinite(parseFloat(venue.longitude))).toBe(true);
    }
  });

  // Generous timeout: supabase-js retries a connection-level failure before
  // giving up, so this legitimately takes longer than an HTTP error response.
  it('surfaces a network failure as an error', { timeout: 20_000 }, async () => {
    server.use(scenarios.networkError('venues'));

    const { data, error } = await client().from('venues').select('*');

    expect(data).toBeNull();
    expect(error).not.toBeNull();
  });
});
