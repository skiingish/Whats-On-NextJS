/**
 * A minimal stand-in for Supabase, so the visual-regression suite renders
 * against fixture data committed to this repo instead of the shared database.
 *
 * ## Why a fake server rather than request interception
 *
 * The pages under test (`app/page.tsx`, `app/map/page.tsx`) are Server
 * Components. They query Supabase from Node during the render, not from the
 * browser — so Playwright's `page.route` cannot see those requests, and
 * browser-level mocking cannot work here.
 *
 * What *is* interceptable is the URL the app dials. `lib/supabase/server.ts`
 * reads `NEXT_PUBLIC_SUPABASE_URL` at runtime, so pointing that env var at
 * this server (see `playwright.config.ts`) redirects every query here without
 * a single change to application code. The real `@supabase/ssr` client, the
 * real PostgREST wire format and the real rendering path are all still
 * exercised; only the data source is swapped.
 *
 * ## Why not a local Supabase stack
 *
 * `supabase start` would be higher fidelity — real Postgres, real RLS, real
 * migrations. It is also a Docker dependency, tens of seconds of startup per
 * run, and one more thing to install before anyone can run the suite. For
 * screenshot diffing, none of that fidelity affects the pixels: the app just
 * needs deterministic rows back. That option is still documented in
 * tests/visual/README.md for when RLS behaviour itself needs testing.
 *
 * ## Scope
 *
 * Deliberately not a PostgREST implementation. It answers the three requests
 * this app actually makes and returns pre-shaped, pre-sorted JSON for them:
 * filters, ordering and `select=` projections in the query string are ignored.
 * If a query changes shape, the suite fails loudly on a visibly wrong render
 * rather than silently passing — which is the behaviour we want.
 */

import { createServer } from 'node:http';
import { eventsWithVenue, venuesWithEvents } from './dataset.mjs';

const PORT = Number(process.env.MOCK_SUPABASE_PORT ?? 54331);

/**
 * The browser-side client (VenueComboBox) calls this origin cross-origin from
 * the dev server, so preflights have to succeed or those requests fail and the
 * page renders in an error state.
 */
const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  'access-control-expose-headers': 'content-range',
};

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
    ...CORS,
  });
  res.end(payload);
}

const server = createServer((req, res) => {
  const { pathname } = new URL(req.url, `http://127.0.0.1:${PORT}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  // Anonymous visitor. `proxy.ts` calls getUser() on every navigation, and
  // every screen in this suite is captured logged out, so this is always the
  // right answer. A 401 with this body is what supabase-js expects in order to
  // resolve `{ data: { user: null } }` rather than throw.
  if (pathname === '/auth/v1/user') {
    return sendJson(res, 401, {
      message: 'Invalid Refresh Token: Refresh Token Not Found',
    });
  }

  if (pathname.startsWith('/auth/v1/')) {
    return sendJson(res, 400, { error: 'not_supported_by_fixture_server' });
  }

  if (pathname === '/rest/v1/events') {
    return sendJson(res, 200, eventsWithVenue());
  }

  if (pathname === '/rest/v1/venues') {
    return sendJson(res, 200, venuesWithEvents());
  }

  // Writes (event submissions, feedback, issues) are not exercised by the
  // screenshot suite — accept and discard rather than 404, so an accidental
  // write doesn't surface as a render error mid-capture.
  if (req.method !== 'GET' && pathname.startsWith('/rest/v1/')) {
    return sendJson(res, 201, []);
  }

  return sendJson(res, 200, []);
});

server.listen(PORT, '127.0.0.1', () => {
  // playwright.config.ts waits on this port before starting the dev server.
  console.log(`[mock-supabase] listening on http://127.0.0.1:${PORT}`);
});
