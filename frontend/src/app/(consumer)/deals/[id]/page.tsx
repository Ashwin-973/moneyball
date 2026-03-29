"use client";

import { useParams, useRouter } from "next/navigation";
import { useDealDetail } from "@/hooks/useDeals";
import DealDetailView from "@/components/consumer/DealDetailView";
import { useEffect } from "react";

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: deal, isLoading, isError } = useDealDetail(id);

  // Dynamic document title
  useEffect(() => {
    if (deal) {
      document.title = `${deal.product_name} — ${deal.discount_pct}% off at ${deal.store.name}`;
    }
    return () => {
      document.title = "DealDrop";
    };
  }, [deal]);

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="h-60 w-full animate-shimmer" />
        <div className="p-4 space-y-3">
          <div className="h-6 w-24 rounded-full animate-shimmer" />
          <div className="h-8 w-3/4 rounded animate-shimmer" />
          <div className="h-10 w-1/2 rounded animate-shimmer" />
          <div className="h-4 w-full rounded animate-shimmer" />
          <div className="h-32 w-full rounded-xl animate-shimmer" />
        </div>
      </div>
    );
  }

  if (isError || !deal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
        <span className="text-6xl mb-4">🏪</span>
        <h2 className="text-xl font-bold text-charcoal mb-2">
          This deal is no longer available
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          It may have expired or been fully reserved.
        </p>
        <button
          onClick={() => router.push("/deals")}
          className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-colors"
        >
          Browse other deals
        </button>
      </div>
    );
  }

  return <DealDetailView deal={deal} />;
}
