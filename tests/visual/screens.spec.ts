import { test, expect, type Page, type Locator } from '@playwright/test';

/**
 * Visual-regression baselines for the pre-upgrade app.
 *
 * Requires fixture data to already be seeded in Supabase (3x `PWTEST `-
 * prefixed venues, one event each) — see tests/visual/README.md. Without it,
 * the map has no markers and the events list is empty, and several of these
 * tests will fail (rather than silently pass against an empty page).
 *
 * Each test runs twice — once under the `light` project, once under `dark`
 * (see playwright.config.ts) — because VenueMap.tsx swaps the Mapbox style
 * based on `prefers-color-scheme`, so dark mode is a genuinely different
 * render, not just a CSS filter.
 */

const FIXTURE_MARKER_COUNT = 3;

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
 * The homepage picks a random hero image on every server render
 * (`Math.floor(Math.random() * pictures.length)` in app/page.tsx). That's a
 * genuine source of cross-run nondeterminism unrelated to anything a
 * dependency upgrade would change, so it's masked out rather than "fixed" —
 * fixing it would mean editing app code for a test-harness task.
 */
function heroImageMask(page: Page): Locator {
  return page.getByAltText('Picture logo');
}

/**
 * app/page.tsx picks the hero image at random per server render, and it is
 * laid out with `w-full lg:max-h-96 object-cover`. Source images have
 * different aspect ratios, so the rendered HEIGHT varies between runs and
 * everything below it shifts.
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
 * Mapbox raster tiles are fetched from a live tile server and will never be
 * byte-identical between runs (CDN routing, cache state, label placement can
 * all vary). Masking the canvas is the reliable option: the markers and the
 * event drawer are ordinary DOM the browser lays out deterministically, so
 * they still get compared pixel-for-pixel; only the tile imagery itself is
 * excluded. The alternative — waiting for tile 'idle' and accepting a small
 * maxDiffPixelRatio — was rejected because it trades a hard guarantee for a
 * fuzzy one, and the whole point of this harness is a baseline you can trust.
 *
 * `coveredBy`, when passed, is an element that renders on top of the right
 * portion of the canvas (the event drawer, at z-50, sits over the map).
 * Playwright's mask paints over a locator's bounding box regardless of what
 * Chromium actually stacked on top of it — so naively masking the *whole*
 * canvas would blot out the drawer's real, deterministic content (the venue
 * heading, the event card) anywhere it happens to overlap the canvas's
 * bounding box. Instead, a synthetic element is sized to just the sliver of
 * canvas to the left of `coveredBy`, so only genuinely-visible tile pixels
 * get masked and the drawer stays fully comparable.
 */
async function mapboxCanvasMask(
  page: Page,
  coveredBy?: Locator
): Promise<Locator> {
  const canvas = page.locator('.mapboxgl-canvas');
  if (!coveredBy) return canvas;

  const canvasBox = await canvas.boundingBox();
  const coveringBox = await coveredBy.boundingBox();
  if (!canvasBox || !coveringBox) return canvas; // fall back rather than crash

  const visibleWidth = Math.max(0, coveringBox.x - canvasBox.x);

  await page.evaluate(
    ({ x, y, width, height }) => {
      const id = 'pw-visible-canvas-mask';
      let el = document.getElementById(id);
      if (!el) {
        el = document.createElement('div');
        el.id = id;
        document.body.appendChild(el);
      }
      Object.assign(el.style, {
        position: 'fixed',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        pointerEvents: 'none',
      });
    },
    { x: canvasBox.x, y: canvasBox.y, width: visibleWidth, height: canvasBox.height }
  );

  return page.locator('#pw-visible-canvas-mask');
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

test.describe('home', () => {
  test('logged out', async ({ page }) => {
    await page.goto('/');

    // Real signal: wait for the seeded fixture data to actually be on the
    // page, not just for the network to go quiet. (The Navbar's "Login" link
    // lives inside a closed-by-default Popover, so it isn't a usable signal
    // for the logged-out landing state without opening the menu first.)
    await expect(page.getByText('PWTEST', { exact: false }).first()).toBeVisible();
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
    await expect(page.getByText('PWTEST', { exact: false }).first()).toBeVisible();

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

    await expect(page.locator('.mapboxgl-marker')).toHaveCount(
      FIXTURE_MARKER_COUNT
    );
    // Best-effort: let the tile/style requests settle so marker projection
    // has stabilised. Non-fatal — the canvas is masked regardless, so a
    // lingering telemetry-style request here can't affect the comparison.
    await page
      .waitForLoadState('networkidle', { timeout: 5_000 })
      .catch(() => {});

    await expect(page).toHaveScreenshot('map-markers.png', {
      mask: [await mapboxCanvasMask(page)],
    });
  });

  test('drawer open', async ({ page }) => {
    await page.goto('/map');

    await expect(page.locator('.mapboxgl-marker')).toHaveCount(
      FIXTURE_MARKER_COUNT
    );
    await page
      .waitForLoadState('networkidle', { timeout: 5_000 })
      .catch(() => {});

    await page.locator('.mapboxgl-marker').first().click();

    // Real signal: the drawer renders the selected venue's name as an <h1>,
    // and our fixture venues are all named "PWTEST ...".
    await expect(
      page.getByRole('heading', { name: 'PWTEST', exact: false })
    ).toBeVisible();
    // vaul's DrawerClose wraps our Button in its own <button>, so the
    // accessible name "Close" matches two nested elements — take the outer
    // one to sidestep the strict-mode ambiguity.
    await expect(page.getByRole('button', { name: 'Close' }).first()).toBeVisible();
    await waitForNoMotion(page.locator('[data-vaul-drawer]'));

    await expect(page).toHaveScreenshot('map-drawer-open.png', {
      mask: [await mapboxCanvasMask(page, page.locator('[data-vaul-drawer]'))],
    });
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
