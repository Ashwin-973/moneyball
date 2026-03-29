"use client";

import { useEffect, useState } from "react";
import { ReservationStatus } from "@/types/reservation";
import { useStoreReservations } from "@/hooks/useReservations";
import ReservationInbox from "@/components/retailer/ReservationInbox";

function StatPill({
  emoji,
  count,
  label,
  color,
}: {
  emoji: string;
  count: number;
  label: string;
  color: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-3 py-2.5 ${color} flex-1 min-w-0`}
    >
      <span className="text-lg">{emoji}</span>
      <div className="min-w-0">
        <p className="text-lg font-bold leading-tight">{count}</p>
        <p className="text-xs font-medium opacity-75 truncate">{label}</p>
      </div>
    </div>
  );
}

export default function RetailerReservationsPage() {
  const { data, isLoading, refetch } = useStoreReservations();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const id = setInterval(async () => {
      await refetch();
      setLastUpdated(new Date());
    }, 30_000);
    return () => clearInterval(id);
  }, [refetch]);

  useEffect(() => {
    document.title = "Reservation Inbox — DealDrop";
    return () => { document.title = "DealDrop"; };
  }, []);

  const all = data?.items ?? [];
  const today = new Date().toDateString();

  const pendingCount = all.filter(
    (r) => r.status === ReservationStatus.pending
  ).length;
  const confirmedCount = all.filter(
    (r) => r.status === ReservationStatus.confirmed
  ).length;
  const completedToday = all.filter(
    (r) =>
      r.status === ReservationStatus.completed &&
      r.completed_at &&
      new Date(r.completed_at).toDateString() === today
  ).length;
  const cancelledToday = all.filter(
    (r) =>
      r.status === ReservationStatus.cancelled &&
      new Date(r.reserved_at).toDateString() === today
  ).length;

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="max-w-2xl mx-auto px-4 pb-10 animate-fade-in">
      {/* Header */}
      <div className="pt-6 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal">
              Reservation Inbox
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Auto-refreshes every 30s ·{" "}
              <span className="text-gray-500">
                Last updated {formatTime(lastUpdated)}
              </span>
            </p>
          </div>
          <button
            onClick={async () => {
              await refetch();
              setLastUpdated(new Date());
            }}
            className="text-xs font-medium text-orange-500 border border-orange-200 rounded-lg px-3 py-1.5 hover:bg-orange-50 transition-colors mt-1"
          >
            ↺ Refresh
          </button>
        </div>
      </div>

      {/* Stats row */}
      {!isLoading && (
        <div className="grid grid-cols-4 gap-2 mb-6">
          <StatPill
            emoji="🟡"
            count={pendingCount}
            label="Pending"
            color="bg-yellow-50 text-yellow-700"
          />
          <StatPill
            emoji="🟢"
            count={confirmedCount}
            label="Confirmed"
            color="bg-green-50 text-green-700"
          />
          <StatPill
            emoji="✓"
            count={completedToday}
            label="Today"
            color="bg-gray-50 text-gray-700"
          />
          <StatPill
            emoji="↩"
            count={cancelledToday}
            label="Cancelled"
            color="bg-red-50 text-red-600"
          />
        </div>
      )}

      {/* Inbox */}
      <ReservationInbox />
    </div>
  );
}
