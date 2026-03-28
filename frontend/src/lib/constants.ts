/**
 * Application constants.
 */

export const CATEGORIES = [
  { id: 1, name: "Bakery", slug: "bakery", icon: "🍞" },
  { id: 2, name: "Grocery", slug: "grocery", icon: "🛒" },
  { id: 3, name: "FMCG", slug: "fmcg", icon: "🧴" },
] as const;

export const FEED_TABS = [
  "Near You",
  "Ending Soon",
  "Best Discounts",
  "Most Urgent",
] as const;

export type FeedTab = (typeof FEED_TABS)[number];

export const RADIUS_OPTIONS = [1, 3, 5] as const;
export const DEFAULT_RADIUS = 3;
