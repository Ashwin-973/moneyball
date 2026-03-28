"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types/auth";

export default function HomePage() {
  const router = useRouter();
  const { hydrate, isAuthenticated, isLoading, user } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (user?.role === UserRole.retailer) {
      router.replace("/dashboard");
    } else {
      router.replace("/deals");
    }
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface">
      {/* Logo */}
      <div className="animate-fade-in flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-charcoal flex items-center justify-center shadow-lg">
            <span className="text-2xl font-black text-white tracking-tight">
              D
            </span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary animate-pulse-glow" />
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-charcoal tracking-tight">
            DealDrop
          </h1>
          <p className="text-sm font-medium tracking-[0.2em] uppercase text-primary mt-1">
            Save More. Waste Less.
          </p>
        </div>

        {/* Spinner */}
        <div className="mt-4">
          <div className="w-8 h-8 border-3 border-gray-200 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}
