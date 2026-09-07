import { test, expect } from '@playwright/test';

/**
 * Functional (non-visual) coverage for the anonymous-user paths — backlog
 * D14. tests/visual/screens.spec.ts asserts visibility then screenshots; it
 * never submits a form or posts anything, so "we have Playwright" was
 * standing in for functional coverage it didn't actually provide. These
 * tests actually drive the forms and check what happened.
 *
 * Deliberately a separate spec file (and a separate Playwright config,
 * playwright.functional.config.ts, on its own port) from the visual suite,
 * so a functional failure here is never confused with a rendering diff
 * there.
 *
 * Everything here is anonymous. There is no authenticated coverage:
 * `auth.users` is empty in this project, and creating the first admin is a
 * separate outstanding task (backlog D2) — these tests do not attempt to
 * create an account or sign in successfully.
 *
 * Every row these tests write (events_pending, feedback, issues) is tagged
 * with a `PWFUNC ` prefix and a per-run unique suffix, and is deleted
 * afterwards via the Supabase MCP tools (anon has insert-only access to all
 * three tables, so cleanup can't happen from inside the browser session
 * these tests drive). Nothing here touches the `PWTEST `-prefixed venues or
 * events the visual suite's baselines depend on.
 */

const unique = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

test.describe('add event modal (anonymous)', () => {
  test('submitting an event queues it for review instead of publishing it live', async ({
    page,
  }) => {
    const tag = unique();
    const venueName = `PWFUNC Venue ${tag}`;
    const desc = `PWFUNC Test Event ${tag}`;

    await page.goto('/');
    await page.getByRole('button', { name: 'Something Missing?' }).click();
    await expect(
      page.getByRole('heading', { name: 'Add New Event For Review' })
    ).toBeVisible();

    const dialog = page.getByRole('dialog');

    // The venue combobox trigger lives inside the dialog, but its popover
    // content (Radix Portal) renders into document.body, so only the
    // trigger itself needs scoping to avoid the native day-of-week <select>
    // elsewhere on the page, which Chromium also exposes with role
    // "combobox".
    await dialog.getByRole('combobox').click();
    await page.getByPlaceholder('Search venues...').fill(venueName);
    await page.getByText(`Suggest New Venue: ${venueName}`).click();

    // Matched loosely: the label carries a required marker ("What *"), and the
    // redesign may retune that copy again. The `name` attribute is the real
    // contract with the route handler and is asserted by the submission itself.
    await page.locator('#desc').fill(desc);
    await page.locator('#event_time').fill('9pm - late');
    // Days are toggle buttons carrying aria-pressed as of the 2026 redesign,
    // not the previous sr-only checkboxes. Selecting one renders a hidden
    // input named `days`, so what reaches the route handler is unchanged.
    const monday = page.getByRole('button', { name: 'Monday', exact: true });
    await monday.click();
    await expect(monday).toHaveAttribute('aria-pressed', 'true');

    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByText('Event submitted for approval!')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Add New Event For Review' })
    ).toBeHidden();

    // `events` (what the homepage renders) has no anonymous insert policy —
    // only events_pending does. Reload and confirm the description never
    // shows up as a live event.
    await page.goto('/');
    await expect(page.getByText(desc)).not.toBeVisible();
  });
});

test.describe('venue creation is admin-only (RLS)', () => {
  test('naming a venue that does not exist sends venue_name, not a live venue', async ({
    page,
  }) => {
    const venueName = `PWFUNC Venue ${unique()}`;

    await page.goto('/');
    await page.getByRole('button', { name: 'Something Missing?' }).click();
    await expect(
      page.getByRole('heading', { name: 'Add New Event For Review' })
    ).toBeVisible();

    await page.getByRole('dialog').getByRole('combobox').click();
    await page.getByPlaceholder('Search venues...').fill(venueName);
    await page.getByText(`Suggest New Venue: ${venueName}`).click();

    // components/ui/VenueComboBox.tsx: anonymous visitors (canCreateVenue is
    // false) take the deferred-name branch and never call
    // supabase.from('venues').insert(...) — RLS would reject it anyway
    // (`authenticated users can add venues`). This toast is that branch,
    // not the "Venue added successfully!" one the logged-in branch shows.
    await expect(
      page.getByText(
        `"${venueName}" will be added once your event is approved`
      )
    ).toBeVisible();

    // Close without submitting — this test only needs to show no venue was
    // created; the full submission path is covered separately.
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Reload for a fresh VenueComboBox mount (it fetches the venue list once
    // on mount) and confirm the name never became a real, selectable venue.
    await page.goto('/');
    await page.getByRole('button', { name: 'Something Missing?' }).click();
    await page.getByRole('dialog').getByRole('combobox').click();
    await page.getByPlaceholder('Search venues...').fill(venueName);
    await expect(page.getByText('No venues found.')).toBeVisible();
  });
});

test.describe('feedback', () => {
  test('submitting feedback succeeds', async ({ page }) => {
    const tag = `PWFUNC feedback ${unique()}`;

    await page.goto('/');
    await page.getByRole('button', { name: 'Give Feedback' }).click();
    await expect(
      page.getByRole('heading', { name: 'Hi There', exact: false })
    ).toBeVisible();

    await page.locator('#message').fill(tag);
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByText('Thanks for your feedback!')).toBeVisible();
  });
});

test.describe('report an issue', () => {
  test('reporting an issue on an event succeeds', async ({ page }) => {
    const tag = `PWFUNC issue ${unique()}`;

    await page.goto('/');

    // EventsCards.tsx's Report button has no accessible name — the
    // "Report" tooltip text next to it is hidden with Tailwind's
    // `invisible` (visibility: hidden), which removes it from the
    // accessibility tree, unlike the sr-only technique used elsewhere in
    // this app. Locate it by its lucide-react icon class instead: that
    // class comes from the icon library itself, not the app's own styling
    // (which is mid-migration to Tailwind 4 elsewhere in this repo), so it
    // is stable regardless of markup/class changes there.
    const reportButton = page
      .locator('button:has(svg.lucide-circle-alert)')
      .first();
    await expect(reportButton).toBeVisible();
    await reportButton.click();

    await expect(
      page.getByRole('heading', { name: /^Report Event/ })
    ).toBeVisible();

    await page
      .locator('#issueselector')
      .selectOption({ label: 'Incorrect Info' });
    await page.locator('#missinginfotext').fill(tag);
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByText('Thanks for your feedback!')).toBeVisible();
  });
});

test.describe('login', () => {
  test('bad credentials show the error message rather than crashing', async ({
    page,
  }) => {
    await page.goto('/login');

    await page
      .getByLabel('Email', { exact: true })
      .fill('pwfunc-nonexistent@example.com');
    await page
      .getByLabel('Password', { exact: true })
      .fill('definitely-wrong-password');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // auth.users is empty in this project (backlog D2), so any credentials
    // fail — this exercises app/auth/sign-in/route.ts's error redirect
    // rather than a specific account.
    await expect(page.getByText('Could not authenticate user')).toBeVisible();
  });
});
