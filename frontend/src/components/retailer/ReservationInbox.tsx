"use client";

import { useState } from "react";
import { Reservation, ReservationStatus } from "@/types/reservation";
import { timeAgo } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import { HoldCountdown } from "@/components/ui/CountdownTimer";
import {
  useStoreReservations,
  useUpdateReservationStatus,
} from "@/hooks/useReservations";

type TabKey = "pending" | "confirmed" | "completed" | "cancelled";

const TABS: { key: TabKey; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const EMPTY_MESSAGES: Record<TabKey, string> = {
  pending: "No pending reservations right now",
  confirmed: "No confirmed reservations",
  completed: "No completed pickups yet",
  cancelled: "No cancelled reservations",
};

function ConsumerAvatar({ reservationId }: { reservationId: string }) {
  const last4 = reservationId.slice(-4).toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
      <span className="text-white text-xs font-bold">{last4.slice(0, 2)}</span>
    </div>
  );
}

function ReservationRow({ reservation }: { reservation: Reservation }) {
  const { mutate: updateStatus, isPending } = useUpdateReservationStatus();
  const [actioned, setActioned] = useState(false);

  const handleAction = (status: "confirmed" | "completed" | "cancelled") => {
    setActioned(true);
    updateStatus(
      { reservationId: reservation.id, update: { status } },
      {
        onError: () => setActioned(false),
      }
    );
  };

  const isReadOnly =
    reservation.status === ReservationStatus.completed ||
    reservation.status === ReservationStatus.cancelled;

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        isReadOnly
          ? "bg-gray-50 border-gray-100 opacity-70"
          : "bg-white border-gray-100 shadow-sm hover:shadow-md"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <ConsumerAvatar reservationId={reservation.id} />

        {/* Center info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-charcoal text-sm">
            Customer #{reservation.consumer_id.slice(-4).toUpperCase()}
          </p>
          <p className="text-xs text-gray-500 truncate mt-0.5">
            {reservation.deal.product_name}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Reserved {timeAgo(reservation.reserved_at)}
            {" · "}
            <span className="font-medium text-charcoal">
              {reservation.quantity} unit{reservation.quantity !== 1 ? "s" : ""}
            </span>
            {" · "}
            <span className="font-semibold text-orange-500">
              {formatPrice(reservation.deal.deal_price)}
            </span>
          </p>

          {/* Hold timer — pending only */}
          {reservation.status === ReservationStatus.pending && (
            <div className="mt-1.5">
              <HoldCountdown holdExpiresAt={reservation.hold_expires_at} />
            </div>
          )}

          {/* Completed/cancelled label */}
          {reservation.status === ReservationStatus.completed &&
            reservation.completed_at && (
              <p className="text-xs text-gray-400 mt-1">
                ✓ Completed {timeAgo(reservation.completed_at)}
              </p>
            )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          {reservation.status === ReservationStatus.pending && (
            <>
              <button
                onClick={() => handleAction("confirmed")}
                disabled={isPending || actioned}
                className="text-xs font-semibold text-white bg-green-500 hover:bg-green-600 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                ✓ Confirm
              </button>
              <button
                onClick={() => handleAction("cancelled")}
                disabled={isPending || actioned}
                className="text-xs font-semibold text-red-500 border border-red-200 hover:bg-red-50 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                ✕ Reject
              </button>
            </>
          )}

          {reservation.status === ReservationStatus.confirmed && (
            <button
              onClick={() => handleAction("completed")}
              disabled={isPending || actioned}
              className="text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg px-3 py-2 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              Mark as Picked Up
            </button>
          )}

          {reservation.status === ReservationStatus.completed && (
            <span className="text-xs text-gray-400 font-medium">
              ✓ Completed
            </span>
          )}

          {reservation.status === ReservationStatus.cancelled && (
            <span className="text-xs text-red-400 font-medium">
              ✕ Cancelled
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReservationInbox() {
  const [activeTab, setActiveTab] = useState<TabKey>("pending");
  const { data, isLoading, isError } = useStoreReservations();

  const reservations = data?.items ?? [];

  const byStatus = (status: TabKey) =>
    reservations.filter((r) => r.status === status);

  const currentItems = byStatus(activeTab);

  return (
    <div>
      {/* Tab row */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {TABS.map((tab) => {
          const count = byStatus(tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === tab.key
                  ? "bg-white text-orange-500 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={`ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] ${
                    activeTab === tab.key
                      ? "bg-orange-500 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl animate-shimmer bg-gray-100"
            />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-center text-sm text-gray-500 py-8">
          Failed to load reservations. Please refresh.
        </p>
      )}

      {!isLoading && !isError && currentItems.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-gray-500 text-sm">{EMPTY_MESSAGES[activeTab]}</p>
        </div>
      )}

      {!isLoading && !isError && currentItems.length > 0 && (
        <div className="space-y-3">
          {currentItems.map((r) => (
            <ReservationRow key={r.id} reservation={r} />
          ))}
        </div>
      )}
    </div>
  );
}
