import { test, expect, type Page, type Locator } from '@playwright/test';
import { venues, SENTINEL_VENUE_NAME } from './fixtures/dataset.mjs';

/**
 * Visual-regression baselines.
 *
 * These render against committed fixture data, not the shared database. A
 * fixture server stands in for Supabase and the dev server is pointed at it
 * (see playwright.config.ts and tests/visual/fixtures/mock-supabase.mjs), so
 * a baseline changes only when someone edits `fixtures/dataset.mjs` — adding a
 * venue in production cannot move a pixel, and the suite needs no database
 * credentials.
 *
 * That restores something the previous live-data version had to give up:
 * because the dataset is fixed and known, the assertions below can be exact
 * again (a specific venue name, a specific marker count). Under live data
 * those would have been a liability; here they are the point.
 *
 * Every test asserts the sentinel fixture venue is on screen before capturing.
 * That is a deliberate tripwire: if the env override ever stops taking effect
 * and the app talks to the real Supabase project, the suite fails immediately
 * instead of quietly overwriting the baselines with production data.
 *
 * Each test runs twice — once under the `light` project, once under `dark`
 * (see playwright.config.ts) — because VenueMap.tsx swaps the Mapbox style
 * based on `prefers-color-scheme`, so dark mode is a genuinely different
 * render, not just a CSS filter.
 */

test.beforeEach(async ({ page }) => {
  // Vercel's analytics/speed-insights scripts and Mapbox's telemetry beacon
  // are non-visual side effects that only add network noise around the
  // capture. None of them affect layout or the map render, but blocking them
  // means a `networkidle` wait means what it says, and nothing races the
  // screenshot moments after it settles.
  await page.route('**/_vercel/**', (route) => route.abort());
  await page.route('https://events.mapbox.com/**', (route) => route.abort());
});

/**
 * The homepage picks its hero image, so its exact pixels are irrelevant to
 * layout tests — masked out rather than compared. app/page.tsx used to pick
 * with `Math.random()` on every server render (fixed as part of D31: that
 * was also an impure-during-render react-hooks/purity violation); it now
 * picks deterministically, seeded by the day of the year, so repeated
 * requests within the same run — and within the same calendar day — get the
 * identical image. The mask stays regardless of which image renders.
 */
function heroImageMask(page: Page): Locator {
  return page.getByAltText('Picture logo');
}

/**
 * app/page.tsx's hero image is laid out with `w-full lg:max-h-96
 * object-cover`, and the source images have different aspect ratios
 * (verified: most are ~1.5:1, but poutine is 1.25:1 and bingo is ~1.47:1),
 * so the rendered HEIGHT depends on which image renders and everything
 * below it shifts.
 *
 * Picking the image deterministically (D31) removed the *within-run*
 * variation — every request in a single `npm run test:visual` invocation
 * now renders the same image, since the pick is seeded by the day, not the
 * request — but two runs on different calendar days can still legitimately
 * pick different images with different aspect ratios. So this pin is still
 * needed for day-to-day stability, just not for the reason it originally
 * was. Confirmed by running the suite repeatedly on the same day (all
 * green) — the remaining exposure is only across a date boundary.
 *
 * Masking cannot fix this — a mask hides pixels, not layout. So pin the
 * element's box to the height `max-h-96` caps it at. Nothing is lost: the
 * image is masked out of the comparison anyway, and this makes the rest of
 * the page land at the same offset every run.
 */
async function pinHeroImage(page: Page) {
  await page.addStyleTag({
    content: `
      img[alt="Picture logo"] {
        height: 24rem !important;
        max-height: 24rem !important;
        min-height: 24rem !important;
      }

      /* app/globals.css defines a bespoke .animate-in keyframe that fades the
         page wrappers up from opacity-0 after a 0.15s delay. Playwright's
         animations:'disabled' does not reliably land it on its end state, so
         the background behind the modal could still be mid-fade when the
         screenshot fired. Force it to the finished state. */
      .animate-in {
        animation: none !important;
        opacity: 1 !important;
      }
    `,
  });
}

/**
 * Removes the Mapbox tile imagery from the comparison while leaving
 * everything drawn on top of it intact.
 *
 * Tiles come from a live server and will never be byte-identical between runs
 * (CDN routing, cache state, label placement), so they have to be excluded
 * somehow. This used to be done with Playwright's `mask` option pointed at
 * `.mapboxgl-canvas` — but a mask paints an opaque box over the locator's
 * *bounding box*, regardless of what Chromium actually stacked above it. The
 * canvas's bounding box is the entire map, and the markers are siblings
 * rendered over it, so masking the canvas blotted out the markers too. The
 * `map > markers visible` baseline was a solid magenta rectangle: the test
 * could not have detected a marker regression, or the markers disappearing
 * entirely. It went from three markers to seven without producing a diff,
 * which is how this was noticed.
 *
 * Hiding the canvas element instead is strictly better. `visibility: hidden`
 * removes the tile pixels but leaves layout untouched, and the markers, the
 * navigation control and the event drawer are separate DOM nodes that keep
 * rendering — so they are genuinely compared pixel-for-pixel, which is what
 * the mask was only ever claimed to do. It also removes the need for the
 * synthetic partial-mask element the drawer test previously required.
 *
 * The tradeoff is unchanged and still accepted: a regression visible *only*
 * in the tile imagery (say a Mapbox GL major bump altering raster rendering)
 * is invisible here. Waiting for tile idle and accepting a small
 * `maxDiffPixelRatio` was rejected for trading a hard guarantee for a fuzzy
 * one.
 */
async function hideMapTiles(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `.mapboxgl-canvas { visibility: hidden !important; }`,
  });
}

