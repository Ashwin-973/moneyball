"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocationStore } from "@/store/locationStore";
import { Pencil } from "lucide-react";
import DealFeed from "@/components/consumer/DealFeed";
import RadiusModal from "@/components/consumer/RadiusModal";

export default function ConsumerDealsPage() {
  const router = useRouter();
  const locationStore = useLocationStore();
  const [mounted, setMounted] = useState(false);
  const [showRadiusModal, setShowRadiusModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!locationStore.hasLocation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
        <span className="text-6xl mb-4">📍</span>
        <h2 className="text-2xl font-bold text-charcoal mb-2">
          Set your location first
        </h2>
        <p className="text-gray-500 max-w-md mb-6">
          We need your location to show nearby deals.
        </p>
        <button
          onClick={() => router.push("/onboarding")}
          className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-colors"
        >
          Set location
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] animate-fade-in">
      {/* Location header */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <button
          onClick={() => setShowRadiusModal(true)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-charcoal transition-colors group"
        >
          <span>📍</span>
          <span className="font-medium">
            {locationStore.label ||
              `${locationStore.homeLat?.toFixed(4)}, ${locationStore.homeLng?.toFixed(4)}`}{" "}
            · {locationStore.preferredRadius}km
          </span>
          <Pencil className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary transition-colors" />
        </button>
      </div>

      {/* Deal feed */}
      <DealFeed
        lat={locationStore.homeLat!}
        lng={locationStore.homeLng!}
        radius_km={locationStore.preferredRadius}
      />

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
