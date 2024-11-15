'use client';
import {
  GoogleMap,
  LoadScript,
  MarkerF,
  InfoWindowF,
} from '@react-google-maps/api';
import { use, useEffect, useMemo, useState } from 'react';
import { dayformatter } from '@/utils/dataformatter';
import EventDrawer from './EventDrawer';
import EventsCards from './EventsCards';

interface VenueMapProps {
  venues: Array<Venue> | null;
  filteredEvents?: Events[] | undefined;
  user: any;
}

export default function VenueMap({
  venues,
  filteredEvents = [],
  user,
}: VenueMapProps) {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [refreshingEvents, setRefreshingEvents] = useState<boolean>(false);

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
    console.log('refreshing favourites');
    setRefreshingEvents(true);
  };

  const handleMarkerClick = (venue: Venue) => {
    // If we have filtered events, then we want to filter the events by the venue's events.
    if (filteredEvents) {
      venue.events = venue.events?.filter((event) =>
        filteredEvents.some((filteredEvent) => filteredEvent.id === event.id)
      );
    }

    // setDrawerOpen(true);
    setSelectedVenue(venue);
  };

  if (!venues) return <p>No Venues</p>;

  if (filteredEvents) {
    venues = venues.filter((venue) =>
      filteredEvents.some((event) => event.venue_id === venue.id)
    );
  }

  // useEffect(() => {
  //   if (selectedVenue) {
  //     setDrawerOpen(true);
  //   }
  // }, [selectedVenue]);

  // Calculate center of all venues, or default to Melbourne
  const center = useMemo(() => {
    if (!venues || venues.length === 0) {
      return { lat: -37.84795481174561, lng: 144.97700103811715 }; // Newcastle coordinates
    }

    return {
      lat:
        venues.reduce(
          (sum, venue) => sum + parseFloat(venue.latitude || '0'),
          0
        ) / venues.length,
      lng:
        venues.reduce(
          (sum, venue) => sum + parseFloat(venue.longitude || '0'),
          0
        ) / venues.length,
    };
  }, [filteredEvents]);

  const customMarker = (venue: Venue, selectedVenue: Venue | null) => {
    const matches = selectedVenue && selectedVenue.id === venue.id;

    return {
      path: 'M24 0C10.7 0 0 10.7 0 24s10.7 24 24 24 24-10.7 24-24S37.3 0 24 0zm-9 6v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V6M19 6v20M33 19V6a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7',
      fillColor: matches ? '#8f56fc' : '#000000',
      fillOpacity: 0.5,
      strokeWeight: 2,
      strokeColor: '#FFFFFF',
      scale: 0.7,
      anchor: { x: 24, y: 24 } as google.maps.Point, // Center the icon
    };
  };

  return (
    <div className='h-[70vh] w-full rounded-2xl border-2 border-foreground overflow-hidden'>
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
      >
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={center}
          zoom={13}
          clickableIcons={false}
          options={{ fullscreenControl: false }}
        >
          {venues.map((venue) => (
            <MarkerF
              key={venue.id}
              position={{
                lat: parseFloat(venue.latitude || '0'),
                lng: parseFloat(venue.longitude || '0'),
              }}
              onClick={() => handleMarkerClick(venue)}
              icon={customMarker(venue, selectedVenue)}
            />
          ))}

          {/* {selectedVenue && (
            <InfoWindowF
              position={{
                lat: parseFloat(selectedVenue.latitude || '0'),
                lng: parseFloat(selectedVenue.longitude || '0'),
              }}
              onCloseClick={() => handleMarkerClick(selectedVenue)}
            ></InfoWindowF>
          )} */}
        </GoogleMap>
      </LoadScript>

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
