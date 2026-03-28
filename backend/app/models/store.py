"""Store model with PostGIS geography column."""

from datetime import datetime, timezone
from uuid import uuid4

from geoalchemy2 import Geometry
from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Numeric,
    String,
    Text,
    Time,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import StoreCategory
from app.db.base import Base


class Store(Base):
    __tablename__ = "stores"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    lat: Mapped[float] = mapped_column(Numeric(9, 6), nullable=False)
    lng: Mapped[float] = mapped_column(Numeric(9, 6), nullable=False)
    location = mapped_column(
        Geometry(geometry_type="POINT", srid=4326, spatial_index=False),
        nullable=True,
    )
    category: Mapped[StoreCategory] = mapped_column(
        Enum(StoreCategory, name="storecategory", create_constraint=True),
        nullable=False,
    )
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    open_time = mapped_column(Time, nullable=True)
    close_time = mapped_column(Time, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # ── Relationships ─────────────────────────────────────────
    owner = relationship("User", back_populates="stores")
    policies = relationship(
        "StorePolicy", back_populates="store", uselist=False, lazy="selectin"
    )
    products = relationship("Product", back_populates="store", lazy="selectin")
    deals = relationship("Deal", back_populates="store", lazy="selectin")
    reservations = relationship("Reservation", back_populates="store", lazy="selectin")

    __table_args__ = (
        Index("idx_stores_location", location, postgresql_using="gist"),
    )
