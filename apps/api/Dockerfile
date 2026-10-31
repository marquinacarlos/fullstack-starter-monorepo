FROM python:3.12-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy PATH="/app/.venv/bin:$PATH"

# Dependencies first: this layer is cached until pyproject/uv.lock change.
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

COPY . .

EXPOSE 8000
# scaffold:begin db-layer
# Apply migrations (only for databases that are enabled and reachable), then start.
# Fine for development; use a release step in production.
CMD ["sh", "-c", "python -m app.db.migrate && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
# scaffold:end db-layer
# scaffold:begin !db-layer
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
# scaffold:end !db-layer
