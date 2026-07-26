/**
 * Venue pin.
 *
 * Mapbox markers are plain DOM, not the icon descriptor object Google Maps
 * took, so the same artwork is drawn as inline SVG instead. Path, colours and
 * the selected-state highlight are carried over unchanged from the Google
 * implementation.
 */

const PIN_PATH =
  'M24 0C10.7 0 0 10.7 0 24s10.7 24 24 24 24-10.7 24-24S37.3 0 24 0zm-9 6v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V6M19 6v20M33 19V6a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7';

const SELECTED_FILL = '#8f56fc';
const DEFAULT_FILL = '#000000';

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
      style={{
        display: 'block',
        cursor: 'pointer',
        transition: 'transform 120ms ease',
        transform: selected ? 'scale(1.25)' : 'scale(1)',
      }}
    >
      <path
        d={PIN_PATH}
        fill={selected ? SELECTED_FILL : DEFAULT_FILL}
        fillOpacity={0.5}
        stroke="#FFFFFF"
        strokeWidth={2}
      />
    </svg>
  );
}
