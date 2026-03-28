export default function RetailerDashboardPage() {
  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-charcoal tracking-tight">
          Good morning 👋
        </h1>
        <p className="mt-1 text-gray-500">
          Real-time performance metrics for your hyperlocal flash listings.
        </p>
      </div>

      {/* Stat cards preview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "At Risk Products", value: "—", accent: "border-l-primary" },
          { label: "Active Deals", value: "—", accent: "border-l-olive" },
          { label: "Pending Reservations", value: "—", accent: "border-l-yellow-500" },
          { label: "Revenue Recovered", value: "₹0.00", accent: "border-l-risk-low" },
        ].map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "bg-white rounded-xl border border-gray-100 p-5 shadow-sm",
              `border-l-4 ${stat.accent}`
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              {stat.label}
            </p>
            <p className="text-2xl font-bold text-charcoal">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Placeholder */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-mint rounded-full mb-4">
          <div className="w-2 h-2 rounded-full bg-olive animate-pulse" />
          <span className="text-sm font-medium text-olive">Phase 4</span>
        </div>
        <h2 className="text-xl font-bold text-charcoal mb-2">
          Retailer Dashboard
        </h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Risk scoring engine, auto-markdown suggestions, active deal
          management, and reservation inbox.
        </p>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
