# API (FastAPI)

Python backend. Its channels are independent. <!-- scaffold:line channels -->
Optional databases via SQLAlchemy 2 and Alembic. <!-- scaffold:line db-layer -->
No authentication.

## Commands

Run them from the repo root with Turborepo (`pnpm dev`) or here with `pnpm`:

| Command | What it does |
| --- | --- |
| `pnpm dev` | Applies migrations, then `uvicorn --reload` on http://localhost:8000 <!-- scaffold:line db-layer --> |
| `pnpm dev` | `uvicorn --reload` on http://localhost:8000 <!-- scaffold:line !db-layer --> |
| `pnpm db:migrate` | Upgrades every database that is enabled and reachable (strict: fails if a migration fails) <!-- scaffold:line db-layer --> |
| `pnpm db:seed` | Adds demo data to every enabled database that has a seed (needs the tables) <!-- scaffold:line db-layer --> |
| `pnpm db:setup` | `db:migrate`, then `db:seed` <!-- scaffold:line db-layer --> |
| `pnpm db:migrate:create "msg"` | Autogenerates a SQLite migration <!-- scaffold:line sqlite --> |
| `pnpm db:migrate:create "msg"` | Autogenerates a PostgreSQL migration <!-- scaffold:line !only-postgres --> |
| `pnpm db:rollback` | Downgrades the SQLite database by one migration <!-- scaffold:line sqlite --> |
| `pnpm db:rollback` | Downgrades the PostgreSQL database by one migration <!-- scaffold:line !only-postgres --> |
| `pnpm lint` | `ruff check` + `ruff format --check` |
| `pnpm test` | `pytest` (no Docker, no files: in-memory SQLite) <!-- scaffold:line sqlite --> |
| `pnpm test` | `pytest` (no Docker) <!-- scaffold:line !sqlite --> |
| `pnpm build` | Byte-compiles `app/` to catch syntax errors |

Install Python dependencies with `uv sync`.

## Environment

Files in this folder: `.env.development` (committed, safe defaults), `.env.production.example` (template), `.env.production` and `.env.local` (git-ignored). `APP_ENV` picks the file (default `development`); real environment variables always win. `CORS_ORIGINS` is required.
Each database URL is optional: an empty value turns that database off. See [docs/DATABASES.md](../../docs/DATABASES.md). <!-- scaffold:line db-layer -->
Full guide: [docs/SETUP.md](../../docs/SETUP.md#environment-variables).

## Endpoints

| Channel | URL |
| --- | --- |
| REST | `GET /health` <!-- scaffold:line rest --> |
| GraphQL | `POST /graphql` (GraphiQL on `GET /graphql`) <!-- scaffold:line graphql --> |
| WebSocket | `ws://localhost:8000/ws` <!-- scaffold:line websocket --> |
| OpenAPI | http://localhost:8000/docs |

More: [docs/ENDPOINTS.md](docs/ENDPOINTS.md), [docs/STRUCTURE.md](docs/STRUCTURE.md).
Channels: [docs/CHANNELS.md](docs/CHANNELS.md). <!-- scaffold:line channels -->
