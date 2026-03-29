"use client";

import { useRouter } from "next/navigation";
import { DealDetailOut } from "@/types/deal";
import { formatPrice } from "@/lib/utils";
import CountdownTimer from "@/components/ui/CountdownTimer";

interface DealCardProps {
  deal: DealDetailOut;
}

const CATEGORY_COLORS: Record<string, string> = {
  bakery: "bg-amber-100 text-amber-800",
  grocery: "bg-green-100 text-green-800",
  fmcg: "bg-blue-100 text-blue-800",
};

export default function DealCard({ deal }: DealCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/deals/${deal.id}`)}
      className="bg-white rounded-xl shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all duration-200 overflow-hidden"
    >
      {/* Image section */}
      <div className="relative h-40 w-full bg-gray-100">
        {deal.product_image_url ? (
          <img
            src={deal.product_image_url}
            alt={deal.product_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
            🏪
          </div>
        )}

        {/* Discount badge */}
        <span className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
          {deal.discount_pct}% OFF
        </span>

        {/* Urgency badge */}
        {deal.is_urgent && (
          <span className="absolute bottom-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            ⚡ {deal.hours_to_expiry !== null ? `${deal.hours_to_expiry}h left` : "Ends today"}
          </span>
        )}
      </div>

      {/* Content section */}
      <div className="p-3">
        {/* Store + distance */}
        <p className="text-xs text-gray-500 truncate">
          {deal.store.name} · {deal.store.distance_km}km
        </p>

        {/* Product name */}
        <h3 className="text-sm font-semibold text-charcoal mt-1 line-clamp-2 leading-tight">
          {deal.product_name}
        </h3>

        {/* Price row */}
        <div className="flex items-baseline mt-2">
          <span className="text-sm text-gray-400 line-through">
            {formatPrice(deal.original_price)}
          </span>
          <span className="text-lg font-bold text-primary ml-2">
            {formatPrice(deal.deal_price)}
          </span>
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between mt-2">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              CATEGORY_COLORS[deal.store.category] || "bg-gray-100 text-gray-700"
            }`}
          >
            {deal.store.category}
          </span>
          <div className="flex items-center gap-2">
            <CountdownTimer expiryDate={deal.expiry_date} />
            {deal.quantity_available <= 5 && (
              <span className="text-xs text-red-500 font-medium">
                Only {deal.quantity_available} left
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
