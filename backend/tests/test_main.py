import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.anyio
async def test_ping():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/ping")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
