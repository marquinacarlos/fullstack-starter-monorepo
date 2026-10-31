# Backend structure

| Path                              | What it is                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------------ |
| `app/main.py`                     | Creates the app, mounts middlewares and channels                                     |
| `app/core/config.py`              | pydantic-settings; the env file is chosen by `APP_ENV`                               |
| `app/core/errors.py`              | `PublicError`: expected errors, one log line, keep CORS headers                      |
| `app/core/middlewares.py`         | CORS + RequestID + Logging                                                           |
| `app/core/security.py`            | Placeholder (no auth)                                                                |
| `app/db/databases.py`             | `Database` class + one instance per database <!-- scaffold:line db-layer --> |
| `app/db/errors.py`                | `DatabaseDisabled` / `DatabaseUnavailable` (503) <!-- scaffold:line db-layer --> |
| `app/db/migrate.py`               | Upgrades every enabled and reachable database <!-- scaffold:line db-layer --> |
| `app/db/seed.py`                  | Loads the demo data (`app/seeds/<name>.py`) <!-- scaffold:line db-layer --> |
| `app/db/alembic_env.py`           | Shared body of each Alembic `env.py` <!-- scaffold:line db-layer --> |
| `app/models/sqlite/`              | `Item` (demo table) <!-- scaffold:line sqlite --> |
| `app/models/postgres/`            | Empty on purpose <!-- scaffold:line postgres --> |
| `app/schemas/`                    | pydantic models shared by the channels <!-- scaffold:line api --> |
| `app/api/deps.py`                 | One session dependency per database <!-- scaffold:line db-layer --> |
| `app/api/routes/`                 | REST routes <!-- scaffold:line api --> |
| `app/api/graphql/`                | GraphQL: `schema.py`, `resolvers.py` <!-- scaffold:line graphql --> |
| `app/api/websocket/`              | WebSocket: `ws.py` <!-- scaffold:line websocket --> |
| `tests/`                          | pytest: `conftest.py` and one test file per feature <!-- scaffold:line api --> |
| `alembic/<name>/`                 | `env.py`, `script.py.mako`, `versions/` (one history per database) <!-- scaffold:line db-layer --> |
| `alembic.ini`                     | One section per database <!-- scaffold:line db-layer --> |
| `.env.development`                | Safe local defaults (committed) <!-- scaffold:line api --> |
| `.env.production.example`         | Template for production values <!-- scaffold:line api --> |
| `pyproject.toml`, `Dockerfile`    | Dependencies (managed with uv) and the container image <!-- scaffold:line api --> |

## Rules

- `schemas/` is shared by the channels. Models live in one package per database. Channels never import each other.
- Middlewares are added in a specific order. Read the comment in `add_middlewares()` before changing it.
- To add a model: see [docs/DATABASES.md](../../../docs/DATABASES.md#add-a-model-to-a-database). A model belongs to one database and uses that database's `Base`. <!-- scaffold:line db-layer -->
