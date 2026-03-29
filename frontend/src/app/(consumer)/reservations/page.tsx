"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ReservationStatus } from "@/types/reservation";
import { useMyReservations } from "@/hooks/useReservations";
import ReservationCard from "@/components/consumer/ReservationCard";

type TabKey = "active" | "past";

export default function ConsumerReservationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("active");
  const { data, isLoading, isError, refetch } = useMyReservations();

  // Pull-to-refresh on focus
  useEffect(() => {
    const handler = () => refetch();
    window.addEventListener("focus", handler);
    return () => window.removeEventListener("focus", handler);
  }, [refetch]);

  useEffect(() => {
    document.title = "My Reservations — DealDrop";
    return () => { document.title = "DealDrop"; };
  }, []);

  const all = data?.items ?? [];

  const activeItems = all.filter(
    (r) =>
      r.status === ReservationStatus.pending ||
      r.status === ReservationStatus.confirmed
  );
  // pending first, then confirmed
  const sortedActive = [
    ...activeItems.filter((r) => r.status === ReservationStatus.pending),
    ...activeItems.filter((r) => r.status === ReservationStatus.confirmed),
  ];

  const pastItems = all
    .filter(
      (r) =>
        r.status === ReservationStatus.completed ||
        r.status === ReservationStatus.cancelled
    )
    .sort(
      (a, b) =>
        new Date(b.reserved_at).getTime() - new Date(a.reserved_at).getTime()
    );

  const currentItems = activeTab === "active" ? sortedActive : pastItems;

  return (
    <div className="max-w-lg mx-auto px-4 pb-24 animate-fade-in">
      {/* Header */}
      <div className="pt-6 pb-4">
        <h1 className="text-2xl font-bold text-charcoal">My Reservations</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track your holds and pickups
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
        {(["active", "past"] as TabKey[]).map((tab) => {
          const count = tab === "active" ? sortedActive.length : pastItems.length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg capitalize transition-all ${
                activeTab === tab
                  ? "bg-white text-orange-500 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
              {!isLoading && count > 0 && (
                <span
                  className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab
                      ? "bg-orange-100 text-orange-600"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-xl animate-shimmer bg-gray-100" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="text-center py-16">
          <span className="text-4xl">⚠️</span>
          <p className="text-sm text-gray-500 mt-3">
            Failed to load reservations
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 text-sm font-medium text-orange-500 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty states */}
      {!isLoading && !isError && currentItems.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">
            {activeTab === "active" ? "🔖" : "📋"}
          </div>
          <h3 className="text-lg font-bold text-charcoal mb-2">
            {activeTab === "active"
              ? "No active reservations"
              : "No past reservations"}
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {activeTab === "active"
              ? "Reserve a deal to see it here. Holds are free for 45 minutes!"
              : "Your completed and cancelled reservations will appear here."}
          </p>
          {activeTab === "active" && (
            <button
              onClick={() => router.push("/deals")}
              className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors shadow-sm"
            >
              Browse Deals
            </button>
          )}
        </div>
      )}

      {/* List */}
      {!isLoading && !isError && currentItems.length > 0 && (
        <div className="space-y-3">
          {currentItems.map((r) => (
            <ReservationCard
              key={r.id}
              reservation={r}
              onCancelled={() => refetch()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
