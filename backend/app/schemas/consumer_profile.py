from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, computed_field

class ConsumerProfileCreateRequest(BaseModel):
    home_lat: float = Field(ge=-90, le=90)
    home_lng: float = Field(ge=-180, le=180)
    work_lat: float | None = Field(default=None, ge=-90, le=90)
    work_lng: float | None = Field(default=None, ge=-180, le=180)
    preferred_radius_km: int = Field(default=3, ge=1, le=10)
    preferred_categories: list[str] = Field(
        default=["bakery", "grocery", "fmcg"]
    )


class ConsumerProfileUpdateRequest(BaseModel):
    home_lat: float | None = Field(default=None, ge=-90, le=90)
    home_lng: float | None = Field(default=None, ge=-180, le=180)
    work_lat: float | None = Field(default=None, ge=-90, le=90)
    work_lng: float | None = Field(default=None, ge=-180, le=180)
    preferred_radius_km: int | None = Field(default=None, ge=1, le=10)
    preferred_categories: list[str] | None = Field(default=None)


class ConsumerProfileOut(BaseModel):
    id: UUID
    user_id: UUID
    home_lat: float | None
    home_lng: float | None
    work_lat: float | None
    work_lng: float | None
    preferred_radius_km: int
    preferred_categories: list[str]
    push_subscribed: bool

    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def has_completed_onboarding(self) -> bool:
        return self.home_lat is not None and self.home_lng is not None


class ConsumerOnboardingStatusOut(BaseModel):
    has_location: bool
    has_preferences: bool
    is_complete: bool

class PushSubscriptionRequest(BaseModel):
    subscribed: bool
