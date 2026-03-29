"use client";

import { cn } from "@/lib/utils";
import { FeedTab } from "@/types/deal";

interface FeedTabsProps {
  activeTab: FeedTab;
  onChange: (tab: FeedTab) => void;
}

const TABS: { key: FeedTab; label: string; icon: string }[] = [
  { key: "near_you", label: "Near You", icon: "📍" },
  { key: "ending_soon", label: "Ending Soon", icon: "⏱" },
  { key: "best_discounts", label: "Best Discounts", icon: "🏷" },
  { key: "most_urgent", label: "Most Urgent", icon: "🔥" },
];

export default function FeedTabs({ activeTab, onChange }: FeedTabsProps) {
  return (
    <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
      <div className="flex overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-3 text-sm whitespace-nowrap transition-all duration-200 border-b-2 min-w-fit",
              activeTab === tab.key
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-gray-500 hover:text-gray-800"
            )}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
