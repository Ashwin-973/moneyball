import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  ConsumerProfile,
  ConsumerOnboardingStatus,
  ConsumerProfileCreateRequest,
  ConsumerProfileUpdateRequest,
} from "@/types/consumer";
import { AxiosError } from "axios";

export function useConsumerProfile() {
  return useQuery({
    queryKey: ["consumerProfile"],
    queryFn: async () => {
      try {
        const { data } = await api.get<ConsumerProfile>("/users/me/profile");
        return data;
      } catch (error) {
        if ((error as AxiosError).response?.status === 404) {
          return null; // Not an error, means profile is not yet created
        }
        throw error;
      }
    },
  });
}

export function useConsumerOnboardingStatus() {
  return useQuery({
    queryKey: ["consumerOnboarding"],
    queryFn: async () => {
      const { data } = await api.get<ConsumerOnboardingStatus>(
        "/users/me/onboarding"
      );
      return data;
    },
  });
}

export function useCreateConsumerProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ConsumerProfileCreateRequest) => {
      const { data } = await api.post<ConsumerProfile>(
        "/users/me/profile",
        payload
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consumerProfile"] });
      queryClient.invalidateQueries({ queryKey: ["consumerOnboarding"] });
    },
  });
}

export function useUpdateConsumerProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ConsumerProfileUpdateRequest) => {
      const { data } = await api.put<ConsumerProfile>("/users/me/profile", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consumerProfile"] });
      queryClient.invalidateQueries({ queryKey: ["consumerOnboarding"] });
    },
  });
}
