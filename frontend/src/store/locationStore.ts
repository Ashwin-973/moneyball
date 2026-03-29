import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ConsumerProfile } from "@/types/consumer";

interface LocationState {
  homeLat: number | null;
  homeLng: number | null;
  workLat: number | null;
  workLng: number | null;
  preferredRadius: number;
  preferredCategories: string[];
  label: string | null;
  hasLocation: boolean;
  source: "gps" | "manual" | null;

  setHomeLocation: (lat: number, lng: number, label?: string) => void;
  setWorkLocation: (lat: number, lng: number) => void;
  setRadius: (km: number) => void;
  setCategories: (cats: string[]) => void;
  syncFromProfile: (profile: ConsumerProfile) => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      homeLat: null,
      homeLng: null,
      workLat: null,
      workLng: null,
      preferredRadius: 3,
      preferredCategories: ["bakery", "grocery", "fmcg"],
      label: null,
      hasLocation: false,
      source: null,

      setHomeLocation: (lat, lng, label) =>
        set({
          homeLat: lat,
          homeLng: lng,
          label: label || null,
          hasLocation: true,
          source: label ? "manual" : "gps",
        }),

      setWorkLocation: (lat, lng) =>
        set({
          workLat: lat,
          workLng: lng,
        }),

      setRadius: (km) => set({ preferredRadius: km }),

      setCategories: (cats) => set({ preferredCategories: cats }),

      syncFromProfile: (profile: ConsumerProfile) =>
        set({
          homeLat: profile.home_lat,
          homeLng: profile.home_lng,
          workLat: profile.work_lat,
          workLng: profile.work_lng,
          preferredRadius: profile.preferred_radius_km,
          preferredCategories: profile.preferred_categories,
          hasLocation: profile.home_lat !== null && profile.home_lng !== null,
          // Only overwrite source if it was strictly synced and not active previously. 
          // Defaulting to manual since it's from backend.
          source: "manual",
        }),

      clearLocation: () =>
        set({
          homeLat: null,
          homeLng: null,
          workLat: null,
          workLng: null,
          preferredRadius: 3,
          preferredCategories: ["bakery", "grocery", "fmcg"],
          label: null,
          hasLocation: false,
          source: null,
        }),
    }),
    {
      name: "dealdrop_location",
      partialize: (state) => ({
        homeLat: state.homeLat,
        homeLng: state.homeLng,
        preferredRadius: state.preferredRadius,
        preferredCategories: state.preferredCategories,
        label: state.label,
        hasLocation: state.hasLocation,
      }),
    }
  )
);

