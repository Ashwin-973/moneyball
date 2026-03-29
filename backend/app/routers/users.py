from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import UserRole
from app.core.dependencies import get_current_user, get_db, require_role
from app.core.exceptions import NotFoundError
from app.models.user import User
from app.schemas.user import UserOut, UserUpdateRequest
from app.schemas.consumer_profile import (
    ConsumerProfileCreateRequest,
    ConsumerProfileUpdateRequest,
    ConsumerProfileOut,
    ConsumerOnboardingStatusOut,
    PushSubscriptionRequest
)
from app.services import consumer_profile_service

router = APIRouter()


@router.get("/me", response_model=UserOut)
async def get_me(
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Return the currently authenticated user."""
    return current_user


@router.patch("/me", response_model=UserOut)
async def update_me(
    data: UserUpdateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Update profile details for the current user."""
    if data.name is not None:
        current_user.name = data.name
    if data.phone is not None:
        current_user.phone = data.phone

    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    
    return current_user


@router.get("/me/profile", response_model=ConsumerProfileOut)
async def get_consumer_profile(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role(UserRole.consumer)),
):
    profile = await consumer_profile_service.get_profile(db, user.id)
    if not profile:
        raise NotFoundError("Consumer profile not found")
    return profile


@router.post("/me/profile", response_model=ConsumerProfileOut, status_code=201)
async def create_consumer_profile(
    data: ConsumerProfileCreateRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role(UserRole.consumer)),
):
    return await consumer_profile_service.create_profile(db, user.id, data)


@router.put("/me/profile", response_model=ConsumerProfileOut)
async def update_consumer_profile(
    data: ConsumerProfileUpdateRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role(UserRole.consumer)),
):
    profile = await consumer_profile_service.get_profile(db, user.id)
    if not profile:
        raise NotFoundError("Consumer profile not found")
    return await consumer_profile_service.update_profile(db, profile, data)


@router.get("/me/onboarding", response_model=ConsumerOnboardingStatusOut)
async def get_consumer_onboarding_status(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role(UserRole.consumer)),
):
    return await consumer_profile_service.get_onboarding_status(db, user.id)


@router.put("/me/push-subscription", response_model=ConsumerProfileOut)
async def update_push_subscription(
    data: PushSubscriptionRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role(UserRole.consumer)),
):
    return await consumer_profile_service.upsert_push_token(db, user.id, data.subscribed)


@router.post("/me/push-token")
async def save_push_token(
    data: dict,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role(UserRole.consumer)),
):
    """Save the full Web Push subscription object (JSON string) on the consumer profile."""
    push_token = data.get("push_token", "")
    profile = await consumer_profile_service.get_profile(db, user.id)
    if profile:
        profile.push_token = push_token
        profile.push_subscribed = True
        db.add(profile)
        await db.commit()
    return {"message": "Push token saved"}
