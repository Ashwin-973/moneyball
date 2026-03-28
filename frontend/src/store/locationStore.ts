import { create } from "zustand";

interface LocationState {
  homeLat: number | null;
  homeLng: number | null;
  preferredRadius: number;
  hasLocation: boolean;
  setLocation: (lat: number, lng: number) => void;
  setRadius: (km: number) => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  homeLat: null,
  homeLng: null,
  preferredRadius: 3,
  hasLocation: false,

  setLocation: (lat, lng) =>
    set({ homeLat: lat, homeLng: lng, hasLocation: true }),

  setRadius: (km) => set({ preferredRadius: km }),

  clearLocation: () =>
    set({ homeLat: null, homeLng: null, hasLocation: false }),
}));
