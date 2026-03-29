"""Reservations router — consumer and retailer endpoints."""

from __future__ import annotations

from datetime import date
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.constants import ReservationStatus, UserRole
from app.core.dependencies import get_db, require_role
from app.models.deal import Deal
from app.models.product import Product
from app.models.reservation import Reservation
from app.models.store import Store
from app.models.user import User
from app.schemas.reservation import (
    DealMinimal,
    ReservationCreateRequest,
    ReservationListResponse,
    ReservationOut,
    ReservationStatusUpdate,
    StoreMinimal,
)
from app.services import reservation_service
from app.services.store_service import get_store_for_user

router = APIRouter()


# ── helpers ───────────────────────────────────────────────────────────────────


async def _build_reservation_out(
    db: AsyncSession, reservation: Reservation
) -> ReservationOut:
    """Eagerly load deal + product + store and build ReservationOut."""
    # Reload with relationships to be safe
    result = await db.execute(
        select(Reservation)
        .where(Reservation.id == reservation.id)
        .options(
            selectinload(Reservation.deal).selectinload(Deal.product),
            selectinload(Reservation.store),
        )
    )
    res = result.scalar_one()

    deal = res.deal
    product = deal.product if deal else None
    store = res.store

    deal_minimal = DealMinimal(
        id=str(deal.id),
        product_name=product.name if product else "Unknown",
        deal_price=float(deal.deal_price),
        original_price=float(deal.original_price),
        discount_pct=int(deal.discount_pct),
        expiry_date=str(deal.expiry_date),
        product_image_url=product.image_url if product else None,
    )

    store_minimal = StoreMinimal(
        id=str(store.id),
        name=store.name,
        address=store.address,
        lat=float(store.lat),
        lng=float(store.lng),
    )

    def _fmt(dt) -> str | None:
        if dt is None:
            return None
        return dt.isoformat()

    return ReservationOut(
        id=str(res.id),
        deal_id=str(res.deal_id),
        consumer_id=str(res.consumer_id),
        store_id=str(res.store_id),
        quantity=res.quantity,
        status=res.status.value,
        hold_expires_at=res.hold_expires_at.isoformat(),
        reserved_at=res.reserved_at.isoformat(),
        confirmed_at=_fmt(res.confirmed_at),
        completed_at=_fmt(res.completed_at),
        deal=deal_minimal,
        store=store_minimal,
    )


async def _build_list(
    db: AsyncSession, reservations: list[Reservation]
) -> ReservationListResponse:
    items = [await _build_reservation_out(db, r) for r in reservations]
    return ReservationListResponse(items=items, total=len(items))


# ── consumer routes ────────────────────────────────────────────────────────────


@router.post("", response_model=ReservationOut, status_code=201)
async def create_reservation(
    data: ReservationCreateRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role(UserRole.consumer)),
):
    """Consumer reserves a deal — 45-min hold starts immediately."""
    reservation = await reservation_service.create_reservation(
        db, user.id, data, background_tasks
    )
    return await _build_reservation_out(db, reservation)


@router.get("/my", response_model=ReservationListResponse)
async def get_my_reservations(
    status: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role(UserRole.consumer)),
):
    """Return all reservations for the authenticated consumer."""
    reservations = await reservation_service.get_consumer_reservations(
        db, user.id, status
    )
    return await _build_list(db, reservations)


@router.delete("/{reservation_id}", response_model=ReservationOut)
async def cancel_reservation(
    reservation_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role(UserRole.consumer)),
):
    """Consumer cancels their own pending or confirmed reservation."""
    reservation = await reservation_service.cancel_reservation_by_consumer(
        db, reservation_id, user.id
    )
    return await _build_reservation_out(db, reservation)


# ── retailer routes ────────────────────────────────────────────────────────────


@router.get("/store", response_model=ReservationListResponse)
async def get_store_reservations(
    status: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role(UserRole.retailer)),
):
    """Return reservations for the current retailer's store."""
    store = await get_store_for_user(db, user.id)
    reservations = await reservation_service.get_store_reservations(
        db, store.id, status
    )
    return await _build_list(db, reservations)


@router.put("/{reservation_id}/status", response_model=ReservationOut)
async def update_reservation_status(
    reservation_id: UUID,
    body: ReservationStatusUpdate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role(UserRole.retailer)),
):
    """Retailer confirms, marks picked-up, or rejects a reservation."""
    store = await get_store_for_user(db, user.id)
    try:
        new_status = ReservationStatus(body.status)
    except ValueError:
        from app.core.exceptions import ConflictError
        raise ConflictError(f"Invalid status: {body.status}")

    reservation = await reservation_service.update_reservation_status(
        db, reservation_id, store.id, new_status, background_tasks
    )
    return await _build_reservation_out(db, reservation)
