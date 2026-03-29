"""complete_reservations_table

Revision ID: a1b2c3d4e5f6
Revises: 95ea6c3411df
Create Date: 2026-03-29 18:30:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "95ea6c3411df"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Ensure the reservationstatus enum exists (already seeded by initial migration,
    # but we add indexes that may have been missing from the stub table).

    # Add indexes on reservations table
    # (columns already exist from initial migration; we just ensure indexes)
    op.create_index(
        "ix_reservations_deal_id",
        "reservations",
        ["deal_id"],
        unique=False,
        if_not_exists=True,
    )
    op.create_index(
        "ix_reservations_consumer_id",
        "reservations",
        ["consumer_id"],
        unique=False,
        if_not_exists=True,
    )
    op.create_index(
        "ix_reservations_store_id",
        "reservations",
        ["store_id"],
        unique=False,
        if_not_exists=True,
    )
    op.create_index(
        "ix_reservations_status",
        "reservations",
        ["status"],
        unique=False,
        if_not_exists=True,
    )
    op.create_index(
        "ix_reservations_hold_expires_at",
        "reservations",
        ["hold_expires_at"],
        unique=False,
        if_not_exists=True,
    )


def downgrade() -> None:
    op.drop_index("ix_reservations_hold_expires_at", table_name="reservations")
    op.drop_index("ix_reservations_status", table_name="reservations")
    op.drop_index("ix_reservations_store_id", table_name="reservations")
    op.drop_index("ix_reservations_consumer_id", table_name="reservations")
    op.drop_index("ix_reservations_deal_id", table_name="reservations")
