# REST endpoints

REST returns plain JSON.

## `GET /health`

Liveness probe. Does **not** touch the database.

```json
{ "status": "ok" }
```

<!-- scaffold:begin db-status -->

## `GET /health/databases`

State of each database. Always `200`: a disabled or stopped database is a state to report, not an API failure.

```json
{
  "databases": [{ "name": "<name>", "label": "<Label>", "status": "connected" }]
}
```

`status` is `connected`, `disabled` (URL empty) or `unavailable` (URL set, server not answering). See [docs/DATABASES.md](../../../docs/DATABASES.md).

<!-- scaffold:end db-status -->
<!-- scaffold:begin items-rest -->

## `GET /api/items`

Returns all items ordered by `id`. Uses the database.

```json
[{ "id": 1, "name": "First", "description": "hello", "created_at": "2026-01-01T10:00:00Z" }]
```

## `POST /api/items`

Creates an item. Returns `201` and the created item.

Body:

```json
{ "name": "First", "description": "optional" }
```

`name` must have 1 to 100 characters, otherwise the API returns `422`.

<!-- scaffold:end items-rest -->

## Headers

Every response has `X-Request-ID`. If the request sends one, the API reuses it.

## Tests

`tests/test_health.py`. See [docs/TESTING.md](../../../docs/TESTING.md).
`tests/test_items.py` covers the items. <!-- scaffold:line items-rest -->

<!-- scaffold:begin db-layer -->

## Errors

<!-- scaffold:begin items-rest -->

If the database that holds the items (SQLite) is disabled or not reachable, `/api/items` answers `503` with a clear message, not a 500 and a long traceback:

```json
{ "detail": "Database 'sqlite' is disabled. Set SQLITE_URL to enable it." }
```

<!-- scaffold:end items-rest -->

The API logs one warning line per request. At startup it logs a summary (`Databases: <name>=connected, ...`).
`/health` never uses a database.
The WebSocket never uses a database either. <!-- scaffold:line websocket -->
In GraphQL, the `items` query returns the same message in `errors`, while `health` keeps working. <!-- scaffold:line graphql,items -->

<!-- scaffold:end db-layer -->
