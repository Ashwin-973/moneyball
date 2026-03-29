"use client";

import { useEffect, useRef, useState } from "react";

// ── variant 1: expiry date countdown (existing) ────────────────────────────

interface ExpiryCountdownProps {
  expiryDate: string;
  showSeconds?: boolean;
  holdExpiresAt?: never;
  onExpire?: never;
}

// ── variant 2: hold countdown (Phase 6) ───────────────────────────────────

interface HoldCountdownProps {
  holdExpiresAt: string; // ISO datetime string
  onExpire?: () => void;
  expiryDate?: never;
  showSeconds?: never;
}

type CountdownTimerProps = ExpiryCountdownProps | HoldCountdownProps;

// ── hold countdown component ───────────────────────────────────────────────

export function HoldCountdown({
  holdExpiresAt,
  onExpire,
  large = false,
}: {
  holdExpiresAt: string;
  onExpire?: () => void;
  large?: boolean;
}) {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    const end = new Date(holdExpiresAt).getTime();
    return Math.max(0, Math.floor((end - Date.now()) / 1000));
  });
  const expiredCalled = useRef(false);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (!expiredCalled.current) {
        expiredCalled.current = true;
        onExpire?.();
      }
      return;
    }

    const id = setInterval(() => {
      const end = new Date(holdExpiresAt).getTime();
      const s = Math.max(0, Math.floor((end - Date.now()) / 1000));
      setSecondsLeft(s);
      if (s === 0 && !expiredCalled.current) {
        expiredCalled.current = true;
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(id);
  }, [holdExpiresAt, onExpire, secondsLeft]);

  if (secondsLeft <= 0) {
    return (
      <span className={`${large ? "text-2xl font-bold" : "text-xs font-medium"} text-gray-400`}>
        Hold expired
      </span>
    );
  }

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const display = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  const isCritical = secondsLeft <= 5 * 60; // under 5 minutes

  if (large) {
    return (
      <div className="text-center">
        <div
          className={`text-4xl font-bold font-mono tabular-nums ${
            isCritical ? "text-red-500" : "text-orange-500"
          }`}
        >
          {display}
        </div>
        {isCritical && (
          <p className="text-xs text-red-500 font-medium mt-1">
            ⚠️ Hold expiring soon!
          </p>
        )}
      </div>
    );
  }

  return (
    <span
      className={`text-xs font-medium tabular-nums ${
        isCritical ? "text-red-500" : "text-orange-500"
      }`}
    >
      {isCritical ? "⚠️ " : ""}Hold expires in {display}
    </span>
  );
}

// ── default export: original expiry-date variant ───────────────────────────

export default function CountdownTimer({
  expiryDate,
  showSeconds = false,
}: {
  expiryDate: string;
  showSeconds?: boolean;
}) {
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [colorClass, setColorClass] = useState("text-gray-500");

  useEffect(() => {
    function computeTimeLeft() {
      const endOfDay = new Date(expiryDate + "T23:59:59");
      const now = new Date();
      const diffMs = endOfDay.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeLeft("Expired");
        setColorClass("text-gray-400");
        return 0;
      }

      const diffH = Math.floor(diffMs / (1000 * 60 * 60));
      const diffM = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const diffDays = Math.floor(diffH / 24);

      if (diffDays > 2) {
        setTimeLeft(`${diffDays}d left`);
        setColorClass("text-emerald-600 font-medium");
        return 60000;
      }

      if (diffDays >= 1) {
        setTimeLeft(`${diffDays}d left`);
        setColorClass("text-orange-500 font-medium");
        return 60000;
      }

      if (diffH >= 1) {
        setTimeLeft(`${diffH}h ${diffM}m left`);
        setColorClass("text-red-500 font-medium");
        return 60000;
      }

      setTimeLeft(`${diffM}m left`);
      setColorClass("text-red-600 font-bold");
      return 10000;
    }

    const interval = computeTimeLeft();
    if (interval <= 0) return;

    const id = setInterval(() => {
      computeTimeLeft();
    }, interval);

    return () => clearInterval(id);
  }, [expiryDate]);

  if (timeLeft === null) return null;

  return <span className={`text-xs ${colorClass}`}>{timeLeft}</span>;
}
