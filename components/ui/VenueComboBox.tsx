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

  const handleAddVenue = async (venueName: string) => {
    venueName = venueName.trim();
    console.log('Adding venue:', venueName);

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
      addItemLabel='Add New Venue:'
      loading={loading}
      loadingMessage='Fetching venues...'
    />
  );
}
