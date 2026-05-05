import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.services import auth_service
from app.schemas.auth import RegisterRequest
from app.core.constants import UserRole
from app.core.exceptions import ConflictError

@pytest.mark.anyio
async def test_register_service_email_exists():
    # Mock DB session
    mock_db = AsyncMock()
    # Mock db.execute to return a user (email exists)
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = MagicMock()
    mock_db.execute.return_value = mock_result
    
    data = RegisterRequest(
        email="existing@example.com",
        password="password123",
        name="Test User",
        role=UserRole.consumer
    )
    
    with pytest.raises(ConflictError) as exc:
        await auth_service.register(mock_db, data)
    
    assert exc.value.detail == "Email already registered"

@pytest.mark.anyio
async def test_register_service_success():
    mock_db = AsyncMock()
    # Mock db.execute to return None (email doesn't exist)
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result
    
    # Mock security.hash_password
    with patch("app.core.security.hash_password", return_value="hashed_pw"):
        data = RegisterRequest(
            email="new@example.com",
            password="password123",
            name="New User",
            role=UserRole.consumer
        )
        
        user = await auth_service.register(mock_db, data)
        
        assert user.email == "new@example.com"
        assert user.password_hash == "hashed_pw"
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()
