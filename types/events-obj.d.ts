interface Events {
  id: number;
  created_at: string;
  desc: string;
  venue: string;
  when: string;
  special_price: string;
  event_time: string;
  is_favorite: boolean = false;
}
