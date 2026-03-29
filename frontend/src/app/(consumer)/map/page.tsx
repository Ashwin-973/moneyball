"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useLocationStore } from "@/store/locationStore";
import { useDealFeed, useMapPins } from "@/hooks/useDeals";
import CategoryPills from "@/components/consumer/CategoryPills";
import DealCard from "@/components/consumer/DealCard";
import RadiusModal from "@/components/consumer/RadiusModal";

const NearbyMap = dynamic(
  () => import("@/components/consumer/NearbyMap"),
  { ssr: false, loading: () => <div className="w-full h-full bg-gray-100 animate-shimmer" /> }
);

export default function MapPage() {
  const locationStore = useLocationStore();
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [showRadiusModal, setShowRadiusModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: mapData } = useMapPins({
    lat: locationStore.homeLat,
    lng: locationStore.homeLng,
    radius_km: locationStore.preferredRadius,
    category: activeCategory === "all" ? undefined : activeCategory,
  });

  const { data: storeFeed } = useDealFeed({
    lat: locationStore.homeLat,
    lng: locationStore.homeLng,
    radius_km: locationStore.preferredRadius,
    category: activeCategory === "all" ? undefined : activeCategory,
    sort_by: "near_you",
    page: 1,
  });

  if (!mounted) return null;

  if (!locationStore.hasLocation || !locationStore.homeLat || !locationStore.homeLng) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <span className="text-6xl mb-4">📍</span>
        <h2 className="text-xl font-bold text-charcoal">Location required</h2>
        <p className="text-gray-500 text-sm mt-1">Set your location in onboarding first.</p>
      </div>
    );
  }

  const pins = mapData?.pins || [];
  const feedItems = storeFeed?.items || [];
  const selectedPin = pins.find((p) => p.store_id === selectedStoreId);
  const selectedDeals = selectedStoreId
    ? feedItems.filter((d) => d.store_id === selectedStoreId)
    : feedItems.slice(0, 6);

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] relative">
      {/* Top controls */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-sm">
        <div className="flex items-center">
          <div className="flex-1">
            <CategoryPills activeCategory={activeCategory} onChange={setActiveCategory} />
          </div>
          <button
            onClick={() => setShowRadiusModal(true)}
            className="text-xs text-gray-600 font-medium px-3 py-1 rounded-full border border-gray-200 mr-3 whitespace-nowrap bg-white hover:bg-gray-50"
          >
            · {locationStore.preferredRadius}km
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1">
        <NearbyMap
          pins={pins}
          userLat={locationStore.homeLat}
          userLng={locationStore.homeLng}
          radius_km={locationStore.preferredRadius}
          onPinClick={setSelectedStoreId}
        />
      </div>

      {/* Bottom sheet */}
      <div className="fixed bottom-16 left-0 right-0 z-20 bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
        style={{ height: "220px" }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="px-4 pb-2">
          <h3 className="text-sm font-bold text-charcoal">
            {selectedPin
              ? `${selectedPin.store_name} — ${selectedPin.deal_count} deals`
              : `${mapData?.total_deals || 0} deals near you`}
          </h3>
        </div>

        {/* Horizontal scroll of deal cards */}
        <div className="flex overflow-x-auto gap-3 px-4 pb-4 no-scrollbar">
          {selectedDeals.length > 0 ? (
            selectedDeals.map((deal) => (
              <div key={deal.id} className="flex-shrink-0 w-44">
                <DealCard deal={deal} />
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm py-4">No deals found</p>
          )}
        </div>
      </div>

      {/* Radius modal */}
      <RadiusModal
        isOpen={showRadiusModal}
        onClose={() => setShowRadiusModal(false)}
        currentRadius={locationStore.preferredRadius}
        onSave={() => setShowRadiusModal(false)}
      />
    </div>
  );
}
