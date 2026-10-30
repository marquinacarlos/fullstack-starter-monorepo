# Evidence panels

Home shows three channel panels and a Databases panel. Each one proves one channel and is independent: own component, own state, own query keys.

| Panel     | File                            | Proves                                                                     | Data source                                 |
| --------- | ------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------- |
| REST      | `src/panels/PanelREST.tsx`      | `REST /health: connected`, `GET /api/items`, `POST /api/items`, axios, zod | `@repo/lib` `api`                           |
| GraphQL   | `src/panels/PanelGraphQL.tsx`   | `GraphQL health: ok` and items by query                                    | `@repo/lib` `graphqlRequest`                |
| WebSocket | `src/panels/PanelWebSocket.tsx` | `WebSocket: connected`, live counter, echo                                 | `@repo/lib` `connectWs`                     |
| Databases | `src/panels/PanelDatabases.tsx` | `SQLite: connected`, `PostgreSQL: not available / connected / disabled`    | `@repo/lib` `api` (`GET /health/databases`) |

## Rules

- A panel does not import another panel, and panels share no hooks or stores.
- Query keys start with the channel name (`["rest", ...]`, `["graphql", ...]`).
- The only shared things are `@repo/ui`, `@repo/lib` and the `QueryClientProvider` in `main.tsx`.

## Remove a panel

1. Delete the panel file.
2. Remove its import and tag in `src/routes/Home.tsx`.
3. Remove its keys (`rest`, `graphql` or `websocket`) from both `home.json` files.
4. Remove the matching client from `@repo/lib` if no other app uses it. See [docs/AI_CONTEXT.md](../../../docs/AI_CONTEXT.md).

## Why do I see "error"?

Each panel fails on its own, so the message tells you what is down:

| You see                                                                     | Meaning                                               | Fix                                                                                   |
| --------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `REST /health: error`, `GraphQL health: error` or `WebSocket: disconnected` | The API is not running                                | Start it with `pnpm dev` and read the `@repo/api:dev` lines                           |
| `Could not load items. They live in the SQLite database`                    | The API runs, but SQLite is disabled or not reachable | Open the Databases panel. See [docs/SETUP.md](../../../docs/SETUP.md#troubleshooting) |
| `PostgreSQL: not available`                                                 | Optional. PostgreSQL is not running                   | `pnpm db:up` (only if you use it)                                                     |

`REST /health`, `GraphQL health` and the WebSocket do not need a database. Only the items lists do (they live in SQLite), so they can fail while the status lines stay green.
