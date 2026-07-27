'use client';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useMemo, useState } from 'react';
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [refreshingEvents, setRefreshingEvents] = useState<boolean>(false);

  // react-map-gl touches window on first render, so keep it off the server.
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Tailwind's default dark mode is media-based, so follow the same signal.
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => setDarkMode(query.matches);

    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (selectedVenue) {
      setDrawerOpen(true);
    }
  }, [selectedVenue]);

  useEffect(() => {
    if (selectedVenue && !drawerOpen) {
      setSelectedVenue(null);
    }
  }, [drawerOpen]);

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

  // Centre on the average of whatever is on screen, or fall back to Melbourne.
  const initialViewState = useMemo(() => {
    if (visibleVenues.length === 0) {
      return { ...FALLBACK_CENTRE, zoom: 13 };
    }

    const total = visibleVenues.reduce(
      (acc, venue) => ({
        latitude: acc.latitude + parseFloat(venue.latitude || '0'),
        longitude: acc.longitude + parseFloat(venue.longitude || '0'),
      }),
      { latitude: 0, longitude: 0 }
    );

    return {
      latitude: total.latitude / visibleVenues.length,
      longitude: total.longitude / visibleVenues.length,
      zoom: 13,
    };
    // Deliberately only the initial view — remounting on every filter change
    // would yank the map out from under someone who has panned away.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!venues) return <p>No Venues</p>;

  return (
    <div className='h-[70vh] w-full rounded-2xl border-2 border-foreground overflow-hidden'>
      {mounted && (
        <Map
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

      <EventDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        {selectedVenue ? (
          <div className=''>
            <h1 className='text-xl text-center mb-4'>{selectedVenue.name}</h1>
            <EventsCards
              user={user}
              events={selectedVenue.events || []}
              refreshFavourites={refreshFavourites}
            />
          </div>
        ) : (
          <>
            <p>No venue selected</p>
          </>
        )}
      </EventDrawer>
    </div>
  );
}
