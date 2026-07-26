
export const createVenueMarker = (venue: Venue, selectedVenue: Venue | null) => {
  const matches = selectedVenue && selectedVenue.id === venue.id;

  return {
    path: 'M24 0C10.7 0 0 10.7 0 24s10.7 24 24 24 24-10.7 24-24S37.3 0 24 0zm-9 6v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V6M19 6v20M33 19V6a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7',
    fillColor: matches ? '#8f56fc' : '#000000',
    fillOpacity: 0.5,
    strokeWeight: 2,
    strokeColor: '#FFFFFF',
    scale: 0.7,
    anchor: { x: 24, y: 24 } as google.maps.Point,
  };
};