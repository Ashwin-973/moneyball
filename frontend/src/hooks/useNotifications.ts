import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Notification, NotificationListResponse } from "@/types/notification";

export function useNotifications(limit = 50) {
  return useQuery<NotificationListResponse>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await api.get<NotificationListResponse>(
        `/notifications?limit=${limit}`
      );
      return data;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation<Notification, unknown, string>({
    mutationFn: async (notificationId: string) => {
      const { data } = await api.put<Notification>(
        `/notifications/${notificationId}/read`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, void>({
    mutationFn: async () => {
      await api.put("/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
