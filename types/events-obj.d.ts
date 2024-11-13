interface Venue {
  id: number;
  created_at?: string;
  name: string;
  address?: string;
  website?: string;
  latitude?: string;
  longitude?: string;
  events?: Events[];
}

interface Events {
  id: number;
  created_at: string;
  desc: string;
  venue: string | Venue;
  venue_id?: number;
  when: string;
  special_price: string;
  event_time: string;
  is_favorite: boolean = false;
}
