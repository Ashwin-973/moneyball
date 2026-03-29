/**
 * Notification types — mirrors backend NOTIFICATION_TYPES constants.
 */

export enum NotificationType {
  NEW_DEAL_NEARBY = "new_deal_nearby",
  DEAL_CRITICAL = "deal_critical",
  DEAL_EXPIRING_SOON = "deal_expiring_soon",
  RESERVATION_CONFIRMED = "reservation_confirmed",
  RESERVATION_CANCELLED = "reservation_cancelled",
  RESERVATION_COMPLETED = "reservation_completed",
  HOLD_EXPIRING = "hold_expiring",
  PING = "ping",
  CONNECTED = "connected",
}

export interface Notification {
  id: string;
  user_id: string;
  deal_id: string | null;
  type: string;
  title: string;
  body: string;
  read: boolean;
  sent_at: string;
  read_at: string | null;
}

export interface NotificationListResponse {
  items: Notification[];
  unread_count: number;
}

export interface SSEEvent {
  type: string;
  title?: string;
  body?: string;
  deal_id?: string;
  metadata?: Record<string, unknown>;
  timestamp?: string;
  message?: string;
}
