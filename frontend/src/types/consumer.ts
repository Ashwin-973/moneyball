export interface ConsumerProfile {
  id: string;
  user_id: string;
  home_lat: number | null;
  home_lng: number | null;
  work_lat: number | null;
  work_lng: number | null;
  preferred_radius_km: number;
  preferred_categories: string[];
  push_subscribed: boolean;
  has_completed_onboarding: boolean;
}

export interface ConsumerProfileCreateRequest {
  home_lat: number;
  home_lng: number;
  work_lat?: number;
  work_lng?: number;
  preferred_radius_km?: number;
  preferred_categories?: string[];
}

export interface ConsumerProfileUpdateRequest {
  home_lat?: number;
  home_lng?: number;
  work_lat?: number;
  work_lng?: number;
  preferred_radius_km?: number;
  preferred_categories?: string[];
}

export interface ConsumerOnboardingStatus {
  has_location: boolean;
  has_preferences: boolean;
  is_complete: boolean;
}
