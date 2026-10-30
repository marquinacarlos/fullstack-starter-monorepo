# Testing

Tests cover **logic and data**. They do not cover UI components, and there is no E2E.

## What is tested

| Where                                                          | Tool                                  | Tests                                                                                                                                                                                                                                                           |
| -------------------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/api/tests/test_health.py`                                | pytest + httpx (FastAPI `TestClient`) | `GET /health` returns `{"status":"ok"}` without DB; `X-Request-ID` header                                                                                                                                                                                       |
| `apps/api/tests/test_items.py`                                 | same                                  | `GET /api/items`, `POST /api/items`, validation (empty name → 422)                                                                                                                                                                                              |
| `apps/api/tests/test_databases.py`                             | same                                  | The three states: default (SQLite connected, PostgreSQL disabled), a real unreachable PostgreSQL, SQLite disabled, SQLite down. In each case `/health` and GraphQL `health` still work, items answer `503` with a clear message, and no connection details leak |
| `apps/api/tests/test_graphql.py`                               | same                                  | Query `health`; query `items` reads data created through REST                                                                                                                                                                                                   |
| `apps/web`, `apps/desktop`, `apps/landing` `src/smoke.test.ts` | vitest                                | One smoke test per app: proves the runner works                                                                                                                                                                                                                 |

## What is not tested (on purpose)

- React components and pages (panels, layout).
- Browser or Electron automation (no Playwright, no Cypress).
- The WebSocket channel.

The visible panels are the manual proof that the wiring works.

## Run

```bash
pnpm test                    # all apps (turbo)
cd apps/api && uv run pytest # API only
```

## API tests need no Docker

`tests/__init__.py` sets `SQLITE_URL=sqlite://` (in memory) and an empty `POSTGRES_URL` before the app loads, and `tests/conftest.py` creates the tables on the real SQLite `Database`. This is fast and works in CI. Limit: PostgreSQL-only features are not covered; if you add them, use a real Postgres in tests.

## Add tests

- **API**: create `tests/test_<topic>.py`, use the `client` fixture. Test business rules that can fail (validation, limits, state changes), not trivial getters.
- **Frontend logic**: put pure functions in plain `.ts` files (no React) and test them in `src/<name>.test.ts` with vitest. If a rule is only inside a component, move it to a function first.
- Keep the smoke test. It makes `pnpm test` pass in apps with no logic yet.
