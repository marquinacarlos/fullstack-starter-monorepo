# Channels

The API has up to three channels. Each one lives in its own folder and does not import the others.

| Channel   | Folder               | Entry point     |
| --------- | -------------------- | --------------- |
| REST      | `app/api/routes/`    | `/health` <!-- scaffold:line rest --> |
| GraphQL   | `app/api/graphql/`   | `POST /graphql` <!-- scaffold:line graphql --> |
| WebSocket | `app/api/websocket/` | `/ws` <!-- scaffold:line websocket --> |

All are mounted in `app/main.py` in `create_app()`, one line each.

## How each one works

- **REST**: FastAPI routers. Schemas in `app/schemas/`. A route that needs a database takes its session from the dependencies in `app/api/deps.py`. <!-- scaffold:line rest -->
- **GraphQL**: Strawberry. `resolvers.py` defines the `Query` type. `schema.py` builds the schema and the `GraphQLRouter`. <!-- scaffold:line graphql -->
- **WebSocket**: `ws.py`. Sends `{"type":"counter","value":n}` every second and answers any text message with `{"type":"echo","value":"..."}`. <!-- scaffold:line websocket -->

GraphQL resolvers that need a database open their own session (`with <name>_db.session() as db:`). They are sync and use the sync SQLAlchemy session, so they block the event loop during the query. This is fine for a template; use an async engine if you need high concurrency. <!-- scaffold:line graphql,db-layer -->

<!-- scaffold:begin template -->

## How to remove a channel

1. Delete the channel folder.
2. Remove its import and `include_router` line in `app/main.py`.
3. Delete its test (`tests/test_graphql.py` for GraphQL).
4. If it was GraphQL, remove the `strawberry-graphql` dependency: `uv remove strawberry-graphql`.
5. Remove the matching panel and client in the frontends. See [docs/CHANNELS.md](../../../docs/CHANNELS.md). Or run `pnpm scaffold` on a fresh copy of the template.

<!-- scaffold:end template -->

## Production advice

Pick one or two channels. Running several together multiplies the surface you must secure, document and test.
