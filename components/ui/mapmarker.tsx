/**
 * Venue pin.
 *
 * Mapbox markers are plain DOM, not the icon descriptor object Google Maps
 * took, so the same artwork is drawn as inline SVG instead. Path and anchor
 * behaviour (viewBox, size, `anchor='center'` in VenueMap) are unchanged —
 * only the fill/stroke treatment is restyled for the 2026 redesign, reading
 * off the brand's `--primary` token via `currentColor` so both themes' pin
 * colours stay in one place (globals.css) rather than being hardcoded here.
 * Selected uses a solid, opaque fill and a heavier ring so it reads as
 * clearly distinct from the unselected pins at a glance, rather than the
 * previous same-ish translucent black/purple pair.
 */

const PIN_PATH =
  'M24 0C10.7 0 0 10.7 0 24s10.7 24 24 24 24-10.7 24-24S37.3 0 24 0zm-9 6v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V6M19 6v20M33 19V6a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7';

interface VenueMarkerProps {
  selected: boolean;
  /** Matches the 0.7 scale the Google symbol used against a 48px artboard. */
  size?: number;
}

export function VenueMarker({ selected, size = 34 }: VenueMarkerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      // Tokens, not raw hex: `text-primary`/`text-foreground` set the SVG's
      // `currentColor`, which the path below picks up via `fill="currentColor"`.
      className={selected ? 'text-primary' : 'text-foreground'}
      style={{
        display: 'block',
        cursor: 'pointer',
        transition: 'transform 120ms ease',
        transform: selected ? 'scale(1.25)' : 'scale(1)',
      }}
    >
      <path
        d={PIN_PATH}
        className="stroke-background-secondary"
        fill="currentColor"
        fillOpacity={selected ? 1 : 0.55}
        strokeWidth={2}
      />
    </svg>
  );
}
