from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.constants import DealStatus, UserRole
from app.core.dependencies import get_current_user, get_db, require_role
from app.core.exceptions import NotFoundError
from app.models.deal import Deal
from app.models.store_policy import StorePolicy
from app.models.user import User
from app.schemas.deal import (
    DealCreateRequest,
    DealDetailOut,
    DealFeedResponse,
    DealListResponse,
    DealOut,
    DealSuggestion,
    MapFeedResponse,
)
from app.services import deal_service
from app.services.store_service import get_store_for_user


router = APIRouter()


# ── Consumer feed endpoints (Phase 5 — no auth) ──────────────

@router.get("/feed", response_model=DealFeedResponse)
async def get_deal_feed(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    radius_km: int = Query(default=3, ge=1, le=10),
    category: str | None = Query(default=None),
    sort_by: str = Query(default="near_you"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=40),
    db: AsyncSession = Depends(get_db),
):
    """Consumer deal feed — geo-filtered, sorted, paginated."""
    return await deal_service.get_feed(
        db, lat, lng, radius_km, category, sort_by, page, page_size
    )


@router.get("/feed/map", response_model=MapFeedResponse)
async def get_map_feed(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    radius_km: int = Query(default=3, ge=1, le=10),
    category: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    """Map pins — store-grouped deals within radius."""
    return await deal_service.get_map_pins(db, lat, lng, radius_km, category)


@router.get("/feed/{deal_id}", response_model=DealDetailOut)
async def get_deal_detail(
    deal_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Single deal detail for consumer view."""
    return await deal_service.get_deal_detail(db, deal_id)


def format_deal_out(deal: Deal) -> DealOut:
    out = DealOut.model_validate(deal)
    if getattr(deal, "product", None):
        out.product_name = deal.product.name
        days = max((deal.expiry_date - date.today()).days, 0)
        out.days_to_expiry = days
        out.is_urgent = days <= 3
    if getattr(deal, "store", None):
        out.store_name = deal.store.name
    return out


@router.get("/suggestions", response_model=list[DealSuggestion])
async def get_suggestions(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role(UserRole.retailer)),
):
    store = await get_store_for_user(db, user.id)
    return await deal_service.get_suggested_deals(db, store.id)


@router.get("", response_model=DealListResponse)
async def list_deals(
    status: str | None = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role(UserRole.retailer)),
):
    store = await get_store_for_user(db, user.id)
    query = (
        select(Deal)
        .where(Deal.store_id == store.id)
        .options(selectinload(Deal.product), selectinload(Deal.store))
    )
    if status:
        try:
            query = query.where(Deal.status == DealStatus(status))
        except ValueError:
            pass
    query = query.order_by(Deal.listed_at.desc())
    result = await db.execute(query)
    deals = result.scalars().all()

    items = [format_deal_out(d) for d in deals]
    return {"items": items, "total": len(items)}


@router.post("", response_model=DealOut, status_code=201)
async def create_deal(
    data: DealCreateRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role(UserRole.retailer)),
):
    store = await get_store_for_user(db, user.id)

    policy_res = await db.execute(
        select(StorePolicy).where(StorePolicy.store_id == store.id)
    )
    policy = policy_res.scalar_one_or_none()
    auto_approve = policy.auto_approve if policy else False

    deal = await deal_service.create_deal(
        db, store.id, data, auto_approve=auto_approve
    )
    res = await db.execute(
        select(Deal)
        .where(Deal.id == deal.id)
        .options(selectinload(Deal.product), selectinload(Deal.store))
    )
    return format_deal_out(res.scalar_one())


@router.put("/{deal_id}/approve", response_model=DealOut)
async def approve_deal(
    deal_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role(UserRole.retailer)),
):
    store = await get_store_for_user(db, user.id)
    deal = await deal_service.approve_deal(db, deal_id, store.id)
    res = await db.execute(
        select(Deal)
        .where(Deal.id == deal.id)
        .options(selectinload(Deal.product), selectinload(Deal.store))
    )
    return format_deal_out(res.scalar_one())


@router.put("/{deal_id}/close", response_model=DealOut)
async def close_deal(
    deal_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role(UserRole.retailer)),
):
    store = await get_store_for_user(db, user.id)
    deal = await deal_service.close_deal(db, deal_id, store.id)
    res = await db.execute(
        select(Deal)
        .where(Deal.id == deal.id)
        .options(selectinload(Deal.product), selectinload(Deal.store))
    )
    return format_deal_out(res.scalar_one())


@router.get("/{deal_id}", response_model=DealOut)
async def get_deal(
    deal_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role(UserRole.retailer)),
):
    store = await get_store_for_user(db, user.id)
    res = await db.execute(
        select(Deal)
        .where(Deal.id == deal_id, Deal.store_id == store.id)
        .options(selectinload(Deal.product), selectinload(Deal.store))
    )
    deal = res.scalar_one_or_none()
    if not deal:
        raise NotFoundError("Deal not found")
    return format_deal_out(deal)
