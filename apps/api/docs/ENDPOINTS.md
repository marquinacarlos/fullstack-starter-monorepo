# REST endpoints

REST returns plain JSON. It does not use GraphQL.

## `GET /health`

Liveness probe. Does **not** touch the database.

```json
{ "status": "ok" }
```

## `GET /health/databases`

State of each database. Always `200`: a disabled or stopped database is a state to report, not an API failure.

```json
{
  "databases": [
    { "name": "sqlite", "label": "SQLite", "status": "connected" },
    { "name": "postgres", "label": "PostgreSQL", "status": "unavailable" }
  ]
}
```

`status` is `connected`, `disabled` (URL empty) or `unavailable` (URL set, server not answering). See [docs/DATABASES.md](../../../docs/DATABASES.md).

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

## Headers

Every response has `X-Request-ID`. If the request sends one, the API reuses it.

## Tests

`tests/test_health.py` and `tests/test_items.py`. See [docs/TESTING.md](../../../docs/TESTING.md).

## Errors

If the database that holds the items (SQLite) is disabled or not reachable, `/api/items` answers `503` with a clear message, not a 500 and a long traceback:

```json
{ "detail": "Database 'sqlite' is disabled. Set SQLITE_URL to enable it." }
```

The API logs one warning line per request. At startup it logs a summary (`Databases: sqlite=connected, postgres=disabled`). `/health` and the WebSocket never use a database. In GraphQL, the `items` query returns the same message in `errors`, while `health` keeps working.
