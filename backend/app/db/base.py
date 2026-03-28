"""Declarative base and model registry for Alembic."""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""

    pass


# Import all models so Alembic can detect them.
from app.models.user import User  # noqa: E402, F401
from app.models.store import Store  # noqa: E402, F401
from app.models.store_policy import StorePolicy  # noqa: E402, F401
from app.models.product import Product  # noqa: E402, F401
from app.models.category import Category  # noqa: E402, F401
from app.models.deal import Deal  # noqa: E402, F401
from app.models.reservation import Reservation  # noqa: E402, F401
from app.models.consumer_profile import ConsumerProfile  # noqa: E402, F401
