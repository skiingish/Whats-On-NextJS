'use client';

import { useEffect, useState } from 'react';
import { Combobox } from './combobox';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Venue {
  id: string;
  name: string;
  // add other venue properties as needed
}

interface VenueComboBoxProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function VenueComboBox({
  value,
  onChange,
  className,
}: VenueComboBoxProps) {
  const [venues, setVenues] = useState<Venue[]>([]);
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

  const options = venues.map((venue) => ({
    value: venue.id,
    label: venue.name,
  }));

  if (loading) {
    return <div>Loading venues...</div>; // Or use a proper loading component
  }

  return (
    <Combobox
      options={options}
      value={value}
      onChange={onChange}
      placeholder='Select a venue...'
      searchPlaceholder='Search venues...'
      emptyMessage='No venues found.'
      className={className}
    />
  );
}
