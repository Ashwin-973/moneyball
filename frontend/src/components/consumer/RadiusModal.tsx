"use client";

import { useState } from "react";
import { useLocationStore } from "@/store/locationStore";
import { useUpdateConsumerProfile } from "@/hooks/useConsumerProfile";

interface RadiusModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRadius: number;
  onSave: (radius: number) => void;
}

const RADIUS_OPTIONS = [
  { km: 1, label: "1 km", desc: "Walk distance" },
  { km: 3, label: "3 km", desc: "Bike distance" },
  { km: 5, label: "5 km", desc: "Short drive" },
];

export default function RadiusModal({
  isOpen,
  onClose,
  currentRadius,
  onSave,
}: RadiusModalProps) {
  const [selected, setSelected] = useState(currentRadius);
  const locationStore = useLocationStore();
  const updateProfile = useUpdateConsumerProfile();

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        preferred_radius_km: selected,
      });
      locationStore.setRadius(selected);
      onSave(selected);
      onClose();
    } catch {
      // Silently fail — profile update is best-effort
      locationStore.setRadius(selected);
      onSave(selected);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-sm animate-slide-up">
        <h3 className="text-lg font-bold text-charcoal mb-4">
          Change your search radius
        </h3>

        <div className="flex flex-col gap-3">
          {RADIUS_OPTIONS.map((opt) => (
            <button
              key={opt.km}
              onClick={() => setSelected(opt.km)}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                selected === opt.km
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-left">
                <span className="text-lg font-bold text-charcoal">{opt.label}</span>
                <p className="text-xs text-gray-500">{opt.desc}</p>
              </div>
              {selected === opt.km && (
                <span className="text-primary text-lg">✓</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={updateProfile.isPending}
            className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {updateProfile.isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
