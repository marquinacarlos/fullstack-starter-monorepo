# Backend structure

```
apps/api/
├── app/
│   ├── main.py              creates the app, mounts middlewares and channels
│   ├── core/
│   │   ├── config.py        pydantic-settings; env file chosen by APP_ENV
│   │   ├── middlewares.py   CORS + RequestID + Logging
│   │   └── security.py      placeholder (no auth)
│   ├── db/
│   │   ├── base.py          SQLAlchemy declarative Base
│   │   └── session.py       engine, SessionLocal, get_db
│   ├── models/item.py       Item table (id, name, description, created_at)
│   ├── schemas/             pydantic models: item.py, health.py
│   └── api/
│       ├── deps.py          shared dependencies (DbSession)
│       ├── routes/          REST: health.py, items.py
│       ├── graphql/         GraphQL: schema.py, resolvers.py
│       └── websocket/       WebSocket: ws.py
├── tests/                   pytest: conftest.py, test_health, test_items, test_graphql
├── alembic/                 migrations (versions/0001_create_items.py)
├── alembic.ini
├── .env.development         safe local defaults (committed)
├── .env.production.example  template for production values
├── pyproject.toml           dependencies (managed with uv)
├── Dockerfile
└── docs/
```

## Rules

- `models/` and `schemas/` are shared by REST and GraphQL. Channels never import each other.
- Middlewares are added in a specific order. Read the comment in `add_middlewares()` before changing it.
- To add a model: create it in `models/`, export it in `models/__init__.py`, then run `uv run alembic revision --autogenerate -m "message"` and `pnpm migrate`.
