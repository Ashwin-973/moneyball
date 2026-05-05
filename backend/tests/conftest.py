import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.session import async_session_factory
from sqlalchemy.ext.asyncio import AsyncSession

@pytest.fixture
def anyio_backend():
    return "asyncio"

@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

@pytest.fixture
async def db_session():
    async with async_session_factory() as session:
        yield session
        await session.rollback()
