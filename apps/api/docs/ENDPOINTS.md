# REST endpoints

REST returns plain JSON. It does not use GraphQL.

## `GET /health`

Liveness probe. Does **not** touch the database.

```json
{ "status": "ok" }
```

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
