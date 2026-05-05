import pytest
from httpx import AsyncClient
from app.main import app
from app.core.dependencies import get_current_user
from app.models.user import User
from app.core.constants import UserRole
from uuid import uuid4

# Mock user for testing authenticated routes
mock_retailer = User(
    id=uuid4(),
    email="retailer@example.com",
    name="Test Retailer",
    role=UserRole.retailer,
    is_active=True
)

async def override_get_current_user():
    return mock_retailer

@pytest.mark.anyio
async def test_get_my_store_unauthorized(client: AsyncClient):
    # Without override, it should fail if no token provided
    response = await client.get("/stores/me")
    assert response.status_code == 401

@pytest.mark.anyio
async def test_get_my_store_not_found(client: AsyncClient):
    # Override the dependency
    app.dependency_overrides[get_current_user] = override_get_current_user
    
    # Mock the service to return None
    with patch("app.services.store_service.get_my_store", return_value=None):
        response = await client.get("/stores/me")
        assert response.status_code == 404
        assert response.json()["detail"] == "Store not found. Complete onboarding first."
    
    # Clean up overrides
    app.dependency_overrides.clear()

from unittest.mock import patch, MagicMock

@pytest.mark.anyio
async def test_create_store_success(client: AsyncClient):
    app.dependency_overrides[get_current_user] = override_get_current_user
    
    payload = {
        "name": "My Shop",
        "address": "123 Main St",
        "lat": 1.23,
        "lng": 4.56,
        "category": "bakery",
        "phone": "555-1234"
    }
    
    mock_store = MagicMock()
    mock_store.id = uuid4()
    mock_store.user_id = mock_retailer.id
    mock_store.name = payload["name"]
    mock_store.address = payload["address"]
    mock_store.lat = payload["lat"]
    mock_store.lng = payload["lng"]
    mock_store.category = payload["category"]
    mock_store.phone = payload["phone"]
    mock_store.open_time = None
    mock_store.close_time = None
    mock_store.is_active = True
    mock_store.policies = None
    
    with patch("app.services.store_service.create_store", return_value=mock_store):
        response = await client.post("/stores", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == payload["name"]
        assert data["address"] == payload["address"]
    
    app.dependency_overrides.clear()
