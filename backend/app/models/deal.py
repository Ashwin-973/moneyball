"""Deal model — listed offers from retailers."""

from datetime import date, datetime, timezone
from uuid import uuid4

from sqlalchemy import (
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import DealStatus, DealType
from app.db.base import Base


class Deal(Base):
    __tablename__ = "deals"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    store_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("stores.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    product_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
    )
    deal_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    original_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    discount_pct: Mapped[int] = mapped_column(Integer, nullable=False)
    quantity_available: Mapped[int] = mapped_column(Integer, nullable=False)
    expiry_date: Mapped[date] = mapped_column(Date, nullable=False)
    deal_type: Mapped[DealType] = mapped_column(
        Enum(DealType, name="dealtype", create_constraint=True), nullable=False
    )
    status: Mapped[DealStatus] = mapped_column(
        Enum(DealStatus, name="dealstatus", create_constraint=True),
        default=DealStatus.draft,
        index=True,
        nullable=False,
    )
    listed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    risk_score_at_listing: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )

    # ── Relationships ─────────────────────────────────────────
    store = relationship("Store", back_populates="deals")
    product = relationship("Product", back_populates="deals")
    reservations = relationship("Reservation", back_populates="deal", lazy="selectin")
