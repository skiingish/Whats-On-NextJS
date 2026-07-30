import { test, expect, type Page } from '@playwright/test';

/**
 * Regression tests for the map's canvas tracking its container.
 *
 * The reported symptom was "on first load it's missing tiles on the right and
 * bottom". That is what a Mapbox canvas smaller than its container looks like:
 * the map only ever paints the region it thinks it occupies, leaving the
 * remainder of the box empty.
 *
 * The cause is that Mapbox measures its container once at construction and
 * afterwards only re-measures on *window* resize (`trackResize` watches the
 * window, not the element). On the homepage `EventsDisplay` renders the map
 * inside `${showList ? 'hidden' : 'block'}` with `showList` defaulting to
 * true, so the map is built inside a `display: none` box, measures 0x0, and
 * keeps that size when the Map toggle reveals it.
 *
 * These assert the canvas matches its container, which is the invariant that
 * was broken. They deliberately do not screenshot: the visual suite already
 * covers appearance, and tile imagery is nondeterministic anyway.
 */

/** Rendered CSS size of the Mapbox canvas and of the box it should fill. */
async function measure(page: Page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('.mapboxgl-canvas') as HTMLElement | null;
    const container = document.querySelector('.mapboxgl-map')
      ?.parentElement as HTMLElement | null;
    if (!canvas || !container) return null;
    return {
      canvas: { width: canvas.clientWidth, height: canvas.clientHeight },
      container: { width: container.clientWidth, height: container.clientHeight },
    };
  });
}

/**
 * Sub-pixel differences are legitimate — the container has a 2px border and
 * layout can land on fractional pixels — but the bug produced a canvas
 * hundreds of pixels short, so a small tolerance separates the two cleanly.
 */
const TOLERANCE = 4;

async function expectCanvasFillsContainer(page: Page) {
  await expect
    .poll(async () => (await measure(page))?.canvas.width ?? 0, {
      message: 'mapbox canvas should have a non-zero width',
    })
    .toBeGreaterThan(0);

  const measured = await measure(page);
  expect(measured).not.toBeNull();

  expect(
    Math.abs(measured!.canvas.width - measured!.container.width),
    `canvas width ${measured!.canvas.width} should match container ${measured!.container.width}`
  ).toBeLessThanOrEqual(TOLERANCE);

  expect(
    Math.abs(measured!.canvas.height - measured!.container.height),
    `canvas height ${measured!.canvas.height} should match container ${measured!.container.height}`
  ).toBeLessThanOrEqual(TOLERANCE);
}

test.describe('map sizing', () => {
  test('fills its container when revealed from behind the List toggle', async ({
    page,
  }) => {
    await page.goto('/');

    // The map starts mounted but hidden — this is the case that regressed.
    await page.getByRole('button', { name: 'Map', exact: true }).click();

    await expect(page.locator('.mapboxgl-canvas')).toBeVisible();
    await expectCanvasFillsContainer(page);
  });

  test('fills its container on the dedicated /map route', async ({ page }) => {
    await page.goto('/map');

    await expect(page.locator('.mapboxgl-canvas')).toBeVisible();
    await expectCanvasFillsContainer(page);
  });

  test('still fills its container after the window resizes', async ({ page }) => {
    await page.goto('/map');
    await expect(page.locator('.mapboxgl-canvas')).toBeVisible();

    await page.setViewportSize({ width: 900, height: 700 });
    await expectCanvasFillsContainer(page);

    await page.setViewportSize({ width: 1400, height: 1000 });
    await expectCanvasFillsContainer(page);
  });
});
