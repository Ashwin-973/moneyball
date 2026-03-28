"""FastAPI dependencies — DB session, auth, RBAC."""

from collections.abc import AsyncGenerator, Callable
from typing import Annotated
from uuid import UUID

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import UserRole
from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.security import decode_token
from app.db.session import async_session_factory
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Yield an async DB session and ensure it is closed."""
    async with async_session_factory() as session:
        try:
            yield session
        finally:
            await session.close()


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Decode the JWT, verify it is an access token, and return the User."""
    payload = decode_token(token)

    if payload.get("type") != "access":
        raise UnauthorizedError(detail="Invalid token type")

    user_id_str = payload.get("sub")
    if user_id_str is None:
        raise UnauthorizedError(detail="Token missing subject")

    try:
        user_id = UUID(user_id_str)
    except ValueError as exc:
        raise UnauthorizedError(detail="Invalid user ID in token") from exc

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise UnauthorizedError(detail="User not found")
    if not user.is_active:
        raise UnauthorizedError(detail="User account is deactivated")

    return user


def require_role(*roles: UserRole) -> Callable:
    """Return a dependency that checks the current user has an allowed role."""

    async def role_checker(
        current_user: Annotated[User, Depends(get_current_user)],
    ) -> User:
        if current_user.role not in roles:
            raise ForbiddenError(
                detail=f"Role '{current_user.role.value}' is not permitted. "
                f"Required: {', '.join(r.value for r in roles)}"
            )
        return current_user

    return role_checker
