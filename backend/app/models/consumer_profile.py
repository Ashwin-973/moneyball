"""Consumer profile model — location & preferences."""

from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, Text
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.base import Base


class ConsumerProfile(Base):
    __tablename__ = "consumer_profiles"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    home_lat = mapped_column(Numeric(9, 6), nullable=True)
    home_lng = mapped_column(Numeric(9, 6), nullable=True)
    work_lat = mapped_column(Numeric(9, 6), nullable=True)
    work_lng = mapped_column(Numeric(9, 6), nullable=True)
    preferred_radius_km: Mapped[int] = mapped_column(
        Integer, default=3, nullable=False
    )
    preferred_categories = mapped_column(
        JSON, default=["bakery", "grocery", "fmcg"], nullable=True
    )
    push_subscribed: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, index=True
    )
    push_token: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # ── Relationships ─────────────────────────────────────────
    user = relationship("User", back_populates="consumer_profile")
