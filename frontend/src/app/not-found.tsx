import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="max-w-md w-full text-center animate-fade-in">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-50 flex items-center justify-center mb-6">
          <SearchX className="w-8 h-8 text-primary" />
        </div>

        <h1 className="text-6xl font-black text-charcoal mb-2">404</h1>
        <h2 className="text-xl font-semibold text-charcoal mb-2">
          Page not found
        </h2>
        <p className="text-gray-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-card font-medium hover:bg-primary-hover transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
