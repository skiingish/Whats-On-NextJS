import { defineConfig, devices } from '@playwright/test';

/**
 * Visual-regression harness.
 *
 * Captures baseline screenshots so dependency upgrades and refactors can be
 * diffed against something trustworthy. See tests/visual/README.md.
 *
 * Two servers are started per run, in order: a fixture server standing in for
 * Supabase, then a dev server pointed at it. That combination is what makes
 * these baselines stable — the suite renders committed fixture rows, never the
 * shared database, so adding a venue in production cannot change a screenshot.
 * It also means the suite needs no database credentials at all.
 *
 * A dedicated port (3100) is used deliberately: 3000 is the app's normal dev
 * port and 3001 may be occupied by an orphaned session, so letting
 * Playwright's `webServer` own a private port avoids colliding with either.
 */

const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

// Not 54321 — that is the real local Supabase stack's port, and colliding
// with it would make "did I test against fixtures or against my local
// database?" ambiguous.
const MOCK_SUPABASE_PORT = 54331;

export default defineConfig({
  testDir: './tests/visual',
  snapshotPathTemplate:
    '{testDir}/{testFileDir}/__screenshots__/{projectName}/{arg}-{platform}{ext}',
  fullyParallel: false,
  // One worker: the light/dark projects share one seeded fixture data set in
  // one dev server, and the dev server compiles routes on first request —
  // running everything serially avoids compile-race flakiness for basically
  // free, since this suite is small.
  workers: 1,
  retries: 0,
  reporter: [['list']],
  timeout: 60_000,
  expect: {
    timeout: 15_000,
    toHaveScreenshot: {
      // Mapbox tiles are masked out (see tests/visual/screens.spec.ts), so no
      // pixel-ratio tolerance should be needed for the rest of the page —
      // keep the default of 0 and let a flaky run surface as a real failure
      // rather than papering over it with a threshold.
      animations: 'disabled',
    },
  },
  use: {
    baseURL,
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
  projects: [
    {
      name: 'light',
      use: {
        ...devices['Desktop Chrome'],
        colorScheme: 'light',
        viewport: { width: 1280, height: 900 },
        deviceScaleFactor: 1,
      },
    },
    {
      name: 'dark',
      use: {
        ...devices['Desktop Chrome'],
        colorScheme: 'dark',
        viewport: { width: 1280, height: 900 },
        deviceScaleFactor: 1,
      },
    },
  ],
  webServer: [
    {
      // Serves the committed fixture dataset in place of Supabase. Started
      // first so the dev server's very first render already has it. See
      // tests/visual/fixtures/mock-supabase.mjs for why this is a real HTTP
      // server rather than Playwright request interception.
      command: `node tests/visual/fixtures/mock-supabase.mjs`,
      url: `http://127.0.0.1:${MOCK_SUPABASE_PORT}/rest/v1/venues`,
      // Never reuse: a stale fixture server from an earlier run could be
      // serving a different dataset, which would be a baffling diff.
      reuseExistingServer: false,
      timeout: 30_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      // `next dev` rather than a production build: dev mode has no persistent
      // overlay/indicator to interfere, and is much faster to start than
      // `next build && next start` for every run.
      command: `npx next dev -p ${PORT}`,
      url: baseURL,
      // Also never reuse. A dev server left over from `npm run dev` is
      // pointed at the real Supabase project, so reusing it would silently
      // screenshot production data and overwrite the baselines with it.
      reuseExistingServer: false,
      timeout: 120_000,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        // Redirects every Supabase query — server-side and browser-side — at
        // the fixture server above. `@next/env` does not overwrite variables
        // already present in process.env, so these win over .env.local.
        NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${MOCK_SUPABASE_PORT}`,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'fixture-anon-key',
      },
    },
  ],
});
