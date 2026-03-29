"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useConsumerProfile } from "@/hooks/useConsumerProfile";
import { usePushNotifications } from "@/lib/push";
import { LogOut, Bell, User, MapPin, Tag } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import { useRouter } from "next/navigation";

export default function ConsumerProfilePage() {
  const { user, logout } = useAuth();
  const { data: profile } = useConsumerProfile();
  const { isPushSupported, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications();
  const router = useRouter();
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const togglePush = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-charcoal flex items-center gap-2">
        <User className="w-6 h-6 text-primary" />
        Your Profile
      </h1>

      {/* User Info Block */}
      <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Account Details
        </h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400">Name</p>
            <p className="font-medium text-charcoal">{user?.name || "Guest"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Email</p>
            <p className="font-medium text-charcoal">{user?.email}</p>
          </div>
        </div>
      </section>

      {/* Preferences Block */}
      {profile && (
        <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Preferences
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">Deal Search Radius</p>
              <p className="font-medium text-charcoal">
                {profile.preferred_radius_km} km
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400 flex items-center gap-1">
                <Tag className="w-4 h-4" /> Categories
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.preferred_categories.map((cat) => (
                  <span
                    key={cat}
                    className="px-2.5 py-1 bg-gray-100 text-charcoal text-xs font-medium rounded-lg capitalize"
                  >
                    {cat.replace("_", " ")}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Notifications Block */}
      <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Notifications
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-charcoal">Push Notifications</p>
            <p className="text-sm text-gray-400">Receive alerts when the app is closed</p>
          </div>
          <button
            onClick={togglePush}
            disabled={!isPushSupported || isLoading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isSubscribed ? "bg-primary" : "bg-gray-200"
            } disabled:opacity-50`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isSubscribed ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        {!isPushSupported && (
          <p className="mt-2 text-xs text-orange-500">
            Push notifications are not supported on this browser/device.
          </p>
        )}
      </section>

      {/* Logout Block */}
      <section className="pt-4 pb-8">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full h-12 flex items-center justify-center gap-2 text-red-500 bg-red-50 hover:bg-red-100 font-semibold rounded-xl transition-colors disabled:opacity-50"
        >
          {isLoggingOut ? (
            <Spinner size="sm" className="w-5 h-5 text-red-500" />
          ) : (
            <LogOut className="w-5 h-5" />
          )}
          <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
        </button>
      </section>
    </div>
  );
}
