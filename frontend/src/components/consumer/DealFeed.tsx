"use client";

import { useState, useCallback } from "react";
import { useDealFeed } from "@/hooks/useDeals";
import { FeedTab, DealDetailOut } from "@/types/deal";
import FeedTabs from "./FeedTabs";
import CategoryPills from "./CategoryPills";
import DealCard from "./DealCard";

interface DealFeedProps {
  lat: number;
  lng: number;
  radius_km: number;
}

export default function DealFeed({ lat, lng, radius_km }: DealFeedProps) {
  const [activeTab, setActiveTab] = useState<FeedTab>("near_you");
  const [activeCategory, setActiveCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [allItems, setAllItems] = useState<DealDetailOut[]>([]);

  const { data, isLoading, isError, refetch, isFetching } = useDealFeed({
    lat,
    lng,
    radius_km,
    category: activeCategory === "all" ? undefined : activeCategory,
    sort_by: activeTab,
    page,
  });

  // Accumulate items for load-more behavior
  const displayItems = page === 1 ? (data?.items || []) : [...allItems, ...(data?.items || [])];

  const handleTabChange = useCallback((tab: FeedTab) => {
    setActiveTab(tab);
    setPage(1);
    setAllItems([]);
  }, []);

  const handleCategoryChange = useCallback((cat: string) => {
    setActiveCategory(cat);
    setPage(1);
    setAllItems([]);
  }, []);

  const handleLoadMore = useCallback(() => {
    setAllItems(displayItems);
    setPage((p) => p + 1);
  }, [displayItems]);

  const total = data?.total || 0;
  const pageSize = data?.page_size || 20;
  const hasMore = total > page * pageSize;

  return (
    <div className="flex flex-col h-full">
      <FeedTabs activeTab={activeTab} onChange={handleTabChange} />
      <CategoryPills activeCategory={activeCategory} onChange={handleCategoryChange} />

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-xl animate-shimmer" />
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-gray-600 font-medium">Couldn&apos;t load deals</p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-primary text-sm font-medium hover:underline"
            >
              Tap to retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && displayItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-6xl mb-4">🏪</span>
            <h3 className="text-lg font-bold text-charcoal">No deals near you right now</h3>
            <p className="text-gray-500 text-sm mt-1 max-w-xs">
              Try expanding your radius or check back later
            </p>
          </div>
        )}

        {/* Deal grid */}
        {!isLoading && displayItems.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mt-4">
              {displayItems.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleLoadMore}
                  disabled={isFetching}
                  className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-charcoal hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {isFetching ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                      Loading…
                    </span>
                  ) : (
                    "Load more deals"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
