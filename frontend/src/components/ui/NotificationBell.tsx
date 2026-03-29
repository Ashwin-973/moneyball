"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications, useMarkNotificationRead, useMarkAllRead } from "@/hooks/useNotifications";
import { useNotificationStore } from "@/store/notificationStore";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { data, isLoading } = useNotifications();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead } = useMarkAllRead();
  
  const { unreadCount, setUnreadCount } = useNotificationStore();

  // Sync server unread count with store on load
  useEffect(() => {
    if (data) {
      setUnreadCount(data.unread_count);
    }
  }, [data, setUnreadCount]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkRead = (id: string, currentlyRead: boolean) => {
    if (!currentlyRead) {
      markRead(id);
      setUnreadCount(Math.max(0, unreadCount - 1));
    }
  };

  const handleMarkAllRead = () => {
    if (unreadCount > 0) {
      markAllRead();
      setUnreadCount(0);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors lg:bg-white/10 lg:hover:bg-white/20"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-charcoal lg:text-white" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white shadow-sm ring-2 ring-white lg:ring-olive-dark">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl shadow-black/5 border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-semibold text-charcoal">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
            {isLoading ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                Loading notifications...
              </div>
            ) : !data || data.items.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
                <Bell className="w-8 h-8 opacity-20" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {data.items.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleMarkRead(notif.id, notif.read)}
                    className={cn(
                      "p-4 cursor-pointer transition-colors hover:bg-gray-50",
                      !notif.read ? "bg-primary/5" : "bg-white"
                    )}
                  >
                    <div className="flex gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={cn(
                              "text-sm font-medium text-charcoal truncate",
                              !notif.read && "font-semibold"
                            )}
                          >
                            {notif.title}
                          </p>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                          {notif.body}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-2 font-medium">
                          {new Date(notif.sent_at).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
