"""Reservation Pydantic v2 schemas."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, field_validator


class ReservationCreateRequest(BaseModel):
    deal_id: str
    quantity: int = 1

    @field_validator("quantity")
    @classmethod
    def qty_ge_1(cls, v: int) -> int:
        if v < 1:
            raise ValueError("quantity must be >= 1")
        return v


class DealMinimal(BaseModel):
    id: str
    product_name: str
    deal_price: float
    original_price: float
    discount_pct: int
    expiry_date: str
    product_image_url: str | None = None

    model_config = ConfigDict(from_attributes=True)


class StoreMinimal(BaseModel):
    id: str
    name: str
    address: str
    lat: float
    lng: float

    model_config = ConfigDict(from_attributes=True)


class ReservationOut(BaseModel):
    id: str
    deal_id: str
    consumer_id: str
    store_id: str
    quantity: int
    status: str
    hold_expires_at: str
    reserved_at: str
    confirmed_at: str | None = None
    completed_at: str | None = None
    deal: DealMinimal
    store: StoreMinimal

    model_config = ConfigDict(from_attributes=True)


class ReservationListResponse(BaseModel):
    items: list[ReservationOut]
    total: int


class ReservationStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def valid_status(cls, v: str) -> str:
        allowed = {"confirmed", "completed", "cancelled"}
        if v not in allowed:
            raise ValueError(
                f"status must be one of: {', '.join(sorted(allowed))}"
            )
        return v
