"""Reservation service — full create / update / cancel / hold-expiry logic."""

from __future__ import annotations

import asyncio
import logging
from datetime import date, datetime, timedelta, timezone
from uuid import UUID

from fastapi import BackgroundTasks
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import DealStatus, ReservationStatus
from app.core.exceptions import ConflictError, ForbiddenError, NotFoundError
from app.db.session import async_session_factory
from app.models.deal import Deal
from app.models.reservation import Reservation
from app.schemas.reservation import ReservationCreateRequest
from app.services.notification_service import (
    notify_hold_expiring,
    notify_reservation_confirmed,
    notify_reservation_cancelled,
)

logger = logging.getLogger("dealdrop.reservation")


# ── helpers ──────────────────────────────────────────────────────────────────


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ── background hold-expiry ────────────────────────────────────────────────────


async def expire_hold_if_not_confirmed(reservation_id: UUID) -> None:
    """
    Runs in a FastAPI BackgroundTask after 45 minutes.
    Opens its own DB session — cannot reuse the request session.
    """
    await asyncio.sleep(45 * 60)

    async with async_session_factory() as db:
        try:
            reservation = await db.get(Reservation, reservation_id)
            if not reservation:
                return
            if reservation.status != ReservationStatus.pending:
                return  # already confirmed / cancelled / completed

            reservation.status = ReservationStatus.cancelled

            deal = await db.get(Deal, reservation.deal_id)
            if deal:
                deal.quantity_available += reservation.quantity
                if deal.status == DealStatus.reserved:
                    deal.status = DealStatus.active

            await db.commit()
            logger.info(
                "Auto-expired hold for reservation %s", reservation_id
            )
        except Exception:
            logger.exception(
                "Failed to auto-expire reservation %s", reservation_id
            )


# ── create reservation ────────────────────────────────────────────────────────


async def create_reservation(
    db: AsyncSession,
    consumer_id: UUID,
    data: ReservationCreateRequest,
    background_tasks: BackgroundTasks,
) -> Reservation:
    # 1) Fetch & validate deal
    try:
        deal_uuid = UUID(data.deal_id)
    except ValueError:
        raise NotFoundError("Invalid deal ID format")

    deal = await db.get(Deal, deal_uuid)
    if not deal:
        raise NotFoundError("Deal not found")

    if deal.status != DealStatus.active:
        raise ConflictError("This deal is no longer available")

    if deal.expiry_date < date.today():
        raise ConflictError("This deal has expired")

    # 2) Quantity check
    if data.quantity > deal.quantity_available:
        raise ConflictError(
            f"Only {deal.quantity_available} unit(s) available"
        )

    # 3) Duplicate reservation check
    existing = await db.scalar(
        select(Reservation).where(
            Reservation.deal_id == deal.id,
            Reservation.consumer_id == consumer_id,
            Reservation.status.in_(
                [ReservationStatus.pending, ReservationStatus.confirmed]
            ),
        )
    )
    if existing:
        raise ConflictError(
            "You already have an active reservation for this deal"
        )

    # 4) Decrement deal quantity
    deal.quantity_available -= data.quantity
    if deal.quantity_available == 0:
        deal.status = DealStatus.reserved

    hold_expires_at = _utcnow() + timedelta(minutes=45)

    reservation = Reservation(
        deal_id=deal.id,
        consumer_id=consumer_id,
        store_id=deal.store_id,
        quantity=data.quantity,
        status=ReservationStatus.pending,
        hold_expires_at=hold_expires_at,
    )
    db.add(reservation)
    await db.commit()
    await db.refresh(reservation)

    # 5) Schedule background hold-expiry tasks
    background_tasks.add_task(expire_hold_if_not_confirmed, reservation.id)
    background_tasks.add_task(
        notify_hold_expiring, reservation.id
    )

    return reservation


# ── retailer status update ────────────────────────────────────────────────────


