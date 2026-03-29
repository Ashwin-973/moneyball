import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  Deal,
  DealCreateRequest,
  DealSuggestion,
  DealListResponse,
  DealDetailOut,
  DealFeedResponse,
  FeedTab,
  MapFeedResponse,
} from "@/types/deal";

export function useDealSuggestions() {
  return useQuery({
    queryKey: ["deals", "suggestions"],
    queryFn: async () => {
      const { data } = await api.get<DealSuggestion[]>("/deals/suggestions");
      return data;
    },
  });
}

export function useRetailerDeals(status?: string) {
  return useQuery({
    queryKey: ["deals", "retailer", { status }],
    queryFn: async () => {
      const url = status ? `/deals?status=${status}` : "/deals";
      const { data } = await api.get<DealListResponse>(url);
      return data;
    },
  });
}

export function useRetailerDeal(id: string) {
  return useQuery({
    queryKey: ["deals", id],
    queryFn: async () => {
      const { data } = await api.get<Deal>(`/deals/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: DealCreateRequest) => {
      const { data } = await api.post<Deal>("/deals", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useApproveDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.put<Deal>(`/deals/${id}/approve`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });
}

export function useCloseDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.put<Deal>(`/deals/${id}/close`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useRescoreProducts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/products/rescore");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["deals", "suggestions"] });
    },
  });
}

// ── Consumer feed hooks (Phase 5) ───────────────────────────

export function useDealFeed(params: {
  lat: number | null;
  lng: number | null;
  radius_km: number;
  category?: string;
  sort_by: FeedTab;
  page: number;
}) {
  return useQuery({
    queryKey: ["deals", "feed", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        lat: String(params.lat),
        lng: String(params.lng),
        radius_km: String(params.radius_km),
        sort_by: params.sort_by,
        page: String(params.page),
      });
      if (params.category) {
        searchParams.set("category", params.category);
      }
      const { data } = await api.get<DealFeedResponse>(
        `/deals/feed?${searchParams.toString()}`
      );
      return data;
    },
    enabled: params.lat !== null && params.lng !== null,
  });
}

export function useDealDetail(id: string) {
  return useQuery({
    queryKey: ["deals", "detail", id],
    queryFn: async () => {
      const { data } = await api.get<DealDetailOut>(`/deals/feed/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useMapPins(params: {
  lat: number | null;
  lng: number | null;
  radius_km: number;
  category?: string;
}) {
  return useQuery({
    queryKey: ["deals", "map", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        lat: String(params.lat),
        lng: String(params.lng),
        radius_km: String(params.radius_km),
      });
      if (params.category) {
        searchParams.set("category", params.category);
      }
      const { data } = await api.get<MapFeedResponse>(
        `/deals/feed/map?${searchParams.toString()}`
      );
      return data;
    },
    enabled: params.lat !== null && params.lng !== null,
  });
}
