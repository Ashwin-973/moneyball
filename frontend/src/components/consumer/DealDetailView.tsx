"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { DealDetailOut } from "@/types/deal";
import { Reservation } from "@/types/reservation";
import { formatPrice } from "@/lib/utils";
import CountdownTimer from "@/components/ui/CountdownTimer";
import { HoldCountdown } from "@/components/ui/CountdownTimer";
import { useAuth } from "@/hooks/useAuth";
import { useCreateReservation } from "@/hooks/useReservations";

interface DealDetailViewProps {
  deal: DealDetailOut;
}

const CATEGORY_COLORS: Record<string, string> = {
  bakery: "bg-amber-100 text-amber-800",
  grocery: "bg-green-100 text-green-800",
  fmcg: "bg-blue-100 text-blue-800",
};

// ── Reserve Success Modal ──────────────────────────────────────────────────

function ReserveSuccessModal({
  deal,
  reservation,
  onClose,
}: {
  deal: DealDetailOut;
  reservation: Reservation;
  onClose: () => void;
}) {
  const router = useRouter();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // micro-delay so CSS transition fires
    const id = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(id);
  }, []);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${deal.store.lat},${deal.store.lng}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className={`bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transition-all duration-300 ${
          animate ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        {/* Top accent */}
        <div className="h-2 w-full bg-gradient-to-r from-orange-400 to-orange-500" />

        <div className="p-6 text-center">
          {/* Checkmark */}
          <div
            className={`mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4 transition-transform duration-500 ${
              animate ? "scale-100" : "scale-0"
            }`}
          >
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-charcoal">Reserved!</h2>
          <p className="text-gray-500 text-sm mt-1">
            <span className="font-semibold text-charcoal">
              {deal.product_name}
            </span>{" "}
            at{" "}
            <span className="font-semibold text-charcoal">
              {deal.store.name}
            </span>
          </p>

          {/* Hold countdown */}
          <div className="mt-6 p-4 bg-orange-50 rounded-2xl">
            <p className="text-xs text-gray-500 mb-2 font-medium">
              Your item is held for
            </p>
            <HoldCountdown
              holdExpiresAt={reservation.hold_expires_at}
              large
            />
          </div>

          {/* Store info */}
          <div className="mt-4 text-left p-3 bg-gray-50 rounded-xl">
            <p className="text-xs font-semibold text-charcoal mb-0.5">
              📍 {deal.store.name}
            </p>
            <p className="text-xs text-gray-500">{deal.store.address}</p>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-orange-500 hover:underline mt-1 inline-block"
            >
              Get directions →
            </a>
          </div>

          {/* CTA buttons */}
          <div className="mt-5 space-y-2">
            <button
              onClick={() => router.push("/reservations")}
              className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition-colors"
            >
              View My Reservations
            </button>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-gray-500 text-sm hover:text-charcoal transition-colors"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main DealDetailView ────────────────────────────────────────────────────

export default function DealDetailView({ deal }: DealDetailViewProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [showDetails, setShowDetails] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successReservation, setSuccessReservation] =
    useState<Reservation | null>(null);

  const { mutate: createReservation, isPending: isReserving } =
    useCreateReservation();

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
    setErrorMsg(null);

    if (!isAuthenticated) {
      router.push(`/login?redirect=/deals/${deal.id}`);
      return;
    }

    createReservation(
      { deal_id: deal.id, quantity: 1 },
      {
        onSuccess: (reservation) => {
          setSuccessReservation(reservation);
        },
        onError: (err: any) => {
          const detail =
            err?.response?.data?.detail ||
            err?.message ||
            "Something went wrong. Please try again.";
          setErrorMsg(String(detail));
        },
      }
    );
  };

  // Stock bar
  const stockPercent =
    deal.risk_score_at_listing > 0
      ? Math.min(
          100,
          Math.round(
            (deal.quantity_available / deal.risk_score_at_listing) * 100
          )
        )
      : null;

  const isAlreadyReservedMsg =
    errorMsg?.toLowerCase().includes("already have") ?? false;

  return (
    <>
      <div className="pb-24 animate-fade-in">
        {/* Image header */}
        <div className="relative h-60 w-full bg-gray-100">
          {deal.product_image_url ? (
            <img
              src={deal.product_image_url}
              alt={deal.product_name}
              className="h-full object-cover mx-auto"
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
                CATEGORY_COLORS[deal.store.category] ||
                "bg-gray-100 text-gray-700"
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
          <h1 className="text-2xl font-bold text-charcoal mt-3">
            {deal.product_name}
          </h1>

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
              <span className="font-medium">
                {deal.quantity_available} units left
              </span>
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

          {/* Error message */}
          {errorMsg && (
            <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100">
              <p className="text-sm text-red-600">{errorMsg}</p>
              {isAlreadyReservedMsg && (
                <button
                  onClick={() => router.push("/reservations")}
                  className="text-xs font-medium text-orange-500 hover:underline mt-1"
                >
                  View your reservations →
                </button>
              )}
            </div>
          )}

          {/* Store card */}
          <div className="mt-4 rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏬</span>
              <span className="font-semibold text-charcoal">
                {deal.store.name}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  CATEGORY_COLORS[deal.store.category] ||
                  "bg-gray-100 text-gray-700"
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
                <span className="font-medium">Expiry Date:</span>{" "}
                {deal.expiry_date}
              </p>
              {deal.batch_number && (
                <p>
                  <span className="font-medium">Batch Number:</span>{" "}
                  {deal.batch_number}
                </p>
              )}
              <p>
                <span className="font-medium">Deal Type:</span>{" "}
                {deal.deal_type.charAt(0).toUpperCase() +
                  deal.deal_type.slice(1)}
              </p>
            </div>
          )}
        </div>

        {/* Sticky bottom bar */}
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 p-4 z-40 safe-area-bottom">
          <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
            <span className="text-xl font-bold text-charcoal">
              {formatPrice(deal.deal_price)}
            </span>
            <button
              id="reserve-deal-btn"
              onClick={handleReserve}
              disabled={isReserving}
              className={`flex-1 max-w-xs py-3 rounded-xl font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 ${
                isAuthenticated
                  ? "bg-primary text-white hover:bg-primary-hover"
                  : "bg-gray-800 text-white hover:bg-gray-900"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isReserving ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Reserving…
                </>
              ) : isAuthenticated ? (
                "Reserve Now — Free Hold 45min"
              ) : (
                "Login to Reserve"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success modal */}
      {successReservation && (
        <ReserveSuccessModal
          deal={deal}
          reservation={successReservation}
          onClose={() => setSuccessReservation(null)}
        />
      )}
    </>
  );
}
