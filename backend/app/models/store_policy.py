"""Store policy model — per-store configuration."""

from uuid import uuid4

from sqlalchemy import Boolean, Enum, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import FulfillmentMode
from app.db.base import Base


class StorePolicy(Base):
    __tablename__ = "store_policies"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    store_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("stores.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    min_discount_pct: Mapped[int] = mapped_column(Integer, default=15, nullable=False)
    auto_approve: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    fulfillment_mode: Mapped[FulfillmentMode] = mapped_column(
        Enum(FulfillmentMode, name="fulfillmentmode", create_constraint=True),
        default=FulfillmentMode.pickup,
        nullable=False,
    )
    hide_outside_hours: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
    enabled_categories = mapped_column(JSON, nullable=True)

    # ── Relationships ─────────────────────────────────────────
    store = relationship("Store", back_populates="policies")
