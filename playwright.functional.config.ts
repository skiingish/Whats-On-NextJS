import { defineConfig, devices } from '@playwright/test';

/**
 * Functional (non-visual) Playwright suite — backlog D14.
 *
 * tests/visual/screens.spec.ts asserts visibility then screenshots; it never
 * submits a form or posts anything, so it only ever catches CSS/layout
 * drift. This config runs a separate suite (tests/functional/) that actually
 * drives the anonymous-user flows end to end: submitting an event, feedback,
 * an issue report, a failed login, and the venue-naming RLS rule. Kept as a
 * separate config/spec directory from the visual suite on purpose, so a
 * functional regression is never confused with a rendering diff.
 *
 * Only anonymous paths are covered. There is no way to test authenticated
 * paths yet — auth.users is empty, and creating the first admin is tracked
 * separately (backlog D2).
 *
 * Uses its own port (3101), one above the visual suite's 3100, so the two
 * suites — or another agent's dev server on 3000 — can all run at once
 * without colliding.
 */

const PORT = 3101;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests/functional',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL,
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `npx next dev -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
