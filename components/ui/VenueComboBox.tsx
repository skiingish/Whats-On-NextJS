'use client';

import { useEffect, useState } from 'react';
import { Combobox } from './combobox';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { makeNewVenueValue } from '@/lib/venue-selection';
import { cn } from '@/lib/utils';

interface Venue {
  id: string;
  name: string;
  // add other venue properties as needed
}

interface VenueComboBoxProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  /** Admins create venues immediately; visitors only propose a name. */
  canCreateVenue?: boolean;
  /** Forwarded to the underlying Combobox's trigger button. */
  id?: string;
}

export function VenueComboBox({
  value,
  onChange,
  className,
  canCreateVenue = false,
  id,
}: VenueComboBoxProps) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [proposedVenue, setProposedVenue] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

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
            value: makeNewVenueValue(proposedVenue),
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
      onChange(makeNewVenueValue(venueName));
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
      id={id}
      options={options}
      value={value}
      onChange={onChange}
      placeholder='Select a venue...'
      searchPlaceholder='Search venues...'
      emptyMessage='No venues found.'
      // Matches the redesigned text inputs (filled surface, hairline border,
      // small radius) rather than the outline-button look Combobox falls
      // back to on its own — this is the app's only Combobox usage today,
      // so it's centralised here rather than in combobox.tsx.
      className={cn(
        'w-full justify-between rounded-sm border-input bg-background-secondary font-normal',
        className
      )}
      handleAddItem={handleAddVenue}
      addItemLabel={canCreateVenue ? 'Add New Venue:' : 'Suggest New Venue:'}
      loading={loading}
      loadingMessage='Fetching venues...'
    />
  );
}
