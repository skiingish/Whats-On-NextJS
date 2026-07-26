'use client';

import { useEffect, useState } from 'react';
import { Combobox } from './combobox';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

interface Venue {
  id: string;
  name: string;
  // add other venue properties as needed
}

// Only admins can create venues. When a visitor names a venue we don't know
// about yet, the name rides along on the pending submission instead of
// becoming a live venue row, so the combobox value carries the raw name behind
// this prefix rather than an id.
const NEW_VENUE_PREFIX = 'new:';

export const isNewVenue = (value: string) => value.startsWith(NEW_VENUE_PREFIX);

export const newVenueName = (value: string) =>
  value.slice(NEW_VENUE_PREFIX.length);

interface VenueComboBoxProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  /** Admins create venues immediately; visitors only propose a name. */
  canCreateVenue?: boolean;
}

export function VenueComboBox({
  value,
  onChange,
  className,
  canCreateVenue = false,
}: VenueComboBoxProps) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [proposedVenue, setProposedVenue] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchVenues() {
      try {
        const { data, error } = await supabase
          .from('venues')
          .select('id, name')
          .order('name');

        if (error) throw error;

        setVenues(data || []);
      } catch (error) {
        console.error('Error fetching venues:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchVenues();
  }, [supabase]);

  const options = [
    ...venues.map((venue) => ({
      value: venue.id,
      label: venue.name,
    })),
    ...(proposedVenue
      ? [
          {
            value: NEW_VENUE_PREFIX + proposedVenue,
            label: `${proposedVenue} (new)`,
          },
        ]
      : []),
  ];

  const handleAddVenue = async (venueName: string) => {
    venueName = venueName.trim();
    if (!venueName) return;

    // Visitors can't write to `venues` — RLS blocks it. Carry the name on the
    // submission and let the admin create the venue when they approve it.
    if (!canCreateVenue) {
      setProposedVenue(venueName);
      onChange(NEW_VENUE_PREFIX + venueName);
      toast.success(`"${venueName}" will be added once your event is approved`);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('venues')
        .insert([{ name: venueName }])
        .select()
        .single();
      if (error) throw error;

      toast.success('Venue added successfully!');

      setVenues([...venues, data]);
      onChange(data.id);
    } catch (error) {
      toast.error('Error adding venue. Please try again.');
      console.error('Error adding venue:', error);
    }
  };

  return (
    <Combobox
      options={options}
      value={value}
      onChange={onChange}
      placeholder='Select a venue...'
      searchPlaceholder='Search venues...'
      emptyMessage='No venues found.'
      className={className}
      handleAddItem={handleAddVenue}
      addItemLabel={canCreateVenue ? 'Add New Venue:' : 'Suggest New Venue:'}
      loading={loading}
      loadingMessage='Fetching venues...'
    />
  );
}
