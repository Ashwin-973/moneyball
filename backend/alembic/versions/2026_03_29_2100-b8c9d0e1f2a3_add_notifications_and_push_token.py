"""add_notifications_and_push_token

Revision ID: b8c9d0e1f2a3
Revises: a1b2c3d4e5f6
Create Date: 2026-03-29 21:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "b8c9d0e1f2a3"
down_revision: Union[str, None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── 1. Create notificationtype enum ──────────────────────────────────────
    op.execute(
        "DO $$ BEGIN "
        "IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notificationtype') THEN "
        "CREATE TYPE notificationtype AS ENUM ('in_app', 'email', 'push'); "
        "END IF; END $$;"
    )

    # ── 2. Create notifications table ────────────────────────────────────────
    op.create_table(
        "notifications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "deal_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("deals.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "type",
            postgresql.ENUM("in_app", "email", "push", name="notificationtype", create_type=False),
            nullable=False,
            server_default="in_app",
        ),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("body", sa.Text, nullable=False),
        sa.Column("read", sa.Boolean, nullable=False, server_default="false"),
        sa.Column(
            "sent_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
    )

    # ── 3. Indexes on notifications ───────────────────────────────────────────
    op.create_index(
        "idx_notifications_user_sent",
        "notifications",
        ["user_id", "sent_at"],
        unique=False,
    )
    op.create_index(
        "idx_notifications_user_unread",
        "notifications",
        ["user_id", "read"],
        unique=False,
    )

    # ── 4. Add push_token column to consumer_profiles ────────────────────────
    op.add_column(
        "consumer_profiles",
        sa.Column("push_token", sa.Text, nullable=True),
    )


def downgrade() -> None:
    op.drop_column("consumer_profiles", "push_token")

    op.drop_index("idx_notifications_user_unread", table_name="notifications")
    op.drop_index("idx_notifications_user_sent", table_name="notifications")
    op.drop_index("ix_notifications_read", table_name="notifications")
    op.drop_index("ix_notifications_user_id", table_name="notifications")
    op.drop_table("notifications")

    sa.Enum(name="notificationtype").drop(op.get_bind(), checkfirst=True)
