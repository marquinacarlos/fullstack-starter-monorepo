# Testing

Tests cover **logic and data**. They do not cover UI components, and there is no E2E.

## What is tested

| Where                              | Tool                                  | Tests                                                                                                                                                         |
| ---------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/api/tests/test_health.py`    | pytest + httpx (FastAPI `TestClient`) | `GET /health` returns `{"status":"ok"}` without DB; `X-Request-ID` header <!-- scaffold:line api -->                                                          |
| `apps/api/tests/test_items.py`     | same                                  | `GET /api/items`, `POST /api/items`, validation (empty name → 422), and a clear `503` when the database is disabled or down <!-- scaffold:line items-rest --> |
| `apps/api/tests/test_databases.py` | same                                  | The state of each database in `/health/databases`: connected, disabled or unavailable, and `/health` keeps working <!-- scaffold:line db-status -->           |
| `apps/api/tests/test_graphql.py`   | same                                  | Query `health`; query `items` reads stored rows and fails with a clear message when the database is disabled or down <!-- scaffold:line graphql -->           |
| `apps/*/src/smoke.test.ts`         | vitest                                | One smoke test per app: proves the runner works <!-- scaffold:line frontends -->                                                                              |

## What is not tested (on purpose)

- React components and pages (panels, layout). <!-- scaffold:line frontends -->
- Browser automation (no Playwright, no Cypress).
- The WebSocket channel. <!-- scaffold:line websocket -->

The visible panels are the manual proof that the wiring works.

## Run

```bash
pnpm test                    # all apps (turbo)
cd apps/api && uv run pytest # API only <!-- scaffold:line api -->
```

<!-- scaffold:begin api -->

## API tests need no Docker

<!-- scaffold:begin sqlite -->

`tests/__init__.py` sets `SQLITE_URL=sqlite://` (in memory) before the app loads, and `tests/conftest.py` creates the tables on the real SQLite `Database`. This is fast and works in CI.
It also sets an empty `POSTGRES_URL`, so PostgreSQL stays off. <!-- scaffold:line postgres -->
Limit: PostgreSQL-only features are not covered; if you add them, use a real PostgreSQL in tests. <!-- scaffold:line postgres -->
<!-- scaffold:end sqlite -->
<!-- scaffold:begin !sqlite -->

`tests/__init__.py` sets safe values before the app loads. The tests need no database. If you add tests with data, run them against a real database (for example a database service in CI).
<!-- scaffold:end !sqlite -->
<!-- scaffold:end api -->

## Add tests

- **API**: create `tests/test_<topic>.py`, use the `client` fixture. Test business rules that can fail (validation, limits, state changes), not trivial getters. <!-- scaffold:line api -->
- **Frontend logic**: put pure functions in plain `.ts` files (no React) and test them in `src/<name>.test.ts` with vitest. If a rule is only inside a component, move it to a function first. <!-- scaffold:line frontends -->
- Keep the smoke test. It makes `pnpm test` pass in apps with no logic yet.
