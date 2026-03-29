from datetime import date, datetime, timezone
from uuid import UUID

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import DealStatus, StoreCategory
from app.core.exceptions import ConflictError, NotFoundError
from app.models.deal import Deal
from app.models.product import Product
from app.schemas.deal import DealCreateRequest
from app.services import risk_engine


async def get_suggested_deals(db: AsyncSession, store_id: UUID) -> list[dict]:
    """
    Returns at-risk products (risk_score >= 50) that do NOT already
    have an active or draft deal, with suggested pricing.
    """
    result = await db.execute(
        select(Product)
        .where(
            Product.store_id == store_id,
            Product.risk_score >= 50,
            Product.expiry_date >= date.today(),
            Product.quantity > 0,
        )
        .order_by(Product.risk_score.desc())
    )
    products = result.scalars().all()
    suggestions = []
    
    for p in products:
        existing_deal = await db.scalar(
            select(Deal).where(
                Deal.product_id == p.id,
                Deal.status.in_([DealStatus.draft, DealStatus.active])
            )
        )
        if existing_deal:
            continue
            
        discount = risk_engine.suggest_discount(p.risk_score, StoreCategory(p.category))
        if discount == 0:
            continue
            
        deal_price = risk_engine.compute_deal_price(p.mrp, discount)
        suggestions.append({
            "product_id": str(p.id),
            "product_name": p.name,
            "category": p.category,
            "mrp": float(p.mrp),
            "suggested_discount_pct": discount,
            "suggested_deal_price": float(deal_price),
            "risk_score": p.risk_score,
            "risk_label": risk_engine.get_risk_label(p.risk_score),
            "days_to_expiry": max((p.expiry_date - date.today()).days, 0),
            "quantity": p.quantity,
        })
    return suggestions


async def create_deal(
    db: AsyncSession, store_id: UUID, data: DealCreateRequest, auto_approve: bool = False
) -> Deal:
    try:
        product_uuid = UUID(data.product_id)
    except ValueError:
        raise NotFoundError("Invalid product ID format")
    
    product = await db.get(Product, product_uuid)
    if not product or product.store_id != store_id:
        raise NotFoundError("Product not found")
        
    if product.quantity < data.quantity_to_list:
        raise ConflictError("Not enough stock to list this deal")
        
    existing = await db.scalar(
        select(Deal).where(
            Deal.product_id == product.id,
            Deal.status.in_([DealStatus.draft, DealStatus.active])
        )
    )
    if existing:
        raise ConflictError("An active or draft deal already exists for this product")

    status = DealStatus.active if auto_approve else DealStatus.draft
    deal = Deal(
        store_id=store_id,
        product_id=product.id,
        deal_price=data.deal_price,
        original_price=product.mrp,
        discount_pct=round((1 - float(data.deal_price) / float(product.mrp)) * 100),
        quantity_available=data.quantity_to_list,
        expiry_date=product.expiry_date,
        deal_type=data.deal_type,
        status=status,
        listed_at=datetime.now(timezone.utc),
        risk_score_at_listing=product.risk_score,
    )
    db.add(deal)
    await db.commit()
    await db.refresh(deal)
    return deal


async def approve_deal(db: AsyncSession, deal_id: UUID, store_id: UUID) -> Deal:
    deal = await db.get(Deal, deal_id)
    if not deal or deal.store_id != store_id:
        raise NotFoundError("Deal not found")
        
    if deal.status != DealStatus.draft:
        raise ConflictError("Only draft deals can be approved")
        
    deal.status = DealStatus.active
    deal.listed_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(deal)
    return deal


async def close_deal(db: AsyncSession, deal_id: UUID, store_id: UUID) -> Deal:
    deal = await db.get(Deal, deal_id)
    if not deal or deal.store_id != store_id:
        raise NotFoundError("Deal not found")
        
    if deal.status not in [DealStatus.active, DealStatus.draft]:
        raise ConflictError("Deal is already closed")
        
    deal.status = DealStatus.expired
    await db.commit()
    await db.refresh(deal)
    return deal


async def list_retailer_deals(
    db: AsyncSession, store_id: UUID, status: str | None = None
) -> list[Deal]:
    query = select(Deal).where(Deal.store_id == store_id)
    if status:
        try:
            deal_status = DealStatus(status)
            query = query.where(Deal.status == deal_status)
        except ValueError:
            pass
            
    query = query.order_by(Deal.listed_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())


async def auto_expire_stale_deals(db: AsyncSession) -> dict:
    """
    Called via FastAPI BackgroundTasks. Closes deals where:
    - expiry_date < today, OR
    - quantity_available = 0
    """
    result = await db.execute(
        select(Deal).where(
            Deal.status == DealStatus.active,
            or_(
                Deal.expiry_date < date.today(),
                Deal.quantity_available <= 0
            )
        )
    )
    deals = result.scalars().all()
    for deal in deals:
        deal.status = DealStatus.expired
    
    if deals:
        await db.commit()
        
    return {"expired": len(deals)}


