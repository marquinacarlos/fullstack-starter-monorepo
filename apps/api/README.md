# API (FastAPI)

Python backend with three independent channels: REST, GraphQL and WebSocket. Optional databases (SQLite on by default, PostgreSQL ready) via SQLAlchemy 2 and Alembic. No authentication.

## Commands

Run them from the repo root with Turborepo (`pnpm dev`) or here with `pnpm`:

| Command | What it does |
| --- | --- |
| `pnpm dev` | Applies migrations, then `uvicorn --reload` on http://localhost:8000 |
| `pnpm migrate` | Upgrades every database that is enabled and reachable (strict: fails if a migration fails) |
| `pnpm lint` | `ruff check` + `ruff format --check` |
| `pnpm test` | `pytest` (no Docker, no files: in-memory SQLite) |
| `pnpm build` | Byte-compiles `app/` to catch syntax errors |

Install Python dependencies with `uv sync`.

## Environment

Files in this folder: `.env.development` (committed, safe defaults), `.env.production.example` (template), `.env.production` and `.env.local` (git-ignored). `APP_ENV` picks the file (default `development`); real environment variables always win. `CORS_ORIGINS` is required. `SQLITE_URL` and `POSTGRES_URL` are optional: an empty value turns that database off. See [docs/DATABASES.md](../../docs/DATABASES.md). Full guide: [docs/SETUP.md](../../docs/SETUP.md#environment-variables).

## Endpoints

| Channel | URL |
| --- | --- |
| REST | `GET /health`, `GET /health/databases`, `GET /api/items`, `POST /api/items` |
| GraphQL | `POST /graphql` (GraphiQL on `GET /graphql`) |
| WebSocket | `ws://localhost:8000/ws` |
| OpenAPI | http://localhost:8000/docs |

More: [docs/ENDPOINTS.md](docs/ENDPOINTS.md), [docs/CHANNELS.md](docs/CHANNELS.md), [docs/STRUCTURE.md](docs/STRUCTURE.md).
