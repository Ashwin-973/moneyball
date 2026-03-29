import { create } from "zustand";
import { SSEEvent } from "@/types/notification";

interface NotificationState {
  unreadCount: number;
  latestEvent: SSEEvent | null;
  isSSEConnected: boolean;
  setUnreadCount: (n: number) => void;
  incrementUnread: () => void;
  setLatestEvent: (event: SSEEvent) => void;
  setSSEConnected: (connected: boolean) => void;
  resetUnread: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  latestEvent: null,
  isSSEConnected: false,

  setUnreadCount: (n) => set({ unreadCount: n }),
  incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  setLatestEvent: (event) => set({ latestEvent: event }),
  setSSEConnected: (connected) => set({ isSSEConnected: connected }),
  resetUnread: () => set({ unreadCount: 0 }),
}));