# ── Consumer feed services (Phase 5) ─────────────────────────

async def get_feed(
    db: AsyncSession,
    lat: float,
    lng: float,
    radius_km: int,
    category: str | None,
    sort_by: str,
    page: int,
    page_size: int,
) -> dict:
    """Return paginated deal feed filtered by geo proximity."""
    from sqlalchemy import text as sql_text
    from app.schemas.deal import DealDetailOut, DealFeedResponse, StoreMinimal

    radius_meters = radius_km * 1000
    offset = (page - 1) * page_size

    sort_map = {
        "near_you": "distance_km ASC",
        "ending_soon": "d.expiry_date ASC, d.listed_at ASC",
        "best_discounts": "d.discount_pct DESC",
        "most_urgent": "d.risk_score_at_listing DESC",
    }
    order_clause = sort_map.get(sort_by, "distance_km ASC")

    category_filter = ""
    params: dict = {
        "lat": lat,
        "lng": lng,
        "radius_meters": radius_meters,
        "limit": page_size,
        "offset": offset,
    }
    if category:
        category_filter = "AND p.category = :category"
        params["category"] = category

    feed_sql = f"""
        SELECT
            d.id, d.store_id, d.product_id,
            d.deal_price, d.original_price, d.discount_pct,
            d.quantity_available, d.expiry_date, d.deal_type,
            d.status, d.listed_at, d.risk_score_at_listing,
            p.name AS product_name, p.image_url AS product_image_url,
            p.batch_number,
            s.name AS store_name, s.address AS store_address,
            s.lat AS store_lat, s.lng AS store_lng, s.category AS store_category,
            ROUND(
                (ST_Distance(
                    s.location::geography,
                    ST_MakePoint(:lng, :lat)::geography
                ) / 1000.0)::numeric, 2
            ) AS distance_km
        FROM deals d
        JOIN products p ON d.product_id = p.id
        JOIN stores s ON d.store_id = s.id
        WHERE d.status = 'active'
            AND d.expiry_date >= CURRENT_DATE
            AND d.quantity_available > 0
            AND ST_DWithin(
                s.location::geography,
                ST_MakePoint(:lng, :lat)::geography,
                :radius_meters
            )
            {category_filter}
        ORDER BY {order_clause}
        LIMIT :limit OFFSET :offset
    """

    count_sql = f"""
        SELECT COUNT(*)
        FROM deals d
        JOIN products p ON d.product_id = p.id
        JOIN stores s ON d.store_id = s.id
        WHERE d.status = 'active'
            AND d.expiry_date >= CURRENT_DATE
            AND d.quantity_available > 0
            AND ST_DWithin(
                s.location::geography,
                ST_MakePoint(:lng, :lat)::geography,
                :radius_meters
            )
            {category_filter}
    """

    result = await db.execute(sql_text(feed_sql), params)
    rows = result.mappings().all()

    count_result = await db.execute(sql_text(count_sql), params)
    total = count_result.scalar() or 0

    today = date.today()
    items = []
    for r in rows:
        exp = r["expiry_date"]
        days_left = max((exp - today).days, 0)
        is_urgent = days_left <= 2
        hours_to_expiry = None
        if days_left == 0:
            from datetime import datetime as dt, time, timezone as tz
            end_of_day = dt.combine(exp, time(23, 59, 59), tzinfo=tz.utc)
            hours_to_expiry = max(int((end_of_day - dt.now(tz.utc)).total_seconds() / 3600), 0)

        items.append(DealDetailOut(
            id=str(r["id"]),
            store_id=str(r["store_id"]),
            product_id=str(r["product_id"]),
            deal_price=float(r["deal_price"]),
            original_price=float(r["original_price"]),
            discount_pct=int(r["discount_pct"]),
            quantity_available=int(r["quantity_available"]),
            expiry_date=str(r["expiry_date"]),
            deal_type=str(r["deal_type"]),
            status=str(r["status"]),
            listed_at=str(r["listed_at"]),
            risk_score_at_listing=int(r["risk_score_at_listing"]),
            product_name=r["product_name"],
            product_image_url=r["product_image_url"],
            batch_number=r["batch_number"],
            store=StoreMinimal(
                id=str(r["store_id"]),
                name=r["store_name"],
                address=r["store_address"],
                lat=float(r["store_lat"]),
                lng=float(r["store_lng"]),
                category=str(r["store_category"]),
                distance_km=float(r["distance_km"]),
            ),
            days_to_expiry=days_left,
            is_urgent=is_urgent,
            hours_to_expiry=hours_to_expiry,
        ))

    return DealFeedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
    ).model_dump()


