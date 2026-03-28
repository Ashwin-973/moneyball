/**
 * Product-related types.
 */

export interface Product {
  id: string;
  store_id: string;
  name: string;
  category: string;
  mrp: number;
  cost_price: number;
  image_url: string | null;
  batch_number: string | null;
  expiry_date: string;
  quantity: number;
  risk_score: number;
  created_at: string;
  updated_at: string;
}
