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


class RetailDomain(str, enum.Enum):
    """Primary retail vertical for onboarding & strategy."""

    bakery = "bakery"
    supermarket = "supermarket"
    convenience = "convenience"
    produce = "produce"


class TargetProductType(str, enum.Enum):
    """Inventory focus tags (multi-select)."""

    baked_goods = "baked_goods"
    packaged_snacks = "packaged_snacks"
    dairy = "dairy"
    beverages = "beverages"
    prepared_meals = "prepared_meals"


class MarkdownTriggerWindow(str, enum.Enum):
    """When the auto-markdown engine may start relative to expiry."""

    h24_before = "24h_before"
    d3_before = "3d_before"
    w1_before = "1w_before"


class PackagingPolicy(str, enum.Enum):
    """How pickup packaging is handled."""

    store_bags = "store_bags"
    customer_containers = "customer_containers"


class NotificationPreference(str, enum.Enum):
    """Retailer-facing deal / ops notifications."""

    in_app = "in_app"
    sms = "sms"
    email = "email"


class NotificationType(str, enum.Enum):
    """Channel for a persisted notification record."""

    in_app = "in_app"
    email = "email"
    push = "push"
