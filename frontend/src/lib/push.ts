"use client";

import { useState, useCallback } from "react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const reg = await navigator.serviceWorker.ready;
  if (!reg.pushManager) return null;

  try {
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: VAPID_PUBLIC_KEY
        ? (urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as unknown as ArrayBuffer)
        : undefined,
    });
    return subscription;
  } catch {
    return null;
  }
}

export async function savePushSubscription(
  subscription: PushSubscription
): Promise<void> {
  try {
    await api.put("/users/me/push-subscription", { subscribed: true });
    await api.post("/users/me/push-token", {
      push_token: JSON.stringify(subscription),
    });
  } catch {
    // Non-critical — silently fail
  }
}

export function usePushNotifications() {
  const { isAuthenticated } = useAuthStore();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isPushSupported =
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window;

  const subscribe = useCallback(async () => {
    if (!isAuthenticated || !isPushSupported) return;
    setIsLoading(true);
    try {
      const sub = await subscribeToPush();
      if (sub) {
        await savePushSubscription(sub);
        setIsSubscribed(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isPushSupported]);

  const unsubscribe = useCallback(async () => {
    try {
      await api.put("/users/me/push-subscription", { subscribed: false });
      setIsSubscribed(false);
    } catch {
      // Silent fail
    }
  }, []);

  return { isPushSupported, isSubscribed, isLoading, subscribe, unsubscribe };
}
