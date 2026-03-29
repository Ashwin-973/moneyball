"""Notification service — SSE connection manager + dispatch logic."""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.constants import NotificationType
from app.models.notification import Notification

logger = logging.getLogger("dealdrop.notifications")

# ── SSE Connection Manager ────────────────────────────────────────────────────


class SSEConnectionManager:
    """In-memory map of user_id → asyncio.Queue for Server-Sent Events."""

    def __init__(self) -> None:
        self.connections: dict[str, asyncio.Queue] = {}

    async def connect(self, user_id: str) -> asyncio.Queue:
        queue: asyncio.Queue = asyncio.Queue(maxsize=50)
        self.connections[user_id] = queue
        return queue

    def disconnect(self, user_id: str) -> None:
        self.connections.pop(user_id, None)

    async def send_to_user(self, user_id: str, event: dict) -> None:
        queue = self.connections.get(user_id)
        if queue:
            try:
                queue.put_nowait(event)
            except asyncio.QueueFull:
                pass  # Drop — consumer will re-fetch on next poll

    async def broadcast_to_users(self, user_ids: list[str], event: dict) -> None:
        for uid in user_ids:
            await self.send_to_user(uid, event)


# Module-level singleton
sse_manager = SSEConnectionManager()

# ── Notification type constants ───────────────────────────────────────────────

NOTIFICATION_TYPES = {
    "NEW_DEAL_NEARBY": "new_deal_nearby",
    "DEAL_CRITICAL": "deal_critical",
    "DEAL_EXPIRING_SOON": "deal_expiring_soon",
    "RESERVATION_CONFIRMED": "reservation_confirmed",
    "RESERVATION_CANCELLED": "reservation_cancelled",
    "RESERVATION_COMPLETED": "reservation_completed",
    "HOLD_EXPIRING": "hold_expiring",
}

# ── Core dispatch ─────────────────────────────────────────────────────────────


