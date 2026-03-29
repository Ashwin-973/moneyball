"use client";

import { useCallback, useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  MARKDOWN_TRIGGER_OPTIONS,
  NOTIFICATION_OPTIONS,
  PACKAGING_OPTIONS,
  PRODUCT_TYPE_OPTIONS,
  RETAIL_DOMAINS,
  type MarkdownTrigger,
  type NotificationPreference,
  type PackagingPolicy,
  type RetailDomain,
  type TargetProductTypeId,
} from "@/types/strategy";

const MIN_SLIDER = 10;
const MAX_SLIDER_MIN = 50;
const MIN_SLIDER_MAX = 30;
const MAX_SLIDER_MAX = 90;

function SectionCard({
  step,
  title,
  subtitle,
  children,
}: {
  step: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-6 animate-fade-in">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-mint rounded-full mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-olive">
            Section {step}
          </span>
        </div>
        <h2 className="text-xl font-bold text-charcoal">{title}</h2>
        {subtitle ? (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function FieldLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-semibold text-charcoal mb-2"
    >
      {children}
      {required ? (
        <span className="text-primary ml-1" aria-hidden>
          *
        </span>
      ) : null}
    </label>
  );
}

function SelectField({
  id,
  value,
  onChange,
  options,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full rounded-xl border-gray-200 bg-gray-50/80 px-4 py-3 text-sm font-medium text-charcoal shadow-sm focus:border-primary focus:ring-primary"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export default function RetailerStrategyOnboarding() {
  const [retailDomain, setRetailDomain] = useState<RetailDomain>("bakery");
  const [targetProductTypes, setTargetProductTypes] = useState<
    TargetProductTypeId[]
  >(["baked_goods", "packaged_snacks"]);
  const [pickupAllBusinessHours, setPickupAllBusinessHours] = useState(false);
  const [pickupStart, setPickupStart] = useState("09:00");
  const [pickupEnd, setPickupEnd] = useState("18:00");

  const [minBaseDiscountPct, setMinBaseDiscountPct] = useState(20);
  const [maxMarkdownLimitPct, setMaxMarkdownLimitPct] = useState(60);
  const [markdownTrigger, setMarkdownTrigger] =
    useState<MarkdownTrigger>("24h_before");
  const [autoApproveDeals, setAutoApproveDeals] = useState(false);

  const [packagingPolicy, setPackagingPolicy] =
    useState<PackagingPolicy>("store_bags");
  const [allergenAcknowledged, setAllergenAcknowledged] = useState(false);
  const [notificationPreference, setNotificationPreference] =
    useState<NotificationPreference>("in_app");

  const [formError, setFormError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const toggleProductType = useCallback((id: TargetProductTypeId) => {
    setTargetProductTypes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const clampMaxToMin = useCallback((nextMin: number, currentMax: number) => {
    if (currentMax <= nextMin) return Math.min(MAX_SLIDER_MAX, nextMin + 1);
    return currentMax;
  }, []);

  const clampMinToMax = useCallback((nextMax: number, currentMin: number) => {
    if (nextMax <= currentMin) return Math.max(MIN_SLIDER, nextMax - 1);
    return currentMin;
  }, []);

  const onMinSlider = useCallback(
    (v: number) => {
      const next = Math.min(MAX_SLIDER_MIN, Math.max(MIN_SLIDER, v));
      setMinBaseDiscountPct(next);
      setMaxMarkdownLimitPct((m) => clampMaxToMin(next, m));
    },
    [clampMaxToMin]
  );

  const onMaxSlider = useCallback(
    (v: number) => {
      const next = Math.min(MAX_SLIDER_MAX, Math.max(MIN_SLIDER_MAX, v));
      setMaxMarkdownLimitPct(next);
      setMinBaseDiscountPct((m) => clampMinToMax(next, m));
    },
    [clampMinToMax]
  );

  const markdownRangeValid = useMemo(
    () => maxMarkdownLimitPct > minBaseDiscountPct,
    [maxMarkdownLimitPct, minBaseDiscountPct]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (targetProductTypes.length === 0) {
      setFormError("Select at least one target product type.");
      return;
    }
    if (!allergenAcknowledged) {
      setFormError("Please acknowledge allergen labeling responsibilities.");
      return;
    }
    if (!pickupAllBusinessHours) {
      if (!pickupStart || !pickupEnd) {
        setFormError("Set pickup start and end times, or use all business hours.");
        return;
      }
    }
    if (!markdownRangeValid) {
      setFormError("Maximum markdown must be greater than minimum base discount.");
      return;
    }

    api.post("/stores/me/policies", {
      min_discount_pct: minBaseDiscountPct,
      auto_approve: autoApproveDeals,
      fulfillment_mode: "pickup",
      hide_outside_hours: false,
    }).then(() => {
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 2500);
    }).catch(() => {
      setFormError("Failed to save strategy to backend.");
    });
  };

  return (
    <div className="max-w-3xl">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-mint rounded-full mb-3">
            <SlidersHorizontal className="w-4 h-4 text-olive" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-wider text-olive">
              Retailer setup
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-charcoal tracking-tight">
            Onboarding &amp; strategy
          </h1>
          <p className="mt-2 text-gray-500 max-w-xl">
            Configure how DealDrop prices urgency, pickup logistics, and platform
            safeguards for your store.
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-2">
        <SectionCard
          step={1}
          title="Store identity & logistics"
          subtitle="Tell us what you sell and when customers can collect."
        >
          <div className="space-y-6">
            <div>
              <FieldLabel htmlFor="retail-domain">Primary retail domain</FieldLabel>
              <SelectField
                id="retail-domain"
                value={retailDomain}
                onChange={(v) => setRetailDomain(v as RetailDomain)}
                options={RETAIL_DOMAINS}
              />
            </div>

            <div>
              <FieldLabel>Target product types</FieldLabel>
              <p className="text-xs text-gray-500 mb-3">
                Select all that apply — we use this to tune deal surfacing.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRODUCT_TYPE_OPTIONS.map((pt) => {
                  const checked = targetProductTypes.includes(pt.id);
                  return (
                    <label
                      key={pt.id}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors",
                        checked
                          ? "border-primary bg-primary/5"
                          : "border-gray-100 bg-gray-50/50 hover:border-gray-200"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleProductType(pt.id)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium text-charcoal">
                        {pt.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <FieldLabel>Pickup window</FieldLabel>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pickupAllBusinessHours}
                    onChange={(e) => setPickupAllBusinessHours(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-charcoal">
                    All business hours
                  </span>
                </label>
              </div>
              <div
                className={cn(
                  "mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4",
                  pickupAllBusinessHours && "opacity-50 pointer-events-none"
                )}
              >
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Start time
                  </span>
                  <input
                    type="time"
                    value={pickupStart}
                    onChange={(e) => setPickupStart(e.target.value)}
                    disabled={pickupAllBusinessHours}
                    className="mt-1 block w-full rounded-xl border-gray-200 bg-gray-50/80 px-4 py-3 text-sm font-medium text-charcoal shadow-sm focus:border-primary focus:ring-primary disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    End time
                  </span>
                  <input
                    type="time"
                    value={pickupEnd}
                    onChange={(e) => setPickupEnd(e.target.value)}
                    disabled={pickupAllBusinessHours}
                    className="mt-1 block w-full rounded-xl border-gray-200 bg-gray-50/80 px-4 py-3 text-sm font-medium text-charcoal shadow-sm focus:border-primary focus:ring-primary disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          step={2}
          title="Auto-markdown engine"
          subtitle="Define how aggressively we discount as expiry approaches."
        >
          <div className="space-y-8">
            <div>
              <div className="flex items-end justify-between gap-4 mb-2">
                <FieldLabel htmlFor="min-discount-slider">
                  Minimum base discount
                </FieldLabel>
                <span className="text-sm font-bold text-primary tabular-nums">
                  {minBaseDiscountPct}%
                </span>
              </div>
              <input
                id="min-discount-slider"
                type="range"
                min={MIN_SLIDER}
                max={MAX_SLIDER_MIN}
                step={1}
                value={minBaseDiscountPct}
                onChange={(e) => onMinSlider(Number(e.target.value))}
                className="w-full h-2 rounded-full bg-gray-200 accent-primary cursor-pointer"
              />
              <p className="text-xs text-gray-400 mt-1">
                Range {MIN_SLIDER}%–{MAX_SLIDER_MIN}% · default 20%
              </p>
            </div>

            <div>
              <div className="flex items-end justify-between gap-4 mb-2">
                <FieldLabel htmlFor="max-markdown-slider">
                  Maximum markdown limit
                </FieldLabel>
                <span className="text-sm font-bold text-primary tabular-nums">
                  {maxMarkdownLimitPct}%
                </span>
              </div>
              <input
                id="max-markdown-slider"
                type="range"
                min={MIN_SLIDER_MAX}
                max={MAX_SLIDER_MAX}
                step={1}
                value={maxMarkdownLimitPct}
                onChange={(e) => onMaxSlider(Number(e.target.value))}
                className="w-full h-2 rounded-full bg-gray-200 accent-primary cursor-pointer"
              />
              <p className="text-xs text-gray-400 mt-1">
                Range {MIN_SLIDER_MAX}%–{MAX_SLIDER_MAX}% · default 60%
              </p>
              {!markdownRangeValid ? (
                <p className="text-xs text-risk-high mt-2 font-medium">
                  Maximum must stay above the minimum base discount.
                </p>
              ) : null}
            </div>

            <div>
              <FieldLabel htmlFor="markdown-trigger">
                Markdown trigger window
              </FieldLabel>
              <SelectField
                id="markdown-trigger"
                value={markdownTrigger}
                onChange={(v) => setMarkdownTrigger(v as MarkdownTrigger)}
                options={MARKDOWN_TRIGGER_OPTIONS}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-4">
              <div>
                <p className="text-sm font-semibold text-charcoal">
                  Auto-approve deals
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  When on, qualifying listings publish without manual review.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={autoApproveDeals}
                onClick={() => setAutoApproveDeals((v) => !v)}
                className={cn(
                  "relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  autoApproveDeals ? "bg-primary" : "bg-gray-200"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition",
                    autoApproveDeals ? "translate-x-7" : "translate-x-0.5"
                  )}
                />
              </button>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          step={3}
          title="Platform safeguards"
          subtitle="Compliance and how we should reach you."
        >
          <div className="space-y-6">
            <div>
              <FieldLabel>Packaging policy</FieldLabel>
              <div className="space-y-3 mt-2">
                {PACKAGING_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors",
                      packagingPolicy === opt.value
                        ? "border-primary bg-primary/5"
                        : "border-gray-100 bg-gray-50/50 hover:border-gray-200"
                    )}
                  >
                    <input
                      type="radio"
                      name="packaging"
                      value={opt.value}
                      checked={packagingPolicy === opt.value}
                      onChange={() =>
                        setPackagingPolicy(opt.value as PackagingPolicy)
                      }
                      className="mt-0.5 border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-charcoal">
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allergenAcknowledged}
                  onChange={(e) => setAllergenAcknowledged(e.target.checked)}
                  required
                  className="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-charcoal">
                  <span className="font-semibold">
                    Allergen acknowledgment
                    <span className="text-primary ml-0.5">*</span>
                  </span>
                  <span className="block text-gray-500 mt-1 font-normal">
                    I confirm that allergen information on listings will be
                    accurate and updated when recipes change.
                  </span>
                </span>
              </label>
            </div>

            <div>
              <FieldLabel htmlFor="notification-pref">
                Notification preference
              </FieldLabel>
              <SelectField
                id="notification-pref"
                value={notificationPreference}
                onChange={(v) =>
                  setNotificationPreference(v as NotificationPreference)
                }
                options={NOTIFICATION_OPTIONS}
              />
            </div>
          </div>
        </SectionCard>

        {formError ? (
          <p
            className="text-sm font-medium text-risk-high px-1"
            role="alert"
          >
            {formError}
          </p>
        ) : null}

        {savedFlash ? (
          <p className="text-sm font-medium text-risk-low px-1" role="status">
            Strategy saved locally — connect the API to persist.
          </p>
        ) : null}

        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-2 pb-10">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Save strategy
          </button>
        </div>
      </form>
    </div>
  );
}
