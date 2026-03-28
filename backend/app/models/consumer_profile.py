"""Consumer profile model — location & preferences (stub for Phase 7)."""

from uuid import uuid4

from sqlalchemy import Boolean, Float, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

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
    home_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    home_lng: Mapped[float | None] = mapped_column(Float, nullable=True)
    work_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    work_lng: Mapped[float | None] = mapped_column(Float, nullable=True)
    preferred_radius_km: Mapped[int] = mapped_column(
        Integer, default=3, nullable=False
    )
    preferred_categories = mapped_column(JSON, nullable=True)
    push_subscribed: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )

    # ── Relationships ─────────────────────────────────────────
    user = relationship("User", back_populates="consumer_profile")
