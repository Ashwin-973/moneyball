"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  expiryDate: string;
  showSeconds?: boolean;
}

export default function CountdownTimer({ expiryDate, showSeconds = false }: CountdownTimerProps) {
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
        setTimeLeft(null);
        return -1; // don't show
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
    if (interval <= 0 && interval !== -1) return;

    const id = setInterval(() => {
      computeTimeLeft();
    }, interval === -1 ? 60000 : interval);

    return () => clearInterval(id);
  }, [expiryDate]);

  if (timeLeft === null) return null;

  return <span className={`text-xs ${colorClass}`}>{timeLeft}</span>;
}
