"""Notification Pydantic schemas."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class NotificationOut(BaseModel):
    id: str
    user_id: str
    deal_id: str | None
    type: str
    title: str
    body: str
    read: bool
    sent_at: str
    read_at: str | None

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_orm_obj(cls, n: object) -> "NotificationOut":
        """Convert a Notification ORM object into the schema."""
        return cls(
            id=str(getattr(n, "id")),
            user_id=str(getattr(n, "user_id")),
            deal_id=str(getattr(n, "deal_id")) if getattr(n, "deal_id") else None,
            type=str(getattr(n, "type").value if hasattr(getattr(n, "type"), "value") else getattr(n, "type")),
            title=getattr(n, "title"),
            body=getattr(n, "body"),
            read=getattr(n, "read"),
            sent_at=getattr(n, "sent_at").isoformat() if getattr(n, "sent_at") else "",
            read_at=getattr(n, "read_at").isoformat() if getattr(n, "read_at") else None,
        )


class NotificationListResponse(BaseModel):
    items: list[NotificationOut]
    unread_count: int


class PushTokenRequest(BaseModel):
    push_token: str
