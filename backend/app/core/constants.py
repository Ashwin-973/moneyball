"""Application-wide enums and constants."""

import enum


class UserRole(str, enum.Enum):
    consumer = "consumer"
    retailer = "retailer"


class DealType(str, enum.Enum):
    flash = "flash"
    clearance = "clearance"
    bundle = "bundle"


class DealStatus(str, enum.Enum):
    draft = "draft"
    active = "active"
    reserved = "reserved"
    sold = "sold"
    expired = "expired"


class ReservationStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    completed = "completed"
    cancelled = "cancelled"


class FulfillmentMode(str, enum.Enum):
    pickup = "pickup"
    delivery = "delivery"
    both = "both"


class StoreCategory(str, enum.Enum):
    bakery = "bakery"
    grocery = "grocery"
    fmcg = "fmcg"
