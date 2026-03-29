"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Check, ChevronRight } from "lucide-react";
import { useLocationStore } from "@/store/locationStore";
import {
  useCreateConsumerProfile,
  useUpdateConsumerProfile,
  useConsumerProfile,
} from "@/hooks/useConsumerProfile";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { StepIndicator } from "@/components/ui/StepIndicator";

export default function ConsumerOnboardingPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const locationStore = useLocationStore();

  const createProfile = useCreateConsumerProfile();
  const updateProfile = useUpdateConsumerProfile();
  const { data: profile } = useConsumerProfile();

  const [step, setStep] = useState(0);

  // --- OVERRIDE FALLBACK COORDINATES ---
  const handleUseChennaiCenter = () => {
    locationStore.setHomeLocation(13.0827, 80.2707, "Chennai, Tamil Nadu");
  };

  // --- STEP 1: LOCATION ---
  const [isManualLocation, setIsManualLocation] = useState(false);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      error("Geolocation is not supported by your browser");
      setIsManualLocation(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        locationStore.setHomeLocation(
          pos.coords.latitude,
          pos.coords.longitude,
          `${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(
            4
          )}°E`
        );
        success("Location detected successfully");
      },
      (err) => {
        error("Location access denied.");
        setIsManualLocation(true);
      }
    );
  };

  const submitManualLocation = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      locationStore.setHomeLocation(
        lat,
        lng,
        `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`
      );
    } else {
      error("Please enter valid coordinates.");
    }
  };

  // --- STEP 2: RADIUS ---
  const radiusOptions = [
    { value: 1, label: "1 km", desc: "Hyper-local. Your street and block." },
    { value: 3, label: "3 km", desc: "Neighbourhood. Best for most users." },
    { value: 5, label: "5 km", desc: "Wide area. More variety." },
  ];

  // --- STEP 3: CATEGORIES ---
  const categoryOptions = [
    { id: "bakery", label: "Bakery \uD83C\uDF5E", desc: "Fresh bread, cakes, pastries" },
    { id: "grocery", label: "Grocery \uD83D\uDED2", desc: "Dairy, produce, packaged food" },
    { id: "fmcg", label: "FMCG \uD83E\uDDF4", desc: "Personal care, household, snacks" },
  ];

  const handleToggleCategory = (cat: string) => {
    const isSelected = locationStore.preferredCategories.includes(cat);
    if (isSelected) {
      locationStore.setCategories(
        locationStore.preferredCategories.filter((c) => c !== cat)
      );
    } else {
      locationStore.setCategories([...locationStore.preferredCategories, cat]);
    }
  };

  const handleFinish = async () => {
    if (locationStore.preferredCategories.length === 0) {
      return error("Please select at least one category.");
    }
    if (locationStore.homeLat === null || locationStore.homeLng === null) {
      return error("Location is missing.");
    }

    const payload = {
      home_lat: locationStore.homeLat,
      home_lng: locationStore.homeLng,
      preferred_radius_km: locationStore.preferredRadius,
      preferred_categories: locationStore.preferredCategories,
    };

    try {
      let result;
      // If we got a profile via query but onboarding was incomplete, let's try UPDATE
      if (profile && profile.id) {
        result = await updateProfile.mutateAsync(payload);
      } else {
        result = await createProfile.mutateAsync(payload);
      }
      locationStore.syncFromProfile(result);
      success("You're all set!");
      router.push("/deals");
    } catch (err: any) {
      if (err?.response?.status === 409) {
        // Conflict - maybe they already have a profile but it wasn't loaded in query
        const result = await updateProfile.mutateAsync(payload);
        locationStore.syncFromProfile(result);
        success("Profile updated!");
        router.push("/deals");
      } else {
        error(err?.response?.data?.detail || "Failed to save profile.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col pt-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl px-4">
        {/* Progress Indicator */}
        <StepIndicator
          steps={["Location", "Radius", "Preferences"]}
          currentStep={step}
        />

        <div className="bg-white py-10 px-6 mt-8 shadow sm:rounded-xl sm:px-12 relative overflow-hidden">
          {/* STEP 1 */}
          {step === 0 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-charcoal">
                  Where are you based?
                </h2>
                <p className="text-gray-500 mt-2">
                  We'll show you deals from nearby stores.
                </p>
              </div>

              {!locationStore.hasLocation ? (
                <>
                  <Button
                    fullWidth
                    size="lg"
                    onClick={handleGetCurrentLocation}
                    className="flex items-center justify-center gap-2 mb-6 shadow-sm"
                  >
                    <MapPin size={20} />
                    Use my current location
                  </Button>

                  <div className="flex justify-center mb-6">
                    <button
                      onClick={() => setIsManualLocation(!isManualLocation)}
                      className="text-sm text-gray-500 underline hover:text-primary transition-colors"
                    >
                      Enter coordinates manually
                    </button>
                  </div>

                  {isManualLocation && (
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 mb-6">
                      <div className="flex flex-col gap-4">
                        <Input
                          label="Latitude"
                          placeholder="e.g. 13.0827"
                          value={manualLat}
                          onChange={(e) => setManualLat(e.target.value)}
                        />
                        <Input
                          label="Longitude"
                          placeholder="e.g. 80.2707"
                          value={manualLng}
                          onChange={(e) => setManualLng(e.target.value)}
                        />
                        <Button
                          variant="secondary"
                          fullWidth
                          onClick={submitManualLocation}
                        >
                          Save Manual Location
                        </Button>
                      </div>
                      <p className="text-xs text-gray-400 mt-3 text-center">
                        You can get these from Google Maps
                      </p>
                    </div>
                  )}

                  <div className="text-center mt-2">
                    <button
                      onClick={handleUseChennaiCenter}
                      className="text-xs text-gray-400 hover:text-charcoal"
                    >
                      Use Chennai Center (Quick-fill)
                    </button>
                  </div>
                </>
              ) : (
                <div className="bg-green-50/50 border border-green-200 p-6 rounded-xl flex flex-col items-center justify-center mb-6 text-center animate-in zoom-in duration-300">
                  <div className="bg-green-100 p-3 rounded-full mb-3 shadow-inner">
                    <Check className="text-green-600" size={24} />
                  </div>
                  <h3 className="font-semibold text-green-900 text-lg">
                    Location detected
                  </h3>
                  <p className="text-sm text-green-700 mt-1 uppercase tracking-wider font-mono">
                    {locationStore.label}
                  </p>
                  <button
                    onClick={locationStore.clearLocation}
                    className="text-xs text-green-600 underline mt-3 hover:text-green-800"
                  >
                    Change location
                  </button>
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <Button
                  onClick={() => setStep(1)}
                  disabled={!locationStore.hasLocation}
                  className="flex items-center"
                >
                  Next <ChevronRight size={18} className="ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-charcoal">
                  Your deal radius
                </h2>
                <p className="text-gray-500 mt-2">
                  We'll show deals from stores within this distance.
                </p>
              </div>

              <div className="flex flex-col gap-4 mb-8">
                {radiusOptions.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => locationStore.setRadius(opt.value)}
                    className={`relative cursor-pointer border-2 p-5 rounded-xl transition-all duration-200 ${
                      locationStore.preferredRadius === opt.value
                        ? "border-primary bg-orange-50/50 shadow-sm"
                        : "border-gray-200 hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-charcoal">
                          {opt.label}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{opt.desc}</p>
                      </div>
                      {locationStore.preferredRadius === opt.value && (
                        <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center absolute top-4 right-4 animate-in zoom-in">
                          <Check size={14} className="stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center items-center py-6 mb-4">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <div
                    className={`absolute rounded-full border border-primary transition-all duration-500 ease-out bg-primary/5 ${
                      locationStore.preferredRadius === 5
                        ? "w-40 h-40 opacity-100"
                        : locationStore.preferredRadius > 5
                        ? "w-40 h-40 opacity-0 scale-90"
                        : "w-0 h-0 opacity-0"
                    }`}
                  ></div>
                  <div
                    className={`absolute rounded-full border border-primary transition-all duration-500 ease-out bg-primary/10 ${
                      locationStore.preferredRadius >= 3
                        ? "w-28 h-28 opacity-100"
                        : "w-0 h-0 opacity-0"
                    }`}
                  ></div>
                  <div
                    className={`absolute rounded-full border-2 border-primary transition-all duration-500 ease-out bg-primary/20 ${
                      locationStore.preferredRadius >= 1
                        ? "w-16 h-16 opacity-100"
                        : "w-0 h-0 opacity-0"
                    }`}
                  ></div>
                  <div className="absolute z-10 text-primary">
                    <MapPin className="fill-white" size={24} />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <Button variant="secondary" onClick={() => setStep(0)}>
                  Back
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  className="flex items-center"
                >
                  Next <ChevronRight size={18} className="ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-charcoal">
                  Pick your categories
                </h2>
                <p className="text-gray-500 mt-2">
                  We'll prioritise these in your feed.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                {categoryOptions.map((opt) => {
                  const isSelected = locationStore.preferredCategories.includes(
                    opt.id
                  );
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleToggleCategory(opt.id)}
                      className={`relative cursor-pointer border-2 p-5 rounded-xl flex flex-col items-center text-center transition-all duration-200 ${
                        isSelected
                          ? "border-primary bg-orange-50/50 shadow-sm"
                          : "border-gray-200 hover:border-primary/50"
                      }`}
                    >
                      <div className="text-3xl mb-3">{opt.label.split(" ")[1]}</div>
                      <h3 className="text-lg font-bold text-charcoal mb-1">
                        {opt.label.split(" ")[0]}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {opt.desc}
                      </p>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center absolute -top-3 -right-3 shadow-sm animate-in zoom-in">
                          <Check size={14} className="stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-12 flex justify-between items-center">
                <Button variant="secondary" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={handleFinish}
                  isLoading={
                    createProfile.isPending || updateProfile.isPending
                  }
                  disabled={locationStore.preferredCategories.length === 0}
                  className="px-10"
                >
                  Finish Setup
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
