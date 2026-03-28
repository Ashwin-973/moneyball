import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, differenceInHours, differenceInMinutes, isPast, parseISO } from "date-fns";

/**
 * Merge Tailwind classes safely.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Indian Rupee price. ₹1,234.56
 */
export function formatPrice(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/**
 * Format an expiry date string into a human-readable countdown.
 * "2 days left" / "4h 30m left" / "Expired"
 */
export function formatExpiry(dateStr: string): string {
  const expiry = typeof dateStr === "string" ? parseISO(dateStr) : new Date(dateStr);

  if (isPast(expiry)) return "Expired";

  const hoursLeft = differenceInHours(expiry, new Date());

  if (hoursLeft >= 48) {
    const days = Math.floor(hoursLeft / 24);
    return `${days} days left`;
  }

  if (hoursLeft >= 1) {
    const mins = differenceInMinutes(expiry, new Date()) % 60;
    return `${hoursLeft}h ${mins}m left`;
  }

  const minsLeft = differenceInMinutes(expiry, new Date());
  return `${minsLeft}m left`;
}

/**
 * Relative time: "3 minutes ago"
 */
export function timeAgo(dateStr: string): string {
  const date = typeof dateStr === "string" ? parseISO(dateStr) : new Date(dateStr);
  return formatDistanceToNow(date, { addSuffix: true });
}
