# API (FastAPI)

Python backend with three independent channels: REST, GraphQL and WebSocket. PostgreSQL via SQLAlchemy 2 and Alembic. No authentication.

## Commands

Run them from the repo root with Turborepo (`pnpm dev`) or here with `pnpm`:

| Command | What it does |
| --- | --- |
| `pnpm dev` | `uvicorn --reload` on http://localhost:8000 |
| `pnpm migrate` | `alembic upgrade head` (run once after `docker compose up -d db`) |
| `pnpm lint` | `ruff check` + `ruff format --check` |
| `pnpm test` | `pytest` (no Docker needed, uses in-memory SQLite) |
| `pnpm build` | Byte-compiles `app/` to catch syntax errors |

Install Python dependencies with `uv sync`.

## Endpoints

| Channel | URL |
| --- | --- |
| REST | `GET /health`, `GET /api/items`, `POST /api/items` |
| GraphQL | `POST /graphql` (GraphiQL on `GET /graphql`) |
| WebSocket | `ws://localhost:8000/ws` |
| OpenAPI | http://localhost:8000/docs |

More: [docs/ENDPOINTS.md](docs/ENDPOINTS.md), [docs/CHANNELS.md](docs/CHANNELS.md), [docs/STRUCTURE.md](docs/STRUCTURE.md).