async def dispatch_notification(
    db: AsyncSession,
    user_id: UUID,
    notification_type: str,
    title: str,
    body: str,
    deal_id: UUID | None = None,
    metadata: dict | None = None,
) -> None:
    """
    1. Persist to notifications table.
    2. Push via SSE if user is connected.
    """
    notification = Notification(
        user_id=user_id,
        deal_id=deal_id,
        type=NotificationType.in_app,
        title=title,
        body=body,
        read=False,
        sent_at=datetime.now(timezone.utc),
    )
    db.add(notification)
    await db.commit()

    # Push SSE event
    await sse_manager.send_to_user(
        str(user_id),
        {
            "type": notification_type,
            "title": title,
            "body": body,
            "deal_id": str(deal_id) if deal_id else None,
            "metadata": metadata or {},
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


# ── Geo-targeted new-deal notification ───────────────────────────────────────


async def notify_consumers_new_deal(
    db: AsyncSession,
    deal_id: UUID,
    store_id: UUID,
) -> None:
    """
    Find consumers within the store's preferred radius whose preferred categories
    include this store's category. Sends in-app + background email notification.
    Called after a deal transitions to active status.
    """
    from app.models.deal import Deal
    from app.models.store import Store

    deal = await db.get(Deal, deal_id)
    store = await db.get(Store, store_id)
    if not deal or not store:
        return

    try:
        geo_result = await db.execute(
            text("""
                SELECT cp.user_id
                FROM consumer_profiles cp
                WHERE ST_DWithin(
                    ST_MakePoint(cp.home_lng::float, cp.home_lat::float)::geography,
                    ST_MakePoint(:store_lng, :store_lat)::geography,
                    cp.preferred_radius_km * 1000
                )
                AND cp.preferred_categories::jsonb ? :category
            """),
            {
                "store_lng": float(store.lng),
                "store_lat": float(store.lat),
                "category": store.category.value,
            },
        )
        user_ids = [row[0] for row in geo_result.fetchall()]
    except Exception:
        logger.exception("Geo query failed for new-deal notification, deal=%s", deal_id)
        return

    for uid in user_ids:
        try:
            # Use a separate mini-session so one failure doesn't abort others
            from app.db.session import async_session_factory
            async with async_session_factory() as inner_db:
                await dispatch_notification(
                    db=inner_db,
                    user_id=uid,
                    notification_type=NOTIFICATION_TYPES["NEW_DEAL_NEARBY"],
                    title=f"🏷 {deal.discount_pct}% off near you!",
                    body=f"{store.name} just listed clearance stock. Grab it before it's gone!",
                    deal_id=deal.id,
                    metadata={"store_name": store.name},
                )
        except Exception:
            logger.exception("Failed to notify user %s of new deal %s", uid, deal_id)


# ── Reservation notifications ─────────────────────────────────────────────────


async def notify_reservation_confirmed(
    db: AsyncSession,
    reservation_id: UUID,
) -> None:
    from app.models.reservation import Reservation
    from app.db.session import async_session_factory

    async with async_session_factory() as inner_db:
        reservation = await inner_db.get(Reservation, reservation_id)
        if not reservation:
            return
        await dispatch_notification(
            db=inner_db,
            user_id=reservation.consumer_id,
            notification_type=NOTIFICATION_TYPES["RESERVATION_CONFIRMED"],
            title="✅ Your reservation is confirmed!",
            body="The store confirmed your pickup. Head over within your hold window.",
            deal_id=reservation.deal_id,
            metadata={"reservation_id": str(reservation.id)},
        )


async def notify_reservation_cancelled(
    db: AsyncSession,
    reservation_id: UUID,
    cancelled_by: str = "store",
) -> None:
    from app.models.reservation import Reservation
    from app.db.session import async_session_factory

    async with async_session_factory() as inner_db:
        reservation = await inner_db.get(Reservation, reservation_id)
        if not reservation:
            return
        if cancelled_by == "store":
            title = "❌ Reservation cancelled by store"
            body = "The store couldn't fulfil your reservation. Try another deal nearby."
        else:
            title = "Reservation cancelled"
            body = "Your reservation has been cancelled and the item is back in stock."
        await dispatch_notification(
            db=inner_db,
            user_id=reservation.consumer_id,
            notification_type=NOTIFICATION_TYPES["RESERVATION_CANCELLED"],
            title=title,
            body=body,
            deal_id=reservation.deal_id,
        )


async def notify_hold_expiring(reservation_id: UUID) -> None:
    """Called 40 minutes after reservation creation (5 min before 45-min hold expires)."""
    await asyncio.sleep(40 * 60)

    from app.db.session import async_session_factory
    from app.models.reservation import Reservation
    from app.core.constants import ReservationStatus

    async with async_session_factory() as db:
        try:
            reservation = await db.get(Reservation, reservation_id)
            if not reservation:
                return
            if reservation.status != ReservationStatus.pending:
                return  # Already confirmed or cancelled — skip
            await dispatch_notification(
                db=db,
                user_id=reservation.consumer_id,
                notification_type=NOTIFICATION_TYPES["HOLD_EXPIRING"],
                title="⚠️ Your hold expires in 5 minutes!",
                body="Pick up your reserved item soon or it will be released back to stock.",
                deal_id=reservation.deal_id,
            )
        except Exception:
            logger.exception("Failed to send hold-expiring notification for %s", reservation_id)


# ── Email notifications via Resend ────────────────────────────────────────────


async def send_email_notification(
    to_email: str,
    subject: str,
    html_body: str,
) -> None:
    """Fire-and-forget email via Resend. Never raises — email is non-critical."""
    if not settings.RESEND_API_KEY:
        return
    try:
        import resend  # type: ignore

        resend.api_key = settings.RESEND_API_KEY
        resend.Emails.send(
            {
                "from": "DealDrop <alerts@dealdrop.in>",
                "to": [to_email],
                "subject": subject,
                "html": html_body,
            }
        )
    except Exception:
        logger.warning("Email send failed to %s (non-critical)", to_email)


def email_template_reservation_confirmed(store_name: str, product_name: str) -> str:
    return f"""
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px">
      <h2 style="color:#F4500B;margin-bottom:8px">✅ Reservation Confirmed!</h2>
      <p>Your reservation at <b>{store_name}</b> for <b>{product_name}</b> is confirmed.</p>
      <p>Please pick up your item within your hold window (45 minutes from reservation).</p>
      <p style="color:#666;font-size:12px;margin-top:32px">
        DealDrop — Save More. Waste Less.
      </p>
    </div>
    """


def email_template_new_deal(store_name: str, discount: int) -> str:
    return f"""
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px">
      <h2 style="color:#F4500B;margin-bottom:8px">🏷 {discount}% Off Near You!</h2>
      <p><b>{store_name}</b> just listed a clearance deal nearby.</p>
      <a href="https://dealdrop.in/deals"
         style="display:inline-block;background:#F4500B;color:white;padding:10px 20px;
                border-radius:8px;text-decoration:none;margin-top:16px;font-weight:600">
        Browse Deals →
      </a>
      <p style="color:#666;font-size:12px;margin-top:32px">
        DealDrop — Save More. Waste Less.
      </p>
    </div>
    """
