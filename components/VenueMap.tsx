'use client';
import Map, { Marker, NavigationControl, type MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import type { User } from '@supabase/supabase-js';
import EventDrawer from './EventDrawer';
import EventsCards from './EventsCards';
import { VenueMarker } from './ui/mapmarker';

interface VenueMapProps {
  venues: Array<Venue> | null;
  filteredEvents?: Events[] | undefined;
  user: User | null;
}

// Melbourne, used when there is nothing to centre on yet.
const FALLBACK_CENTRE = {
  latitude: -37.84795481174561,
  longitude: 144.97700103811715,
};

export default function VenueMap({
  venues,
  filteredEvents = [],
  user,
}: VenueMapProps) {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [refreshingEvents, setRefreshingEvents] = useState<boolean>(false);

  // react-map-gl touches `window` on first render, so it can only mount once
  // we're definitely on the client. useSyncExternalStore's server snapshot
  // is always `false` and its client snapshot is always `true` — there is
  // nothing to subscribe to, so `subscribe` never fires — which reports
  // "mounted" without the setState-in-effect round trip a
  // useState+useEffect guard would need.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [darkMode, setDarkMode] = useState(false);

  const mapRef = useRef<MapRef | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Whether the bounds have been fitted against a container that actually had
  // a size. Guards the re-fit below so it corrects the initial state once and
  // then never fights the user's panning or zooming.
  const hasFittedRef = useRef(false);

  // Tailwind's default dark mode is media-based, so follow the same signal.
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => setDarkMode(query.matches);

    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  // The drawer's open state is derived from selectedVenue rather than kept
  // in its own piece of state synced via effects — the previous version had
  // two effects (one opening the drawer when a venue was selected, one
  // clearing the venue when the drawer closed) cascading off each other.
  const drawerOpen = selectedVenue !== null;

  const handleDrawerOpenChange = (open: boolean) => {
    if (!open) setSelectedVenue(null);
  };

  const refreshFavourites = () => {
    setRefreshingEvents(true);
  };

  const handleMarkerClick = (venue: Venue) => {
    // Narrow to the filtered events, but only when a filter is actually
    // active — an empty array is truthy, and testing it directly used to strip
    // every event on /map, where no filter is passed at all.
    const events =
      filteredEvents && filteredEvents.length > 0
        ? venue.events?.filter((event) =>
            filteredEvents.some((filteredEvent) => filteredEvent.id === event.id)
          )
        : venue.events;

    // Copy rather than assigning back onto the prop: mutating it discarded the
    // venue's other events for good, so re-filtering compounded each click.
    setSelectedVenue({ ...venue, events });
  };

  const visibleVenues = useMemo(() => {
    if (!venues) return [];
    if (!filteredEvents || filteredEvents.length === 0) return venues;

    return venues.filter((venue) =>
      filteredEvents.some((event) => event.venue_id === venue.id)
    );
  }, [venues, filteredEvents]);

  // Fit the viewport to the venues rather than centring on their average at a
  // fixed zoom. Averaging put the centre in roughly the right place but said
  // nothing about how far apart the pins were, so a hardcoded zoom of 13 (a
  // few km across) left most of them off-screen as soon as the data spread
  // past one suburb.
  const { initialViewState, fitTarget } = useMemo(() => {
    // parseFloat('') and parseFloat(null) are both NaN, and the old `|| '0'`
    // default turned a missing coordinate into a pin off West Africa — which
    // would then stretch the bounds across the planet. Drop those rows here.
    const points = visibleVenues
      .map((venue) => ({
        latitude: parseFloat(venue.latitude ?? ''),
        longitude: parseFloat(venue.longitude ?? ''),
      }))
      .filter(
        (point) => Number.isFinite(point.latitude) && Number.isFinite(point.longitude)
      );

    if (points.length === 0) {
      return {
        initialViewState: { ...FALLBACK_CENTRE, zoom: 13 },
        fitTarget: null,
      };
    }

    // A single venue has no extent to fit, so bounds would collapse to a point
    // and Mapbox would zoom to its maximum. Centre on it instead — and there is
    // nothing to re-fit later, since a point has no extent to get wrong.
    if (points.length === 1) {
      return {
        initialViewState: { ...points[0], zoom: 14 },
        fitTarget: null,
      };
    }

    const latitudes = points.map((point) => point.latitude);
    const longitudes = points.map((point) => point.longitude);

    const bounds: [[number, number], [number, number]] = [
      [Math.min(...longitudes), Math.min(...latitudes)],
      [Math.max(...longitudes), Math.max(...latitudes)],
    ];
    // Padding keeps edge pins clear of the frame and of the NavigationControl
    // in the top-right; maxZoom stops a tight cluster from slamming to
    // street level.
    const options = { padding: 64, maxZoom: 15 };

    return {
      initialViewState: { bounds, fitBoundsOptions: options },
      fitTarget: { bounds, options },
    };
    // Deliberately only the initial view — remounting on every filter change
    // would yank the map out from under someone who has panned away.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Keep the map's canvas in step with its container.
   *
   * Mapbox sizes its canvas once at construction and then, per the docs, only
   * re-measures when the *browser window* resizes — `trackResize` watches the
   * window, not the container. Anything that changes the container's size
   * without a window resize leaves the canvas stale, and a canvas smaller than
   * its container paints tiles for only part of the frame: the classic
   * "missing tiles down the right and along the bottom on first load".
   *
   * This app hits that squarely. On the homepage `EventsDisplay` renders the
   * map inside `${showList ? 'hidden' : 'block'}`, and `showList` starts
   * `true` — so the map is constructed inside a `display: none` box, measures
   * itself as 0x0, and is still that size when the Map toggle reveals it. The
   * Mapbox docs call this case out explicitly: a container "initially hidden
   * with CSS" must be resized manually once shown.
   *
   * A ResizeObserver on the container handles that and every other variant
   * (layout settling after fonts or the hero image load, an orientation
   * change, a future collapsible panel) without `VenueMap` needing to know why
   * it was hidden — which is why this lives here rather than as a callback
   * wired up from EventsDisplay.
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !mounted) return;

    const observer = new ResizeObserver(() => {
      // Only meaningful once the box actually has an area; resizing to 0x0 as
      // the container is hidden again would just thrash.
      if (container.clientWidth === 0 || container.clientHeight === 0) return;

      const map = mapRef.current;
      if (!map) return;

      map.resize();

      // Resizing corrects the canvas, but not the framing. `initialViewState`
      // fits the bounds at construction time — which, in the hidden-container
      // case, means fitting them to a 0x0 viewport and arriving at a
      // meaningless zoom. So the first time we see a real box, redo the fit
      // properly. `duration: 0` because this is correcting a never-correct
      // initial state, not animating a change the user asked for.
      if (!hasFittedRef.current) {
        hasFittedRef.current = true;
        if (fitTarget) {
          map.fitBounds(fitTarget.bounds, { ...fitTarget.options, duration: 0 });
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [mounted, fitTarget]);

  // Belt and braces: if the style finishes loading while the container already
  // has its final size, resize once here too. Cheap, idempotent, and covers
  // the ordering where the observer fired before the map instance existed.
  const handleMapLoad = useCallback(() => {
    mapRef.current?.resize();
  }, []);

  /**
   * Surface Mapbox's own failures.
   *
   * react-map-gl installs a default `error` handler that only console.errors,
   * and mapbox-gl reports tile fetch failures (429 rate limits, 401/403 token
   * problems, network errors) through that event rather than by throwing. With
   * nothing listening, a map that renders one tile and then silently gives up
   * looks identical to a map that is merely slow — which is precisely the
   * ambiguity that made the "missing tiles" report hard to pin down.
   *
   * Logging the status and URL makes the difference visible in the console.
   */
  const handleMapError = useCallback((event: { error?: unknown }) => {
    // mapbox-gl's ErrorLike carries `status` and `url` on tile/resource
    // failures, but its published type only guarantees `message` — hence the
    // narrowing rather than a cast.
    const error = (event.error ?? {}) as {
      message?: string;
      status?: number;
      url?: string;
    };
    console.error(
      `[VenueMap] mapbox error${error.status ? ` (HTTP ${error.status})` : ''}: ${
        error.message ?? 'unknown'
      }`,
      error.url ? `\n  url: ${error.url}` : ''
    );
  }, []);

  // Styled the same as EventsCards' own empty state (chunk 9 audit: this
  // previously rendered a bare, unstyled <p>, the "mostly blank" empty state
  // the spec calls out).
  if (!venues) {
    return (
      <div className='flex h-[70vh] w-full items-center justify-center rounded-xl border border-border bg-background-secondary shadow-sm'>
        <p className='text-meta text-muted-foreground'>
          No venues to show right now — check back soon.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      // bg-muted rather than nothing: until Mapbox paints its first tiles the
      // container shows through, and an unset background renders light in dark
      // mode — a white flash on every load of the one screen that is mostly
      // map. The token tracks the theme, so the pre-tile state matches.
      className='relative h-[70vh] w-full overflow-hidden rounded-xl border border-border bg-muted shadow-sm'
    >
      {mounted && visibleVenues.length === 0 && (
        <div className='pointer-events-none absolute inset-x-0 top-4 z-10 flex justify-center px-4'>
          <p className='text-meta rounded-full border border-border bg-background-secondary px-4 py-2 text-muted-foreground shadow-sm'>
            No specials match that search
          </p>
        </div>
      )}

      {mounted && (
        <Map
          ref={mapRef}
          onLoad={handleMapLoad}
          onError={handleMapError}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
          initialViewState={initialViewState}
          style={{ width: '100%', height: '100%' }}
          mapStyle={
            darkMode
              ? 'mapbox://styles/mapbox/dark-v11'
              : 'mapbox://styles/mapbox/light-v11'
          }
          attributionControl={false}
        >
          <NavigationControl position='top-right' showCompass={false} />

          {visibleVenues.map((venue) => (
            <Marker
              key={venue.id}
              latitude={parseFloat(venue.latitude || '0')}
              longitude={parseFloat(venue.longitude || '0')}
              anchor='center'
              onClick={() => handleMarkerClick(venue)}
            >
              <VenueMarker selected={selectedVenue?.id === venue.id} />
            </Marker>
          ))}
        </Map>
      )}

      <EventDrawer open={drawerOpen} onOpenChange={handleDrawerOpenChange}>
        {selectedVenue ? (
          <div className=''>
            <h1 className='text-section mb-4 text-center text-foreground'>
              {selectedVenue.name}
            </h1>
            <EventsCards
              user={user}
              events={selectedVenue.events || []}
              refreshFavourites={refreshFavourites}
            />
          </div>
        ) : (
          <p className='text-meta text-center text-muted-foreground'>
            No venue selected
          </p>
        )}
      </EventDrawer>
    </div>
  );
}
