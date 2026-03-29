"use client";

import { cn } from "@/lib/utils";

interface CategoryPillsProps {
  activeCategory: string;
  onChange: (category: string) => void;
}

const CATEGORIES = [
  { key: "all", label: "All", icon: "" },
  { key: "bakery", label: "Bakery", icon: "🍞" },
  { key: "grocery", label: "Grocery", icon: "🛒" },
  { key: "fmcg", label: "FMCG", icon: "🧴" },
];

export default function CategoryPills({ activeCategory, onChange }: CategoryPillsProps) {
  return (
    <div className="flex overflow-x-auto no-scrollbar gap-2 py-2 px-4">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onChange(cat.key)}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
            activeCategory === cat.key
              ? "bg-primary text-white shadow-sm"
              : "bg-white text-charcoal border border-gray-200 hover:border-gray-300"
          )}
        >
          {cat.icon && <span>{cat.icon}</span>}
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  );
}
