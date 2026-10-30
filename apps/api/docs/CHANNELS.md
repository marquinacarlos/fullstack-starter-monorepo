# Channels

The API has three channels. Each one lives in its own folder and does not import the others.

| Channel | Folder | Entry point | Needs DB |
| --- | --- | --- | --- |
| REST | `app/api/routes/` | `/health`, `/api/items` | `/api/items` only |
| GraphQL | `app/api/graphql/` | `POST /graphql` | `items` query only |
| WebSocket | `app/api/websocket/` | `/ws` | No |

All are mounted in `app/main.py` in `create_app()`, one line each.

## How each one works

- **REST**: FastAPI routers. Schemas in `app/schemas/`. The DB session comes from `DbSession` in `app/api/deps.py`.
- **GraphQL**: Strawberry. `resolvers.py` defines `Query.health` and `Query.items`. `schema.py` builds the schema and the `GraphQLRouter`. The DB session reaches resolvers through the GraphQL context (`info.context["db"]`).
- **WebSocket**: `ws.py`. Sends `{"type":"counter","value":n}` every second and answers any text message with `{"type":"echo","value":"..."}`.

Resolvers are sync and use the sync SQLAlchemy session. They block the event loop during the query. This is fine for a template; use an async engine if you need high concurrency.

## How to remove a channel

1. Delete the channel folder.
2. Remove its import and `include_router` line in `app/main.py`.
3. Delete its test (`tests/test_graphql.py` for GraphQL).
4. If it was GraphQL, remove the `strawberry-graphql` dependency: `uv remove strawberry-graphql`.
5. Remove the matching panel and client in the frontends. See [docs/CHANNELS.md](../../../docs/CHANNELS.md).

## Production advice

Pick one or two channels. Running REST, GraphQL and WebSocket together triples the surface you must secure, document and test.
