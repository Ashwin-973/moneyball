/**
 * Deal-related types.
 */

export enum DealType {
  flash = "flash",
  clearance = "clearance",
  bundle = "bundle",
}

export enum DealStatus {
  draft = "draft",
  active = "active",
  reserved = "reserved",
  sold = "sold",
  expired = "expired",
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
  listed_at: string;
  expires_at: string | null;
  risk_score_at_listing: number;
}
