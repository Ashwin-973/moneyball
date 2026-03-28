/**
 * Retailer strategy & onboarding — mirrors backend enums / fields.
 */

export const RETAIL_DOMAINS = [
  { value: "bakery", label: "Bakery" },
  { value: "supermarket", label: "Supermarket" },
  { value: "convenience", label: "Convenience" },
  { value: "produce", label: "Produce" },
] as const;

export type RetailDomain = (typeof RETAIL_DOMAINS)[number]["value"];

export const PRODUCT_TYPE_OPTIONS = [
  { id: "baked_goods", label: "Baked Goods" },
  { id: "packaged_snacks", label: "Packaged Snacks" },
  { id: "dairy", label: "Dairy" },
  { id: "beverages", label: "Beverages" },
  { id: "prepared_meals", label: "Prepared Meals" },
] as const;

export type TargetProductTypeId = (typeof PRODUCT_TYPE_OPTIONS)[number]["id"];

export const MARKDOWN_TRIGGER_OPTIONS = [
  { value: "24h_before", label: "24 hours before expiry" },
  { value: "3d_before", label: "3 days before expiry" },
  { value: "1w_before", label: "1 week before expiry" },
] as const;

export type MarkdownTrigger = (typeof MARKDOWN_TRIGGER_OPTIONS)[number]["value"];

export const PACKAGING_OPTIONS = [
  { value: "store_bags", label: "Store provides bags" },
  { value: "customer_containers", label: "Customer must bring containers" },
] as const;

export type PackagingPolicy = (typeof PACKAGING_OPTIONS)[number]["value"];

export const NOTIFICATION_OPTIONS = [
  { value: "in_app", label: "In-app" },
  { value: "sms", label: "SMS" },
  { value: "email", label: "Email" },
] as const;

export type NotificationPreference =
  (typeof NOTIFICATION_OPTIONS)[number]["value"];

export interface RetailerStrategyFormState {
  retailDomain: RetailDomain;
  targetProductTypes: TargetProductTypeId[];
  pickupAllBusinessHours: boolean;
  pickupStart: string;
  pickupEnd: string;
  minBaseDiscountPct: number;
  maxMarkdownLimitPct: number;
  markdownTrigger: MarkdownTrigger;
  autoApproveDeals: boolean;
  packagingPolicy: PackagingPolicy;
  allergenAcknowledged: boolean;
  notificationPreference: NotificationPreference;
}
