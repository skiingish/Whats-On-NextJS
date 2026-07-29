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
  /**
   * Optional URL the special was sourced from — usually the venue page it is
   * published on. Optional because some venues have no website at all.
   */
  link?: string | null;
  is_favorite?: boolean;
}
