import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  Reservation,
  ReservationCreateRequest,
  ReservationListResponse,
  ReservationStatusUpdate,
} from "@/types/reservation";

// ── consumer hooks ────────────────────────────────────────────────────────────

export function useMyReservations(status?: string) {
  return useQuery<ReservationListResponse>({
    queryKey: ["reservations", "my", { status }],
    queryFn: async () => {
      const url = status
        ? `/reservations/my?status=${status}`
        : "/reservations/my";
      const { data } = await api.get<ReservationListResponse>(url);
      return data;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  return useMutation<Reservation, unknown, ReservationCreateRequest>({
    mutationFn: async (payload) => {
      const { data } = await api.post<Reservation>("/reservations", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });
}

export function useCancelReservation() {
  const queryClient = useQueryClient();
  return useMutation<Reservation, unknown, string>({
    mutationFn: async (reservationId: string) => {
      const { data } = await api.delete<Reservation>(
        `/reservations/${reservationId}`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });
}

// ── retailer hooks ────────────────────────────────────────────────────────────

export function useStoreReservations(status?: string) {
  return useQuery<ReservationListResponse>({
    queryKey: ["storeReservations", { status }],
    queryFn: async () => {
      const url = status
        ? `/reservations/store?status=${status}`
        : "/reservations/store";
      const { data } = await api.get<ReservationListResponse>(url);
      return data;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

export function useUpdateReservationStatus() {
  const queryClient = useQueryClient();
  return useMutation<
    Reservation,
    unknown,
    { reservationId: string; update: ReservationStatusUpdate }
  >({
    mutationFn: async ({ reservationId, update }) => {
      const { data } = await api.put<Reservation>(
        `/reservations/${reservationId}/status`,
        update
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storeReservations"] });
    },
  });
}
