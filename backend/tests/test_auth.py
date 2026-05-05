import pytest
from httpx import AsyncClient
from unittest.mock import patch, MagicMock

@pytest.mark.anyio
async def test_register_consumer_success(client: AsyncClient):
    payload = {
        "email": "test_consumer@example.com",
        "password": "password123",
        "name": "Test Consumer",
        "role": "consumer"
    }
    
    mock_user = MagicMock()
    mock_user.email = payload["email"]
    mock_user.role = "consumer"
    mock_user.name = payload["name"]
    from uuid import uuid4
    mock_user.id = uuid4()

    # Mock register and login services
    with patch("app.services.auth_service.register", return_value=mock_user), \
         patch("app.services.auth_service.login", return_value=(mock_user, "access", "refresh")):
        
        response = await client.post("/auth/register", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["access_token"] == "access"
        assert data["user"]["email"] == payload["email"]

@pytest.mark.anyio
async def test_login_invalid_credentials(client: AsyncClient):
    payload = {
        "email": "nonexistent@example.com",
        "password": "wrongpassword"
    }
    
    from app.core.exceptions import UnauthorizedError
    with patch("app.services.auth_service.login", side_effect=UnauthorizedError(detail="Invalid email or password")):
        response = await client.post("/auth/login", json=payload)
        assert response.status_code == 401
        assert response.json()["detail"] == "Invalid email or password"

@pytest.mark.anyio
async def test_refresh_token_invalid(client: AsyncClient):
    payload = {
        "refresh_token": "invalid_token"
    }
    
    from app.core.exceptions import UnauthorizedError
    with patch("app.services.auth_service.refresh_tokens", side_effect=UnauthorizedError(detail="Invalid token")):
        response = await client.post("/auth/refresh", json=payload)
        assert response.status_code == 401
