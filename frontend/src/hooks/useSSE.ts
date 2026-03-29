"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { SSEEvent } from "@/types/notification";
import { useAuthStore } from "@/store/authStore";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface UseSSEReturn {
  isConnected: boolean;
  reconnect: () => void;
}

export function useSSE(onEvent: (event: SSEEvent) => void): UseSSEReturn {
  const { isAuthenticated } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const sourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backoffRef = useRef(1000); // Start at 1s, max 30s
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent; // Keep callback ref fresh

  const getToken = useCallback(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("dealdrop_access_token");
  }, []);

  const connect = useCallback(() => {
    if (!isAuthenticated) return;
    const token = getToken();
    if (!token) return;

    // Close any existing connection
    if (sourceRef.current) {
      sourceRef.current.close();
      sourceRef.current = null;
    }

    const url = `${API_BASE_URL}/notifications/stream?token=${encodeURIComponent(token)}`;
    const source = new EventSource(url);
    sourceRef.current = source;

    source.onmessage = (e) => {
      try {
        const event: SSEEvent = JSON.parse(e.data);
        if (event.type === "connected") {
          setIsConnected(true);
          backoffRef.current = 1000; // reset backoff on success
        }
        onEventRef.current(event);
      } catch {
        // Malformed event — ignore
      }
    };

    source.onerror = () => {
      setIsConnected(false);
      source.close();
      sourceRef.current = null;

      // Exponential backoff reconnect
      const delay = Math.min(backoffRef.current, 30_000);
      backoffRef.current = Math.min(backoffRef.current * 2, 30_000);

      reconnectTimerRef.current = setTimeout(() => {
        connect();
      }, delay);
    };
  }, [isAuthenticated, getToken]);

  const reconnect = useCallback(() => {
    backoffRef.current = 1000;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }
    connect();
  }, [connect]);

  // Initial connection
  useEffect(() => {
    connect();

    return () => {
      if (sourceRef.current) {
        sourceRef.current.close();
        sourceRef.current = null;
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      setIsConnected(false);
    };
  }, [connect]);

  // Reconnect when tab becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !sourceRef.current) {
        reconnect();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [reconnect]);

  return { isConnected, reconnect };
}
