from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError
from app.models.consumer_profile import ConsumerProfile
from app.schemas.consumer_profile import (
    ConsumerProfileCreateRequest,
    ConsumerProfileUpdateRequest,
    ConsumerOnboardingStatusOut,
)


async def get_profile(db: AsyncSession, user_id: UUID) -> ConsumerProfile | None:
    res = await db.execute(select(ConsumerProfile).where(ConsumerProfile.user_id == user_id))
    return res.scalar_one_or_none()


async def create_profile(
    db: AsyncSession, user_id: UUID, data: ConsumerProfileCreateRequest
) -> ConsumerProfile:
    existing = await get_profile(db, user_id)
    if existing:
        raise ConflictError("Profile already exists. Use PUT to update.")

    profile = ConsumerProfile(
        user_id=user_id,
        **data.model_dump()
    )
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile


async def update_profile(
    db: AsyncSession, profile: ConsumerProfile, data: ConsumerProfileUpdateRequest
) -> ConsumerProfile:
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)
    
    profile.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(profile)
    return profile


async def get_onboarding_status(
    db: AsyncSession, user_id: UUID
) -> ConsumerOnboardingStatusOut:
    profile = await get_profile(db, user_id)
    if profile is None:
        return ConsumerOnboardingStatusOut(
            has_location=False, has_preferences=False, is_complete=False
        )

    has_location = profile.home_lat is not None and profile.home_lng is not None
    has_preferences = (
        profile.preferred_categories is not None
        and len(profile.preferred_categories) > 0
    )
    return ConsumerOnboardingStatusOut(
        has_location=has_location,
        has_preferences=has_preferences,
        is_complete=has_location and has_preferences,
    )


async def upsert_push_token(
    db: AsyncSession, user_id: UUID, subscribed: bool
) -> ConsumerProfile:
    profile = await get_profile(db, user_id)
    if not profile:
        raise NotFoundError("Consumer profile not found")
    profile.push_subscribed = subscribed
    profile.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(profile)
    return profile
