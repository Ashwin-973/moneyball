"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/auth";
import LandingPage from "@/components/landing/LandingPage";

export default function RootPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === UserRole.retailer) {
        router.push("/dashboard");
      } else {
        router.push("/deals");
      }
    }
    // If not authenticated → fall through and render LandingPage below
  }, [isLoading, isAuthenticated, user, router]);

  // Still hydrating auth — show the landing page immediately (no flash)
  if (isLoading || (isAuthenticated && user)) {
    // While redirecting for authenticated users, show nothing
    // (avoids flash of landing page for logged-in users)
    if (isAuthenticated && user) return null;
  }

  // Unauthenticated → show landing page
  return <LandingPage />;
}
