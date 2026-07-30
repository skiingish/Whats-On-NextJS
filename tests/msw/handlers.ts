import { http, HttpResponse } from 'msw';
import {
  eventsWithVenue,
  venuesWithEvents,
} from '../visual/fixtures/dataset.mjs';

/**
 * MSW handlers standing in for Supabase's PostgREST API.
 *
 * These deliberately reuse `tests/visual/fixtures/dataset.mjs` rather than
 * defining their own rows. The visual suite renders that dataset and these
 * tests assert the queries that produce it, so a single definition keeps the
 * two from drifting into disagreeing about what "the fixture data" is.
 *
 * Why MSW here but a standalone HTTP server for the visual suite: MSW
 * intercepts in-process. That is exactly what unit tests want — `server.use()`
 * can swap in an error or an empty result per test — but it is unavailable to
 * the visual suite, where the app runs in a separate `next dev` process that
 * the test has no handle on. Different constraints, different tool. See
 * tests/visual/README.md.
 */

/** Matches any Supabase host, so tests need not care what URL the client used. */
const REST = '*/rest/v1';

export const handlers = [
  http.get(`${REST}/events`, () => HttpResponse.json(eventsWithVenue())),
  http.get(`${REST}/venues`, () => HttpResponse.json(venuesWithEvents())),

  // Anonymous. Mirrors the fixture server: supabase-js resolves
  // `{ data: { user: null } }` from a 401 rather than throwing.
  http.get('*/auth/v1/user', () =>
    HttpResponse.json(
      { message: 'Invalid Refresh Token: Refresh Token Not Found' },
      { status: 401 }
    )
  ),
];

/**
 * Convenience factories for the failure and edge-case responses that are the
 * whole reason to reach for MSW — none of these are reachable in the visual
 * suite, which can only ever render one fixed dataset.
 */
export const scenarios = {
  /** Table returns no rows. Exercises empty states. */
  empty: (table: 'events' | 'venues') =>
    http.get(`${REST}/${table}`, () => HttpResponse.json([])),

  /** Postgres/PostgREST error, in the shape supabase-js parses into `error`. */
  failure: (table: 'events' | 'venues', status = 500) =>
    http.get(`${REST}/${table}`, () =>
      HttpResponse.json(
        {
          message: 'simulated failure',
          details: null,
          hint: null,
          code: 'PGRST000',
        },
        { status }
      )
    ),

  /** Connection-level failure, as distinct from an HTTP error response. */
  networkError: (table: 'events' | 'venues') =>
    http.get(`${REST}/${table}`, () => HttpResponse.error()),
};
