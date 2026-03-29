export enum DealType {
  clearance = "clearance",
  flash = "flash",
  happy_hour = "happy_hour",
}

export enum DealStatus {
  draft = "draft",
  active = "active",
  reserved = "reserved",
  expired = "expired",
  cancelled = "cancelled",
}

export interface Deal {
  id: string;
  store_id: string;
  product_id: string;
  deal_price: number;
  original_price: number;
  discount_pct: number;
  quantity_available: number;
  expiry_date: string;
  deal_type: DealType;
  status: DealStatus;
  listed_at: string | null;
  risk_score_at_listing: number;
  
  product_name?: string;
  store_name?: string;
  days_to_expiry?: number;
  is_urgent?: boolean;
}

export interface DealCreateRequest {
  product_id: string;
  deal_price: number;
  quantity_to_list: number;
  deal_type?: DealType;
}

export interface DealSuggestion {
  product_id: string;
  product_name: string;
  category: string;
  mrp: number;
  suggested_discount_pct: number;
  suggested_deal_price: number;
  risk_score: number;
  risk_label: "safe" | "watch" | "urgent" | "critical";
  days_to_expiry: number;
  quantity: number;
}

export interface DealListResponse {
  items: Deal[];
  total: number;
}

// ── Consumer feed types (Phase 5) ───────────────────────────

export type FeedTab = "near_you" | "ending_soon" | "best_discounts" | "most_urgent";

export interface StoreMinimal {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: string;
  distance_km: number;
}

export interface DealDetailOut {
  id: string;
  store_id: string;
  product_id: string;
  deal_price: number;
  original_price: number;
  discount_pct: number;
  quantity_available: number;
  expiry_date: string;
  deal_type: string;
  status: string;
  listed_at: string;
  risk_score_at_listing: number;
  product_name: string;
  product_image_url: string | null;
  batch_number: string | null;
  store: StoreMinimal;
  days_to_expiry: number;
  is_urgent: boolean;
  hours_to_expiry: number | null;
}

export interface DealFeedResponse {
  items: DealDetailOut[];
  total: number;
  page: number;
  page_size: number;
  sort_by: string;
}

export interface MapPinOut {
  store_id: string;
  store_name: string;
  lat: number;
  lng: number;
  category: string;
  deal_count: number;
  max_discount_pct: number;
}

export interface MapFeedResponse {
  pins: MapPinOut[];
  total_deals: number;
}
