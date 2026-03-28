"""Pytest fixtures — shared across all test modules."""

import pytest


@pytest.fixture
def anyio_backend():
    return "asyncio"
