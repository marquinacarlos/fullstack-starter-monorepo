# Backend structure

```
apps/api/
├── app/
│   ├── main.py              creates the app, mounts middlewares and channels
│   ├── core/
│   │   ├── config.py        pydantic-settings; env file chosen by APP_ENV
│   │   ├── errors.py        PublicError: expected errors, one log line, keep CORS headers
│   │   ├── middlewares.py   CORS + RequestID + Logging
│   │   └── security.py      placeholder (no auth)
│   ├── db/
│   │   ├── databases.py     Database class + one instance per database (sqlite_db, postgres_db)
│   │   ├── errors.py        DatabaseDisabled / DatabaseUnavailable (503)
│   │   ├── migrate.py       upgrades every enabled and reachable database
│   │   └── alembic_env.py   shared body of each Alembic env.py
│   ├── models/
│   │   ├── sqlite/          Item (demo table)
│   │   └── postgres/        empty on purpose
│   ├── schemas/             pydantic models: item.py, health.py, database.py
│   └── api/
│       ├── deps.py          SqliteSession, PostgresSession
│       ├── routes/          REST: health.py, databases.py, items.py
│       ├── graphql/         GraphQL: schema.py, resolvers.py
│       └── websocket/       WebSocket: ws.py
├── tests/                   pytest: conftest, test_health, test_items, test_graphql, test_databases
├── alembic/
│   ├── sqlite/              env.py, script.py.mako, versions/ (one history per database)
│   └── postgres/            same
├── alembic.ini              one section per database: [sqlite], [postgres]
├── .env.development         safe local defaults (committed)
├── .env.production.example  template for production values
├── pyproject.toml           dependencies (managed with uv)
├── Dockerfile
└── docs/
```

## Rules

- `schemas/` is shared by REST and GraphQL. Models live in one package per database. Channels never import each other.
- Middlewares are added in a specific order. Read the comment in `add_middlewares()` before changing it.
- To add a model: see [docs/DATABASES.md](../../../docs/DATABASES.md#add-a-model-to-a-database). A model belongs to one database and uses that database's `Base`.
