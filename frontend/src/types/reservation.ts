// Phase 6 — Reservation types and interfaces

export enum ReservationStatus {
  pending = "pending",
  confirmed = "confirmed",
  completed = "completed",
  cancelled = "cancelled",
}

export interface DealMinimal {
  id: string;
  product_name: string;
  deal_price: number;
  original_price: number;
  discount_pct: number;
  expiry_date: string;
  product_image_url: string | null;
}

export interface StoreMinimalRes {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface Reservation {
  id: string;
  deal_id: string;
  consumer_id: string;
  store_id: string;
  quantity: number;
  status: ReservationStatus;
  hold_expires_at: string; // ISO datetime
  reserved_at: string; // ISO datetime
  confirmed_at: string | null;
  completed_at: string | null;
  deal: DealMinimal;
  store: StoreMinimalRes;
}

export interface ReservationCreateRequest {
  deal_id: string;
  quantity: number;
}

export interface ReservationListResponse {
  items: Reservation[];
  total: number;
}

export interface ReservationStatusUpdate {
  status: "confirmed" | "completed" | "cancelled";
}