/**
 * Waits until `locator`'s bounding box stops changing.
 *
 * vaul (the event drawer's slide-in library) animates its open/close
 * position with its own JS-driven physics rather than a CSS transition or
 * the Web Animations API, so it's invisible to both `document.getAnimations()`
 * and Playwright's `animations: 'disabled'` screenshot option — neither
 * knows there's motion to stop. A single flaky double-run confirmed this:
 * `map > drawer open` (dark) intermittently diffed a thin vertical strip
 * right where the drawer's leading edge slides past the map's navigation
 * control, i.e. the drawer was still moving when the screenshot fired. This
 * polls the actual rendered position instead of guessing at a fixed delay.
 */
async function waitForNoMotion(
  locator: Locator,
  { settleChecks = 3, interval = 100, timeout = 3_000 } = {}
): Promise<void> {
  const deadline = Date.now() + timeout;
  let last: { x: number; y: number; width: number; height: number } | null =
    null;
  let stableCount = 0;

  while (Date.now() < deadline) {
    const box = await locator.boundingBox();
    const unchanged =
      box &&
      last &&
      box.x === last.x &&
      box.y === last.y &&
      box.width === last.width &&
      box.height === last.height;

    stableCount = unchanged ? stableCount + 1 : 0;
    if (stableCount >= settleChecks) return;

    last = box;
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  // Timed out without settling — proceed anyway and let the screenshot
  // comparison itself catch a genuinely-unstable render.
}

/**
 * Waits until exactly the fixture venues have rendered as markers.
 *
 * The count comes from the dataset rather than a literal, so editing
 * `fixtures/dataset.mjs` keeps this correct automatically. Asserting an exact
 * count is safe now that the data is repo-controlled, and it is worth having:
 * it catches a marker failing to render, which a screenshot alone would only
 * catch if you happened to notice the missing pin.
 */
async function waitForMarkers(page: Page): Promise<void> {
  await expect(page.locator('.mapboxgl-marker')).toHaveCount(venues.length);
}

/**
 * Tripwire asserting the fixture server is the one answering. If the env
 * override regressed and the app were talking to the real project, this name
 * would not appear and the test fails before any screenshot is written.
 */
function fixtureSentinel(page: Page): Locator {
  return page.getByText(SENTINEL_VENUE_NAME, { exact: false }).first();
}

test.describe('home', () => {
  test('logged out', async ({ page }) => {
    await page.goto('/');

    // Real signal: wait for event data to actually be on the page, not just
    // for the network to go quiet. (The Navbar's "Login" link lives inside a
    // closed-by-default Popover, so it isn't a usable signal for the
    // logged-out landing state without opening the menu first.)
    await expect(fixtureSentinel(page)).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Something Missing?' })
    ).toBeVisible();

    await pinHeroImage(page);

    await expect(page).toHaveScreenshot('home-logged-out.png', {
      mask: [heroImageMask(page)],
    });
  });

  test('add event modal open', async ({ page }) => {
    await page.goto('/');
    await expect(fixtureSentinel(page)).toBeVisible();

    await pinHeroImage(page);

    await page.getByRole('button', { name: 'Something Missing?' }).click();

    // The modal's own title text is the real signal that it finished opening.
    await expect(
      page.getByRole('heading', { name: 'Add New Event For Review' })
    ).toBeVisible();

    // Visible is not the same as settled. Headless UI's Transition scales and
    // fades the panel in, and `animations: 'disabled'` does not reliably
    // freeze it — the same reason the drawer needs this. Without it this test
    // failed roughly one run in three, mid-transition.
    await waitForNoMotion(page.getByRole('dialog'));

    await expect(page).toHaveScreenshot('home-add-event-modal.png', {
      mask: [heroImageMask(page)],
    });
  });
});

test.describe('map', () => {
  test('markers visible', async ({ page }) => {
    await page.goto('/map');

    await waitForMarkers(page);
    // Best-effort: let the tile/style requests settle so marker projection
    // has stabilised. Non-fatal — the canvas is masked regardless, so a
    // lingering telemetry-style request here can't affect the comparison.
    await page
      .waitForLoadState('networkidle', { timeout: 5_000 })
      .catch(() => {});

    await hideMapTiles(page);

    await expect(page).toHaveScreenshot('map-markers.png');
  });

  test('drawer open', async ({ page }) => {
    await page.goto('/map');

    await waitForMarkers(page);
    await page
      .waitForLoadState('networkidle', { timeout: 5_000 })
      .catch(() => {});

    await page.locator('.mapboxgl-marker').first().click();

    // Real signal: the drawer renders the selected venue's name as an <h1>.
    // Matching the element rather than a specific venue's name keeps this
    // working whichever venue happens to be first in the data.
    await expect(
      page.locator('[data-vaul-drawer] h1')
    ).toBeVisible();
    // vaul's DrawerClose wraps our Button in its own <button>, so the
    // accessible name "Close" matches two nested elements — take the outer
    // one to sidestep the strict-mode ambiguity.
    await expect(page.getByRole('button', { name: 'Close' }).first()).toBeVisible();
    await waitForNoMotion(page.locator('[data-vaul-drawer]'));

    await hideMapTiles(page);

    await expect(page).toHaveScreenshot('map-drawer-open.png');
  });
});

test('login', async ({ page }) => {
  await page.goto('/login');

  await expect(page.locator('input[name="email"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();

  await expect(page).toHaveScreenshot('login.png');
});

// The /sign-up screen was removed with the invite flow (backlog D11). It was
// only reachable via a JWT invite link that could never be generated, since
// JWT_SECRET was never set. Admin accounts are created in the Supabase
// dashboard now, so there is no public signup page left to capture.
