"use client";

import { useState } from "react";
import Link from "next/link";
import { Reservation, ReservationStatus } from "@/types/reservation";
import { formatPrice } from "@/lib/utils";
import { timeAgo } from "@/lib/utils";
import { HoldCountdown } from "@/components/ui/CountdownTimer";
import { useCancelReservation } from "@/hooks/useReservations";

interface ReservationCardProps {
  reservation: Reservation;
  onCancelled?: () => void;
}

function StatusBadge({
  reservation,
  onExpire,
}: {
  reservation: Reservation;
  onExpire: () => void;
}) {
  const status = reservation.status;

  if (status === ReservationStatus.pending) {
    const isExpired =
      new Date(reservation.hold_expires_at).getTime() <= Date.now();
    if (isExpired) {
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 font-medium">
          ✕ Expired
        </span>
      );
    }
    return (
      <div className="flex flex-col items-end gap-1">
        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold">
          ⏳ Pending
        </span>
        <HoldCountdown
          holdExpiresAt={reservation.hold_expires_at}
          onExpire={onExpire}
        />
      </div>
    );
  }

  if (status === ReservationStatus.confirmed) {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
        ✅ Confirmed
      </span>
    );
  }

  if (status === ReservationStatus.completed) {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
        ✓ Picked up
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-600 font-medium">
      ✕ Cancelled
    </span>
  );
}

export default function ReservationCard({
  reservation,
  onCancelled,
}: ReservationCardProps) {
  const [isExpired, setIsExpired] = useState(
    reservation.status === ReservationStatus.pending &&
      new Date(reservation.hold_expires_at).getTime() <= Date.now()
  );
  const [showCancelModal, setShowCancelModal] = useState(false);
  const { mutate: cancelReservation, isPending: isCancelling } =
    useCancelReservation();

  const isActive =
    reservation.status === ReservationStatus.pending ||
    reservation.status === ReservationStatus.confirmed;

  const handleConfirmCancel = () => {
    cancelReservation(reservation.id, {
      onSuccess: () => {
        setShowCancelModal(false);
        onCancelled?.();
      },
    });
  };

  // If the hold has expired and it was pending — show muted card
  if (
    isExpired &&
    reservation.status === ReservationStatus.pending
  ) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 opacity-60">
        <p className="text-sm text-gray-500 font-medium">
          This reservation expired
        </p>
        <Link
          href="/deals"
          className="text-xs text-orange-500 hover:underline mt-1 inline-block"
        >
          Browse deals again →
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-shadow hover:shadow-md">
        {/* Main row */}
        <div className="flex items-start gap-3">
          {/* Thumbnail */}
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {reservation.deal.product_image_url ? (
              <img
                src={reservation.deal.product_image_url}
                alt={reservation.deal.product_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">
                🛍️
              </div>
            )}
          </div>

          {/* Center info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-charcoal text-sm truncate leading-tight">
              {reservation.deal.product_name}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {reservation.store.name}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Reserved {timeAgo(reservation.reserved_at)}
            </p>
          </div>

          {/* Status badge */}
          <div className="flex-shrink-0">
            <StatusBadge
              reservation={reservation}
              onExpire={() => setIsExpired(true)}
            />
          </div>
        </div>

        {/* Price + qty row */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
          <span className="text-base font-bold text-orange-500">
            {formatPrice(reservation.deal.deal_price)}
          </span>
          <span className="text-xs text-gray-400 line-through">
            {formatPrice(reservation.deal.original_price)}
          </span>
          <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
            -{reservation.deal.discount_pct}%
          </span>
          <span className="ml-auto text-xs text-gray-500">
            {reservation.quantity} unit{reservation.quantity !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Action row — pending or confirmed only */}
        {isActive && (
          <div className="flex items-center gap-2 mt-3">
            <Link
              href={`/deals/${reservation.deal_id}`}
              className="text-xs font-medium text-orange-500 hover:text-orange-600 border border-orange-200 rounded-lg px-3 py-1.5 transition-colors"
            >
              View Deal
            </Link>
            <button
              onClick={() => setShowCancelModal(true)}
              className="text-xs font-medium text-red-500 hover:text-red-600 border border-red-200 rounded-lg px-3 py-1.5 transition-colors"
            >
              Cancel Reservation
            </button>
          </div>
        )}
      </div>

      {/* Cancel confirmation modal */}
      {showCancelModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowCancelModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-charcoal mb-2">
              Cancel Reservation?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure? Your hold will be released and the item will become
              available to others.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Keep it
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isCancelling ? "Cancelling…" : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
