"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="max-w-md w-full text-center animate-fade-in">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>

        <h2 className="text-2xl font-bold text-charcoal mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-500 mb-8">
          An unexpected error occurred. Please try again or return to the home
          page.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-charcoal text-white rounded-card font-medium hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 border border-gray-200 text-charcoal rounded-card font-medium hover:bg-gray-50 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
