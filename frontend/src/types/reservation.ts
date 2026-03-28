/**
 * Reservation-related types.
 */

export enum ReservationStatus {
  pending = "pending",
  confirmed = "confirmed",
  completed = "completed",
  cancelled = "cancelled",
}

export interface Reservation {
  id: string;
  deal_id: string;
  consumer_id: string;
  store_id: string;
  quantity: number;
  status: ReservationStatus;
  hold_expires_at: string;
  reserved_at: string;
  confirmed_at: string | null;
  completed_at: string | null;
}
