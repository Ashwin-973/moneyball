"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        let start = 0;
        const step = Math.ceil(to / 60);
        const id = setInterval(() => {
          start += step;
          if (start >= to) {
            setVal(to);
            clearInterval(id);
          } else {
            setVal(start);
          }
        }, 24);
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to]);

  return (
    <span ref={ref}>
      {val.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0D0D0D]/95 backdrop-blur-xl border-b border-white/5 py-3"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-[#F4500B] flex items-center justify-center shadow-lg shadow-[#F4500B]/30 group-hover:scale-105 transition-transform">
            <span className="text-white font-black text-base select-none">D</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            Deal<span className="text-[#F4500B]">Drop</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: "How It Works", href: "#how-it-works" },
            { label: "For Retailers", href: "#retailers" },
            { label: "For Consumers", href: "#consumers" },
            { label: "Impact", href: "#impact" },
          ].map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="text-sm text-white/60 hover:text-white transition-colors font-medium"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors px-4 py-2"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold bg-[#F4500B] hover:bg-[#C73D08] text-white px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-[#F4500B]/25 hover:shadow-[#F4500B]/40 hover:scale-[1.02]"
          >
            Get Started Free
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`w-6 h-0.5 bg-white transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
          />
          <span className={`w-6 h-0.5 bg-white transition-all ${menuOpen ? "opacity-0" : ""}`} />
          <span
            className={`w-6 h-0.5 bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0D0D0D]/98 border-t border-white/5 px-6 py-6 space-y-4">
          {[
            { label: "How It Works", href: "#how-it-works" },
            { label: "For Retailers", href: "#retailers" },
            { label: "For Consumers", href: "#consumers" },
            { label: "Impact", href: "#impact" },
          ].map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="block text-white/70 hover:text-white font-medium py-2"
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </a>
          ))}
          <div className="pt-4 flex flex-col gap-3">
            <Link
              href="/login"
              className="text-center text-sm font-medium text-white border border-white/20 rounded-xl py-2.5"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-center text-sm font-semibold bg-[#F4500B] text-white rounded-xl py-2.5"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0D0D0D]">
      {/* Radial glow backgrounds */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-[#F4500B]/8 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[10%] w-[500px] h-[500px] rounded-full bg-[#F4500B]/5 blur-[100px]" />
        <div className="absolute top-[30%] left-[60%] w-[300px] h-[300px] rounded-full bg-[#2D3A2E]/40 blur-[80px]" />
      </div>

      {/* Grid texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="max-w-4xl">
          {/* Label pill */}
          <div className="inline-flex items-center gap-2 bg-[#F4500B]/10 border border-[#F4500B]/20 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#F4500B] animate-pulse" />
            <span className="text-[#F4500B] text-sm font-semibold tracking-wide">
              Hyperlocal Flash Sales · Zero Food Waste
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
            Save More.
            <br />
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #F4500B 0%, #ff7a45 50%, #F4500B 100%)",
              }}
            >
              Waste Less.
            </span>
            <br />
            <span className="text-white/80">Shop Smarter.</span>
          </h1>

          {/* Sub-headline */}
          <p className="text-lg sm:text-xl text-white/50 max-w-2xl leading-relaxed mb-10">
            DealDrop connects local retailers with nearby consumers through
            real-time flash sales on near-expiry inventory — turning waste into
            value, one deal at a time.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              id="hero-consumer-cta"
              href="/register"
              className="group inline-flex items-center gap-2 bg-[#F4500B] hover:bg-[#C73D08] text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200 shadow-xl shadow-[#F4500B]/30 hover:shadow-[#F4500B]/50 hover:scale-[1.03] text-base"
            >
              Find Deals Near Me
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              id="hero-retailer-cta"
              href="/register?role=retailer"
              className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-white/80 hover:text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200 backdrop-blur-sm text-base hover:bg-white/5"
            >
              I&apos;m a Retailer
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-6 mt-12">
            <div className="flex -space-x-2">
              {["#F4500B", "#2D3A2E", "#4CAF50", "#FF9800"].map((c, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border-2 border-[#0D0D0D] flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: c }}
                >
                  {["A", "R", "S", "M"][i]}
                </div>
              ))}
            </div>
            <p className="text-white/40 text-sm">
              <span className="text-white font-semibold">2,400+</span> deals
              saved this month
            </p>
          </div>
        </div>
      </div>

      {/* Floating deal cards (decorative) */}
      <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 z-10 space-y-4 opacity-80">
        {[
          {
            name: "Artisan Sourdough",
            store: "The Bread Box",
            disc: "50%",
            price: "₹49",
            mrp: "₹99",
            tag: "bakery",
            color: "#F4500B",
            time: "2h left",
          },
          {
            name: "Greek Yogurt Pack",
            store: "Fresh & More",
            disc: "35%",
            price: "₹65",
            mrp: "₹100",
            tag: "grocery",
            color: "#4CAF50",
            time: "4h left",
          },
          {
            name: "Oat Granola Bar ×6",
            store: "NutriMart",
            disc: "25%",
            price: "₹75",
            mrp: "₹100",
            tag: "fmcg",
            color: "#2196F3",
            time: "1d left",
          },
        ].map((deal, i) => (
          <div
            key={i}
            className="w-64 bg-[#141414] border border-white/10 rounded-2xl p-4 shadow-2xl"
            style={{
              transform: `translateX(${i % 2 === 0 ? "0" : "16px"})`,
              animationDelay: `${i * 0.2}s`,
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: `${deal.color}20`, color: deal.color }}
              >
                {deal.tag}
              </span>
              <span className="text-xs font-bold text-[#F4500B] bg-[#F4500B]/10 px-2 py-1 rounded-full">
                -{deal.disc}
              </span>
            </div>
            <p className="text-white font-semibold text-sm leading-tight">{deal.name}</p>
            <p className="text-white/40 text-xs mt-0.5">{deal.store}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[#F4500B] font-bold">{deal.price}</span>
              <span className="text-white/30 text-xs line-through">{deal.mrp}</span>
              <span className="ml-auto text-white/30 text-xs">⏱ {deal.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll indicator */}
      <a
        href="#how-it-works"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 hover:text-white/60 transition-colors"
      >
        <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
        <div className="w-5 h-8 border border-white/20 rounded-full flex items-start justify-center p-1.5">
          <div className="w-1 h-2 bg-white/40 rounded-full animate-bounce" />
        </div>
      </a>
    </section>
  );
}

// ── Stats bar ─────────────────────────────────────────────────────────────────
function StatsBar() {
  return (
    <section className="bg-[#F4500B] py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: 2400, suffix: "+", label: "Deals Saved Monthly" },
            { value: 340, suffix: "+", label: "Local Partner Stores" },
            { value: 18, suffix: "T", label: "Food Waste Prevented (kg)" },
            { value: 72, suffix: "%", label: "Avg. Consumer Savings" },
          ].map(({ value, suffix, label }) => (
            <div key={label} className="text-center">
              <p className="text-4xl font-black text-white tracking-tight">
                <Counter to={value} suffix={suffix} />
              </p>
              <p className="text-white/70 text-sm font-medium mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How it works ──────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Retailer lists near-expiry inventory",
      desc: "Upload products manually or via CSV. Our AI risk engine auto-scores each item and suggests the optimal markdown discount.",
      icon: "📦",
    },
    {
      n: "02",
      title: "Deal goes live on the marketplace",
      desc: "Deals are geo-filtered and surfaced to consumers within your radius — sorted by urgency, discount, or proximity.",
      icon: "⚡",
    },
    {
      n: "03",
      title: "Consumer reserves with a 45-min hold",
      desc: "One tap reserves the item. A free 45-minute countdown hold is placed — no payment needed upfront.",
      icon: "🔖",
    },
    {
      n: "04",
      title: "Pick up. Everyone wins.",
      desc: "Consumer saves money. Retailer recovers revenue. Less food in landfills.",
      icon: "🤝",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="bg-[#0D0D0D] py-28 relative overflow-hidden"
    >
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-[#F4500B]/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <span className="text-[#F4500B] text-sm font-semibold tracking-widest uppercase">
            The Flow
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-black text-white tracking-tight">
            How DealDrop Works
          </h2>
          <p className="mt-4 text-white/40 text-lg max-w-xl mx-auto">
            A frictionless loop from listing to pickup — built for speed,
            built for trust.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map(({ n, title, desc, icon }, i) => (
            <div
              key={n}
              className="group relative bg-[#141414] border border-white/5 rounded-3xl p-8 hover:border-[#F4500B]/30 transition-all duration-300 hover:bg-[#181818]"
            >
              {/* Step number */}
              <span className="text-6xl font-black text-white/5 absolute top-6 right-6 select-none group-hover:text-[#F4500B]/10 transition-colors">
                {n}
              </span>

              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-[#F4500B]/10 flex items-center justify-center text-2xl mb-6 group-hover:bg-[#F4500B]/20 transition-colors">
                {icon}
              </div>

              <h3 className="text-white font-bold text-lg leading-tight mb-3">
                {title}
              </h3>
              <p className="text-white/40 text-sm leading-relaxed">{desc}</p>

              {/* Connector arrow (hidden on last) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                  <div className="w-6 h-px bg-[#F4500B]/30" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-l-4 border-l-[#F4500B]/30" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Retailers section ─────────────────────────────────────────────────────────
function ForRetailers() {
  const features = [
    {
      icon: "🤖",
      title: "AI Risk Scoring",
      desc: "Our intelligent engine scores each product 0–100 based on days-to-expiry, stock levels, and category — then auto-suggests the ideal markdown.",
    },
    {
      icon: "📊",
      title: "Revenue Recovery Dashboard",
      desc: "Track every ₹ recovered from near-expiry stock. See units saved, deals closed, and revenue trends — all in one clean view.",
    },
    {
      icon: "📋",
      title: "CSV Bulk Upload",
      desc: "Import your entire inventory in seconds. Our parser validates, scores, and queues everything for listing with zero manual effort.",
    },
    {
      icon: "⚙️",
      title: "Smart Store Policies",
      desc: "Set minimum discount thresholds, auto-approve rules, and fulfillment windows. DealDrop runs your markdown strategy on autopilot.",
    },
    {
      icon: "🔔",
      title: "Reservation Inbox",
      desc: "View incoming holds, confirm pickups, and mark completions — all from a streamlined mobile-first inbox that refreshes every 30 seconds.",
    },
    {
      icon: "🗺️",
      title: "Geo-Targeted Reach",
      desc: "Your deals surface only to consumers within your set radius, using PostGIS-powered proximity scoring for hyperlocal accuracy.",
    },
  ];

  return (
    <section
      id="retailers"
      className="bg-[#111] py-28 relative overflow-hidden"
    >
      <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-[#F4500B]/3 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-start gap-16">
          {/* Left text */}
          <div className="lg:w-2/5 lg:sticky lg:top-32">
            <span className="text-[#F4500B] text-sm font-semibold tracking-widest uppercase">
              For Retailers
            </span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Turn waste into
              <br />
              <span className="text-[#F4500B]">recovered revenue.</span>
            </h2>
            <p className="mt-5 text-white/50 text-lg leading-relaxed">
              DealDrop gives bakeries, grocery stores, and FMCG retailers a
              zero-friction way to clear near-expiry inventory before it becomes
              a write-off.
            </p>

            <div className="mt-8 p-6 bg-[#F4500B]/5 border border-[#F4500B]/15 rounded-2xl">
              <p className="text-white font-bold text-2xl">
                ₹1.2L+
              </p>
              <p className="text-white/50 text-sm mt-1">
                Average monthly revenue recovered per retailer
              </p>
            </div>

            <Link
              href="/register?role=retailer"
              className="mt-8 inline-flex items-center gap-2 bg-[#F4500B] hover:bg-[#C73D08] text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-[#F4500B]/30 text-sm hover:scale-[1.02]"
            >
              Start as a Retailer
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Right feature grid */}
          <div className="lg:w-3/5 grid sm:grid-cols-2 gap-5">
            {features.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="group bg-[#141414] border border-white/5 rounded-2xl p-6 hover:border-[#F4500B]/20 hover:bg-[#181818] transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-[#F4500B]/10 flex items-center justify-center text-xl mb-4 group-hover:bg-[#F4500B]/20 transition-colors">
                  {icon}
                </div>
                <h3 className="text-white font-semibold text-base mb-2">
                  {title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Consumers section ─────────────────────────────────────────────────────────
function ForConsumers() {
  const perks = [
    {
      icon: "📍",
      title: "Hyperlocal Feed",
      desc: "Deals within your radius, sorted by proximity, discount size, or urgency — your city's best flash sales, always fresh.",
    },
    {
      icon: "⏱️",
      title: "45-Minute Free Hold",
      desc: "Reserve any deal with one tap, no payment required. Your item is held for 45 minutes while you walk over.",
    },
    {
      icon: "🗺️",
      title: "Live Map View",
      desc: "See every active deal pinned on a live map. Tap any store to browse their current offers.",
    },
    {
      icon: "💸",
      title: "Real Savings",
      desc: "Discounts from 15% up to 70% off MRP — on fresh bakery items, packed groceries, and FMCG products.",
    },
  ];

  return (
    <section id="consumers" className="bg-[#0D0D0D] py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <span className="text-[#F4500B] text-sm font-semibold tracking-widest uppercase">
            For Consumers
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-black text-white tracking-tight">
            Fresh deals. Real savings.
          </h2>
          <p className="mt-4 text-white/40 text-lg max-w-xl mx-auto">
            Stop paying full price. DealDrop puts the best hyper-discounted
            local food deals in your pocket.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-16">
          {perks.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="group flex items-start gap-5 bg-[#141414] border border-white/5 rounded-2xl p-6 hover:border-[#F4500B]/20 hover:bg-[#181818] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-[#F4500B]/10 flex items-center justify-center text-2xl flex-shrink-0 group-hover:bg-[#F4500B]/20 transition-colors">
                {icon}
              </div>
              <div>
                <h3 className="text-white font-semibold text-base mb-1.5">
                  {title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Categories */}
        <div className="border-t border-white/5 pt-12">
          <p className="text-center text-white/30 text-sm font-medium mb-8 uppercase tracking-widest">
            Categories Available
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { label: "🥐 Bakery", color: "amber" },
              { label: "🥦 Grocery", color: "green" },
              { label: "🧴 FMCG", color: "blue" },
              { label: "🧀 Dairy", color: "yellow" },
              { label: "🥤 Beverages", color: "purple" },
              { label: "🍱 Prepared Meals", color: "orange" },
            ].map(({ label }) => (
              <span
                key={label}
                className="bg-[#1A1A1A] border border-white/8 text-white/60 hover:text-white hover:border-white/20 rounded-full px-5 py-2.5 text-sm font-medium cursor-default transition-all"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-[#F4500B] hover:bg-[#C73D08] text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-[#F4500B]/30 hover:scale-[1.02]"
          >
            Browse Deals Near Me
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Impact / Mission ──────────────────────────────────────────────────────────
function Impact() {
  return (
    <section id="impact" className="relative py-28 overflow-hidden bg-[#111]">
      {/* Full bleed background graphic */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D0D0D] via-[#111] to-[#0D0D0D]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F4500B]/20 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-[#F4500B] text-sm font-semibold tracking-widest uppercase">
              Our Mission
            </span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-black text-white tracking-tight leading-[1.1]">
              India wastes{" "}
              <span className="text-[#F4500B]">₹92,000 crore</span>
              <br />
              in food annually.
            </h2>
            <p className="mt-6 text-white/50 text-lg leading-relaxed">
              DealDrop exists to make a dent in that number. Every deal
              reserved is food that didn&apos;t go to landfill, and revenue a
              retailer didn&apos;t lose. We believe sustainable commerce begins
              at the neighbourhood level.
            </p>
            <p className="mt-4 text-white/40 text-base leading-relaxed">
              We&apos;re building the infrastructure for hyperlocal circular
              economy — one flash sale at a time.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-[#F4500B] hover:bg-[#C73D08] text-white font-semibold px-7 py-3.5 rounded-xl transition-all text-sm shadow-lg shadow-[#F4500B]/20 hover:scale-[1.02]"
              >
                Join the Movement
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 border border-white/15 hover:border-white/30 text-white/60 hover:text-white font-medium px-7 py-3.5 rounded-xl transition-all text-sm"
              >
                See How It Works
              </a>
            </div>
          </div>

          {/* Impact stat cards */}
          <div className="grid grid-cols-2 gap-5">
            {[
              {
                icon: "🌱",
                value: "18T",
                label: "kg Food Waste Prevented",
                sub: "And counting",
              },
              {
                icon: "🏪",
                value: "340+",
                label: "Local Stores Onboarded",
                sub: "Bakeries, grocers & more",
              },
              {
                icon: "👥",
                value: "12K+",
                label: "Consumers Activated",
                sub: "Across 8 cities",
              },
              {
                icon: "₹",
                value: "4.1Cr",
                label: "Revenue Recovered",
                sub: "For retailers",
              },
            ].map(({ icon, value, label, sub }) => (
              <div
                key={label}
                className="bg-[#141414] border border-white/5 rounded-2xl p-6 hover:border-[#F4500B]/15 transition-all"
              >
                <span className="text-3xl">{icon}</span>
                <p className="text-3xl font-black text-white mt-3 tracking-tight">
                  {value}
                </p>
                <p className="text-white/60 text-sm font-semibold mt-1">
                  {label}
                </p>
                <p className="text-white/25 text-xs mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────
function Testimonials() {
  const reviews = [
    {
      quote:
        "DealDrop changed how I shop for groceries. I save ₹2,000–₹3,000 a month on stuff that's genuinely fresh — just close to expiry.",
      name: "Priya S.",
      role: "Consumer · Bengaluru",
      initial: "P",
      color: "#F4500B",
    },
    {
      quote:
        "We used to throw out ₹15,000 in baked goods every week. Since DealDrop, that number is almost zero. The auto-markdown feature is a game changer.",
      name: "Ramesh B.",
      role: "Owner · The Bread Box, Pune",
      initial: "R",
      color: "#4CAF50",
    },
    {
      quote:
        "The 45-minute hold is brilliant. I can pop over after work without worrying the deal will be gone. No app has done this before.",
      name: "Anika M.",
      role: "Consumer · Mumbai",
      initial: "A",
      color: "#2196F3",
    },
    {
      quote:
        "Onboarding took 10 minutes. CSV upload pulled in all 200 of my products. First deal went live the same evening.",
      name: "Suresh K.",
      role: "Manager · SpiceWorld Grocery",
      initial: "S",
      color: "#FF9800",
    },
  ];

  return (
    <section className="bg-[#0D0D0D] py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-[#F4500B] text-sm font-semibold tracking-widest uppercase">
            Stories
          </span>
          <h2 className="mt-3 text-4xl font-black text-white tracking-tight">
            Real people. Real savings.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {reviews.map(({ quote, name, role, initial, color }) => (
            <div
              key={name}
              className="bg-[#141414] border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-all"
            >
              {/* Quote mark */}
              <span
                className="text-5xl font-black leading-none"
                style={{ color: `${color}40` }}
              >
                &ldquo;
              </span>
              <p className="text-white/70 text-base leading-relaxed mt-2 mb-6">
                {quote}
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ background: color }}
                >
                  {initial}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{name}</p>
                  <p className="text-white/35 text-xs">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA Banner ────────────────────────────────────────────────────────────────
function CTABanner() {
  return (
    <section className="bg-[#F4500B] py-24 relative overflow-hidden">
      {/* Background graphic */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-black/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Ready to save more
          <br />
          and waste less?
        </h2>
        <p className="mt-5 text-white/70 text-lg">
          Join thousands of consumers and retailers already using DealDrop.
          Free to join. No credit card needed.
        </p>
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link
            href="/register"
            className="bg-white hover:bg-gray-50 text-[#F4500B] font-bold px-8 py-4 rounded-2xl transition-all duration-200 shadow-xl hover:scale-[1.02] text-base"
          >
            I&apos;m a Consumer →
          </Link>
          <Link
            href="/register?role=retailer"
            className="bg-transparent border-2 border-white/40 hover:border-white/70 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-200 text-base backdrop-blur-sm hover:bg-white/5"
          >
            I&apos;m a Retailer →
          </Link>
        </div>
        <p className="mt-6 text-white/50 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-white underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}

// ── Tech Stack / Trust ────────────────────────────────────────────────────────
function TrustStrip() {
  return (
    <section className="bg-[#111] border-y border-white/5 py-10">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-white/25 text-xs font-semibold tracking-widest uppercase mb-8">
          Built with enterprise-grade technology
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
          {[
            { name: "Next.js 14", icon: "▲" },
            { name: "FastAPI", icon: "⚡" },
            { name: "PostgreSQL + PostGIS", icon: "🐘" },
            { name: "SQLAlchemy 2.0", icon: "🔗" },
            { name: "TanStack Query", icon: "♾️" },
            { name: "JWT Auth", icon: "🔐" },
          ].map(({ name, icon }) => (
            <div key={name} className="flex items-center gap-2 text-white/30 hover:text-white/50 transition-colors">
              <span className="text-lg">{icon}</span>
              <span className="text-sm font-medium">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  const faqs = [
    {
      q: "Is DealDrop free for consumers?",
      a: "Yes, completely free. Browse deals, reserve items, and pick up — zero fees, ever.",
    },
    {
      q: "How does the 45-minute hold work?",
      a: "When you reserve a deal, we decrement the stock immediately and hold it for you for 45 minutes. If you don't pick up, the hold auto-releases and the item is re-listed.",
    },
    {
      q: "What types of products can retailers list?",
      a: "Any perishable or near-expiry product — baked goods, dairy, packaged snacks, beverages, prepared meals, and FMCG items.",
    },
    {
      q: "How does DealDrop calculate discounts?",
      a: "Our AI risk engine evaluates days-to-expiry, stock quantity, and product category, then scores each product 0–100. That score maps to a tiered discount suggestion (e.g. bakery items at risk score 85+ get 50% off).",
    },
    {
      q: "Can I list products in bulk?",
      a: "Yes. Retailers can upload a CSV with all product details — name, MRP, cost price, expiry date, quantity, and batch number. Our parser handles the rest.",
    },
    {
      q: "Is there a minimum order value?",
      a: "No. Every deal is priced individually. Reserve one yogurt or twenty granola bars — no minimums.",
    },
  ];

  return (
    <section className="bg-[#0D0D0D] py-24">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-[#F4500B] text-sm font-semibold tracking-widest uppercase">
            FAQ
          </span>
          <h2 className="mt-3 text-4xl font-black text-white tracking-tight">
            Common questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map(({ q, a }, i) => (
            <div
              key={q}
              className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left group"
              >
                <span className="text-white font-medium text-base group-hover:text-white/90 pr-4">
                  {q}
                </span>
                <span
                  className={`text-[#F4500B] text-xl flex-shrink-0 transition-transform duration-200 ${
                    open === i ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </button>
              {open === i && (
                <div className="px-6 pb-6">
                  <p className="text-white/50 text-sm leading-relaxed">{a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[#F4500B] flex items-center justify-center">
                <span className="text-white font-black text-base">D</span>
              </div>
              <span className="text-white font-bold text-xl">
                Deal<span className="text-[#F4500B]">Drop</span>
              </span>
            </Link>
            <p className="text-white/35 text-sm leading-relaxed max-w-xs">
              Hyperlocal flash-sale marketplace connecting retailers and
              consumers to reduce food waste and save money.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href="mailto:hello@dealdrop.in"
                className="text-white/30 hover:text-white/70 text-sm transition-colors"
              >
                hello@dealdrop.in
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-4">
              Product
            </p>
            <ul className="space-y-3">
              {[
                { label: "Browse Deals", href: "/deals" },
                { label: "Map View", href: "/map" },
                { label: "My Reservations", href: "/reservations" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-white/40 hover:text-white text-sm transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Retailers */}
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-4">
              Retailers
            </p>
            <ul className="space-y-3">
              {[
                { label: "Retailer Dashboard", href: "/dashboard" },
                { label: "Manage Products", href: "/products" },
                { label: "Active Deals", href: "/retailer-deals" },
                { label: "Reservations Inbox", href: "/retailer-reservations" },
                { label: "Store Settings", href: "/settings" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-white/40 hover:text-white text-sm transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-4">
              Company
            </p>
            <ul className="space-y-3">
              {[
                { label: "About DealDrop", href: "#impact" },
                { label: "Sign Up", href: "/register" },
                { label: "Log In", href: "/login" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-white/40 hover:text-white text-sm transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-xs">
            © {new Date().getFullYear()} DealDrop. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-white/20 hover:text-white/50 text-xs transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-white/20 hover:text-white/50 text-xs transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-white/20 hover:text-white/50 text-xs transition-colors">
              Cookie Policy
            </a>
          </div>
          <p className="text-white/15 text-xs">
            Built with 🧡 for Indian retailers
          </p>
        </div>
      </div>
    </footer>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="bg-[#0D0D0D] min-h-screen">
      <Navbar />
      <Hero />
      <StatsBar />
      <HowItWorks />
      <ForRetailers />
      <ForConsumers />
      <Impact />
      <Testimonials />
      <TrustStrip />
      <CTABanner />
      <FAQ />
      <Footer />
    </div>
  );
}
