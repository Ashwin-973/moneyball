"use client";

import { useLocationStore } from "@/store/locationStore";
import { useEffect, useState } from "react";

export default function ConsumerDealsPage() {
  const locationStore = useLocationStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Avoid hydration mismatch
  }

  if (!locationStore.hasLocation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <h2 className="text-2xl font-bold text-charcoal mb-2">Location Required</h2>
        <p className="text-gray-500 max-w-md">
          Please complete onboarding first to view deals near you.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      {/* Hero section */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-charcoal tracking-tight">
          The pulse of{" "}
          <span className="text-primary">hyperlocal</span> flash deals.
        </h1>
        <p className="mt-2 text-gray-500 max-w-lg">
          Real-time biological urgency meets precision retail. Experience the
          next evolution of local shopping.
        </p>
        <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-lg inline-block text-sm border border-blue-100">
          Showing deals within <strong>{locationStore.preferredRadius}km</strong> of{" "}
          <span className="font-mono">
            {locationStore.label || `${locationStore.homeLat}, ${locationStore.homeLng}`}
          </span>
        </div>
      </div>

      {/* Placeholder */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-mint rounded-full mb-4">
          <div className="w-2 h-2 rounded-full bg-olive animate-pulse" />
          <span className="text-sm font-medium text-olive">Phase 5</span>
        </div>
        <h2 className="text-xl font-bold text-charcoal mb-2">
          Consumer Marketplace
        </h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Geo-based deal feed with Near You, Ending Soon, Best Discounts, and
          Most Urgent tabs. Powered by PostGIS spatial queries.
        </p>

        {/* Preview pills */}
        <div className="flex flex-wrap gap-2 justify-center mt-6">
          {["Near You", "Ending Soon", "Best Discounts", "Most Urgent"].map(
            (tab) => (
              <span
                key={tab}
                className="px-4 py-2 bg-gray-50 rounded-full text-sm font-medium text-gray-400 border border-gray-100"
              >
                {tab}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
