import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header band */}
          <div className="bg-charcoal px-8 py-10 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-white/10 backdrop-blur flex items-center justify-center mb-4">
              <span className="text-xl font-black text-white">D</span>
            </div>
            <h1 className="text-xl font-bold text-white">DealDrop</h1>
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-primary mt-1">
              Save More. Waste Less.
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-10">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full mb-4">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">Phase 1</span>
              </div>
              <h2 className="text-lg font-semibold text-charcoal mb-2">
                Login — built in Phase 1
              </h2>
              <p className="text-sm text-gray-500">
                Authentication with JWT, email/password, and role-based routing.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 pb-8 text-center">
            <p className="text-sm text-gray-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-primary font-medium hover:text-primary-hover transition-colors"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
