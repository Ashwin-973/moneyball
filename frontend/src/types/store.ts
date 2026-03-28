/**
 * Store-related types.
 */

export interface Store {
  id: string;
  user_id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: string;
  phone: string | null;
  open_time: string | null;
  close_time: string | null;
  is_active: boolean;
  created_at: string;
}