async def update_reservation_status(
    db: AsyncSession,
    reservation_id: UUID,
    store_id: UUID,
    new_status: ReservationStatus,
    background_tasks: BackgroundTasks | None = None,
) -> Reservation:
    """Called by retailer to confirm, complete, or cancel."""
    reservation = await db.get(Reservation, reservation_id)
    if not reservation:
        raise NotFoundError("Reservation not found")

    if reservation.store_id != store_id:
        raise ForbiddenError("This reservation does not belong to your store")

    valid_transitions: dict[ReservationStatus, list[ReservationStatus]] = {
        ReservationStatus.pending: [
            ReservationStatus.confirmed,
            ReservationStatus.cancelled,
        ],
        ReservationStatus.confirmed: [
            ReservationStatus.completed,
            ReservationStatus.cancelled,
        ],
    }
    allowed = valid_transitions.get(reservation.status, [])
    if new_status not in allowed:
        raise ConflictError(
            f"Cannot transition from '{reservation.status}' to '{new_status}'"
        )

    reservation.status = new_status

    if new_status == ReservationStatus.confirmed:
        reservation.confirmed_at = _utcnow()

    if new_status == ReservationStatus.completed:
        reservation.completed_at = _utcnow()
        deal = await db.get(Deal, reservation.deal_id)
        if deal and deal.quantity_available == 0:
            deal.status = DealStatus.sold

    if new_status == ReservationStatus.cancelled:
        deal = await db.get(Deal, reservation.deal_id)
        if deal:
            deal.quantity_available += reservation.quantity
            if deal.status in [DealStatus.reserved, DealStatus.sold]:
                deal.status = DealStatus.active

    await db.commit()
    await db.refresh(reservation)

    # Fire notification based on new status
    if background_tasks is not None:
        if new_status == ReservationStatus.confirmed:
            background_tasks.add_task(notify_reservation_confirmed, reservation.id)
        elif new_status == ReservationStatus.cancelled:
            background_tasks.add_task(notify_reservation_cancelled, reservation.id, "store")

    return reservation


# ── consumer cancel ───────────────────────────────────────────────────────────


async def cancel_reservation_by_consumer(
    db: AsyncSession,
    reservation_id: UUID,
    consumer_id: UUID,
) -> Reservation:
    reservation = await db.get(Reservation, reservation_id)
    if not reservation:
        raise NotFoundError("Reservation not found")

    if reservation.consumer_id != consumer_id:
        raise ForbiddenError("This is not your reservation")

    if reservation.status not in [
        ReservationStatus.pending,
        ReservationStatus.confirmed,
    ]:
        raise ConflictError(
            "Cannot cancel a completed or already cancelled reservation"
        )

    reservation.status = ReservationStatus.cancelled

    deal = await db.get(Deal, reservation.deal_id)
    if deal:
        deal.quantity_available += reservation.quantity
        if deal.status in [DealStatus.reserved, DealStatus.sold]:
            deal.status = DealStatus.active

    await db.commit()
    await db.refresh(reservation)
    return reservation


# ── list helpers ──────────────────────────────────────────────────────────────


async def get_consumer_reservations(
    db: AsyncSession,
    consumer_id: UUID,
    status: str | None = None,
) -> list[Reservation]:
    query = (
        select(Reservation)
        .where(Reservation.consumer_id == consumer_id)
        .order_by(Reservation.reserved_at.desc())
    )
    if status:
        try:
            query = query.where(
                Reservation.status == ReservationStatus(status)
            )
        except ValueError:
            pass  # ignore invalid status filter
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_store_reservations(
    db: AsyncSession,
    store_id: UUID,
    status: str | None = None,
) -> list[Reservation]:
    query = (
        select(Reservation)
        .where(Reservation.store_id == store_id)
        .order_by(Reservation.reserved_at.desc())
    )
    if status:
        try:
            query = query.where(
                Reservation.status == ReservationStatus(status)
            )
        except ValueError:
            pass
    result = await db.execute(query)
    return list(result.scalars().all())
