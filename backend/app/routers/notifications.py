"""Notifications router — REST endpoints + SSE stream."""

from __future__ import annotations

import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sse_starlette.sse import EventSourceResponse  # type: ignore

from app.core.dependencies import get_current_user, get_db
from app.core.exceptions import ForbiddenError, NotFoundError
from app.core.security import decode_token
from app.db.session import async_session_factory
from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import NotificationListResponse, NotificationOut
from app.services.notification_service import sse_manager

router = APIRouter()
logger = logging.getLogger("dealdrop.notifications")


# ── GET /notifications ────────────────────────────────────────────────────────


@router.get("", response_model=NotificationListResponse)
async def list_notifications(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: int = Query(default=50, le=100),
):
    """Return recent notifications for the current user, newest first."""
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.sent_at.desc())
        .limit(limit)
    )
    notifications = result.scalars().all()

    unread_count = sum(1 for n in notifications if not n.read)

    return NotificationListResponse(
        items=[NotificationOut.from_orm_obj(n) for n in notifications],
        unread_count=unread_count,
    )


# ── PUT /notifications/{id}/read ──────────────────────────────────────────────


@router.put("/{notification_id}/read", response_model=NotificationOut)
async def mark_notification_read(
    notification_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Mark a single notification as read."""
    try:
        notif_uuid = UUID(notification_id)
    except ValueError:
        raise NotFoundError("Invalid notification ID")

    notification = await db.get(Notification, notif_uuid)
    if not notification:
        raise NotFoundError("Notification not found")
    if str(notification.user_id) != str(current_user.id):
        raise ForbiddenError("Not your notification")

    if not notification.read:
        notification.read = True
        notification.read_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(notification)

    return NotificationOut.from_orm_obj(notification)


# ── PUT /notifications/read-all ───────────────────────────────────────────────


@router.put("/read-all")
async def mark_all_read(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Mark all notifications for the current user as read."""
    await db.execute(
        update(Notification)
        .where(
            Notification.user_id == current_user.id,
            Notification.read == False,  # noqa: E712
        )
        .values(read=True, read_at=datetime.now(timezone.utc))
    )
    await db.commit()
    return {"message": "All notifications marked as read"}


# ── GET /notifications/stream (SSE) ──────────────────────────────────────────


@router.get("/stream")
async def notification_stream(
    token: str = Query(..., description="JWT access token (EventSource cannot set headers)"),
):
    """
    Server-Sent Events endpoint.
    Authenticate via ?token= query param because the EventSource API
    in browsers cannot send custom Authorization headers.
    """
    # Validate token manually
    try:
        payload = decode_token(token)
    except Exception:
        from fastapi.responses import JSONResponse
        return JSONResponse({"detail": "Invalid token"}, status_code=401)

    if payload.get("type") != "access":
        from fastapi.responses import JSONResponse
        return JSONResponse({"detail": "Invalid token type"}, status_code=401)

    user_id_str = payload.get("sub")
    if not user_id_str:
        from fastapi.responses import JSONResponse
        return JSONResponse({"detail": "No subject in token"}, status_code=401)

    # Verify user exists
    async with async_session_factory() as db:
        try:
            user_uuid = UUID(user_id_str)
        except ValueError:
            from fastapi.responses import JSONResponse
            return JSONResponse({"detail": "Invalid user ID"}, status_code=401)

        from sqlalchemy import select as sa_select
        result = await db.execute(
            sa_select(User).where(User.id == user_uuid, User.is_active == True)  # noqa: E712
        )
        user = result.scalar_one_or_none()
        if not user:
            from fastapi.responses import JSONResponse
            return JSONResponse({"detail": "User not found"}, status_code=401)

    async def event_generator():
        queue = await sse_manager.connect(user_id_str)
        try:
            # Send initial connected confirmation
            yield {"data": json.dumps({"type": "connected", "message": "SSE stream connected"})}
            while True:
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=30.0)
                    yield {"data": json.dumps(event)}
                except asyncio.TimeoutError:
                    # Keep-alive ping every 30 s
                    yield {"data": json.dumps({"type": "ping"})}
        except asyncio.CancelledError:
            sse_manager.disconnect(user_id_str)
            raise

    return EventSourceResponse(event_generator())
