"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DealDetailOut } from "@/types/deal";
import { formatPrice } from "@/lib/utils";
import CountdownTimer from "@/components/ui/CountdownTimer";
import { useAuth } from "@/hooks/useAuth";

interface DealDetailViewProps {
  deal: DealDetailOut;
}

const CATEGORY_COLORS: Record<string, string> = {
  bakery: "bg-amber-100 text-amber-800",
  grocery: "bg-green-100 text-green-800",
  fmcg: "bg-blue-100 text-blue-800",
};

export default function DealDetailView({ deal }: DealDetailViewProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [showDetails, setShowDetails] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${deal.product_name} — ${deal.discount_pct}% off`,
          url,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied!");
    }
  };

  const handleReserve = () => {
    if (!isAuthenticated) {
      alert("Login to reserve");
      return;
    }
    alert("Reservation coming soon!");
  };

  // Stock bar width (use risk_score as proxy for original qty)
  const stockPercent = deal.risk_score_at_listing > 0
    ? Math.min(100, Math.round((deal.quantity_available / deal.risk_score_at_listing) * 100))
    : null;

  return (
    <div className="pb-24 animate-fade-in">
      {/* Image header */}
      <div className="relative h-60 w-full bg-gray-100">
        {deal.product_image_url ? (
          <img
            src={deal.product_image_url}
            alt={deal.product_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">
            🏪
          </div>
        )}

        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm font-medium text-charcoal shadow-sm hover:bg-white transition-colors"
        >
          ← Back
        </button>

        <button
          onClick={handleShare}
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center shadow-sm hover:bg-white transition-colors"
        >
          📤
        </button>
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Category + urgency */}
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              CATEGORY_COLORS[deal.store.category] || "bg-gray-100 text-gray-700"
            }`}
          >
            {deal.store.category}
          </span>
          {deal.is_urgent && (
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-red-100 text-red-600">
              ⚡ Urgent
            </span>
          )}
        </div>

        {/* Product name */}
        <h1 className="text-2xl font-bold text-charcoal mt-3">{deal.product_name}</h1>

        {/* Price block */}
        <div className="flex items-baseline gap-3 mt-3">
          <span className="text-gray-400 line-through text-sm">
            MRP {formatPrice(deal.original_price)}
          </span>
          <span className="text-3xl font-bold text-primary">
            {formatPrice(deal.deal_price)}
          </span>
          <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
            {deal.discount_pct}% OFF
          </span>
        </div>

        {/* Countdown */}
        <div className="mt-3">
          <CountdownTimer expiryDate={deal.expiry_date} />
        </div>

        {/* Stock bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Stock remaining</span>
            <span className="font-medium">{deal.quantity_available} units left</span>
          </div>
          {stockPercent !== null && (
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${stockPercent}%` }}
              />
            </div>
          )}
        </div>

        {/* Store card */}
        <div className="mt-4 rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏬</span>
            <span className="font-semibold text-charcoal">{deal.store.name}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                CATEGORY_COLORS[deal.store.category] || "bg-gray-100 text-gray-700"
              }`}
            >
              {deal.store.category}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{deal.store.address}</p>
          {deal.store.distance_km > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">
              📍 {deal.store.distance_km} km from your location
            </p>
          )}
        </div>

        {/* Product details (expandable) */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-4 flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-charcoal transition-colors"
        >
          Product Details {showDetails ? "▴" : "▾"}
        </button>
        {showDetails && (
          <div className="mt-2 p-3 bg-gray-50 rounded-xl text-sm text-gray-600 space-y-1">
            <p>
              <span className="font-medium">Expiry Date:</span> {deal.expiry_date}
            </p>
            {deal.batch_number && (
              <p>
                <span className="font-medium">Batch Number:</span> {deal.batch_number}
              </p>
            )}
            <p>
              <span className="font-medium">Deal Type:</span>{" "}
              {deal.deal_type.charAt(0).toUpperCase() + deal.deal_type.slice(1)}
            </p>
          </div>
        )}
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 p-4 z-40 safe-area-bottom">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <span className="text-xl font-bold text-charcoal">
            {formatPrice(deal.deal_price)}
          </span>
          <button
            onClick={handleReserve}
            className="w-48 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover transition-colors shadow-sm"
            title={!isAuthenticated ? "Login to reserve" : undefined}
          >
            Reserve Now
          </button>
        </div>
      </div>
    </div>
  );
}
