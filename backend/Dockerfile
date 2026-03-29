FROM python:3.11-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Set working directory
WORKDIR /app

# Enable bytecode compilation and disable cache for smaller image
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

# Install dependencies FIRST (caching mechanism)
# We copy only pyproject.toml and uv.lock so Docker caches the installation step
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project --no-dev

# Copy the rest of the application code
COPY . /app

# Install the project itself
RUN uv sync --frozen --no-dev

# Ensure the paths are correctly set so the virtual environment's python/uvicorn is used
ENV PATH="/app/.venv/bin:$PATH"

# Run alembic migrations and start the fastAPI app
# using $PORT environment variable which Railway provides automatically
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
