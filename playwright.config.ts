import { defineConfig, devices } from '@playwright/test';

/**
 * Visual-regression harness (task #1 of the dependency-upgrade project).
 *
 * This suite captures baseline screenshots of the app BEFORE any dependency
 * upgrades so later tasks (Next 13->16, React 18->19, etc.) can diff against
 * something trustworthy. See tests/visual/README.md for the full story,
 * especially the "data problem" (the app needs seeded venues/events, and
 * seeding requires a service-role key or the Supabase MCP tools — neither of
 * which a CI runner has today).
 *
 * A dedicated port (3100) is used deliberately: 3000 is the app's normal dev
 * port and 3001 may be occupied by an orphaned session, so letting
 * Playwright's `webServer` own a private port avoids colliding with either.
 */

const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

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
  webServer: {
    // `next dev` rather than a production build: next-pwa's service worker is
    // disabled outside production (`disable: !isProd` in next.config.js), and
    // Next 13.4 has no persistent dev-mode overlay/indicator, so dev mode is
    // actually the more visually-stable option here — and much faster to
    // start than `next build && next start` for every run.
    command: `npx next dev -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