async def get_deal_detail(db: AsyncSession, deal_id: UUID) -> dict:
    """Fetch a single deal with store + product joins for consumer view."""
    from sqlalchemy import text as sql_text
    from app.schemas.deal import DealDetailOut, StoreMinimal

    sql = """
        SELECT
            d.id, d.store_id, d.product_id,
            d.deal_price, d.original_price, d.discount_pct,
            d.quantity_available, d.expiry_date, d.deal_type,
            d.status, d.listed_at, d.risk_score_at_listing,
            p.name AS product_name, p.image_url AS product_image_url,
            p.batch_number,
            s.name AS store_name, s.address AS store_address,
            s.lat AS store_lat, s.lng AS store_lng, s.category AS store_category
        FROM deals d
        JOIN products p ON d.product_id = p.id
        JOIN stores s ON d.store_id = s.id
        WHERE d.id = :deal_id
    """
    result = await db.execute(sql_text(sql), {"deal_id": deal_id})
    r = result.mappings().first()

    if not r:
        raise NotFoundError("Deal not found")

    if str(r["status"]) != "active":
        raise ConflictError("This deal is no longer available.")

    today = date.today()
    exp = r["expiry_date"]
    days_left = max((exp - today).days, 0)
    is_urgent = days_left <= 2
    hours_to_expiry = None
    if days_left == 0:
        from datetime import datetime as dt, time, timezone as tz
        end_of_day = dt.combine(exp, time(23, 59, 59), tzinfo=tz.utc)
        hours_to_expiry = max(int((end_of_day - dt.now(tz.utc)).total_seconds() / 3600), 0)

    return DealDetailOut(
        id=str(r["id"]),
        store_id=str(r["store_id"]),
        product_id=str(r["product_id"]),
        deal_price=float(r["deal_price"]),
        original_price=float(r["original_price"]),
        discount_pct=int(r["discount_pct"]),
        quantity_available=int(r["quantity_available"]),
        expiry_date=str(r["expiry_date"]),
        deal_type=str(r["deal_type"]),
        status=str(r["status"]),
        listed_at=str(r["listed_at"]),
        risk_score_at_listing=int(r["risk_score_at_listing"]),
        product_name=r["product_name"],
        product_image_url=r["product_image_url"],
        batch_number=r["batch_number"],
        store=StoreMinimal(
            id=str(r["store_id"]),
            name=r["store_name"],
            address=r["store_address"],
            lat=float(r["store_lat"]),
            lng=float(r["store_lng"]),
            category=str(r["store_category"]),
            distance_km=0.0,
        ),
        days_to_expiry=days_left,
        is_urgent=is_urgent,
        hours_to_expiry=hours_to_expiry,
    ).model_dump()


async def get_map_pins(
    db: AsyncSession,
    lat: float,
    lng: float,
    radius_km: int,
    category: str | None,
) -> dict:
    """Return store-grouped map pins within radius."""
    from sqlalchemy import text as sql_text
    from app.schemas.deal import MapPinOut, MapFeedResponse

    radius_meters = radius_km * 1000
    category_filter = ""
    params: dict = {
        "lat": lat,
        "lng": lng,
        "radius_meters": radius_meters,
    }
    if category:
        category_filter = "AND s.category = :category"
        params["category"] = category

    sql = f"""
        SELECT
            s.id AS store_id, s.name AS store_name,
            s.lat, s.lng, s.category,
            COUNT(d.id) AS deal_count,
            MAX(d.discount_pct) AS max_discount_pct,
            MIN(d.deal_price) AS min_price
        FROM deals d
        JOIN stores s ON d.store_id = s.id
        WHERE d.status = 'active'
            AND d.expiry_date >= CURRENT_DATE
            AND d.quantity_available > 0
            AND ST_DWithin(
                s.location::geography,
                ST_MakePoint(:lng, :lat)::geography,
                :radius_meters
            )
            {category_filter}
        GROUP BY s.id, s.name, s.lat, s.lng, s.category
    """

    result = await db.execute(sql_text(sql), params)
    rows = result.mappings().all()

    pins = []
    total_deals = 0
    for r in rows:
        count = int(r["deal_count"])
        total_deals += count
        pins.append(MapPinOut(
            store_id=str(r["store_id"]),
            store_name=r["store_name"],
            lat=float(r["lat"]),
            lng=float(r["lng"]),
            category=str(r["category"]),
            deal_count=count,
            max_discount_pct=int(r["max_discount_pct"]),
        ))

    return MapFeedResponse(
        pins=pins,
        total_deals=total_deals,
    ).model_dump()
