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
  venues: Array<Venue>;
  user: any;
}

export default function VenueMap({ venues, user }: VenueMapProps) {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [refreshingEvents, setRefreshingEvents] = useState<boolean>(false);

  const refreshFavourites = () => {
    console.log('refreshing favourites');
    setRefreshingEvents(true);
  };

  const handleMarkerClick = (venue: Venue) => {
    setDrawerOpen(true);
    console.log('handleMarkerClick');
    setSelectedVenue(venue);
    console.log('Venue:', venue);
  };

  // useEffect(() => {
  //   if (selectedVenue) {
  //     setDrawerOpen(true);
  //   }
  // }, [selectedVenue]);

  // Calculate center of all venues, or default to Newcastle, NSW
  const center = useMemo(() => {
    if (venues.length === 0) {
      return { lat: -32.9283, lng: 151.7817 }; // Newcastle coordinates
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
  }, [venues]);

  const customMarker = {
    path: 'M24 0C10.7 0 0 10.7 0 24s10.7 24 24 24 24-10.7 24-24S37.3 0 24 0zm-9 6v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V6M19 6v20M33 19V6a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7',
    fillColor: '#000000',
    fillOpacity: 0.5,
    strokeWeight: 2,
    strokeColor: '#FFFFFF',
    scale: 0.7,
    anchor: { x: 24, y: 24 } as google.maps.Point, // Center the icon
  };

  return (
    <>
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
      >
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={center}
          zoom={13}
        >
          {venues.map((venue) => (
            <MarkerF
              key={venue.id}
              position={{
                lat: parseFloat(venue.latitude || '0'),
                lng: parseFloat(venue.longitude || '0'),
              }}
              onClick={() => handleMarkerClick(venue)}
              icon={customMarker}
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
    </>
  );
}
