# Evidence panels

Home shows one panel per channel. Each one proves one thing and is independent: own component, own state, own query keys.
There is also a Databases panel. <!-- scaffold:line db-status -->

| Panel     | File                            | Proves                                                                      | Data source                                 |
| --------- | ------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------- |
| REST      | `src/panels/PanelREST.tsx`      | `REST /health: connected`, axios, zod <!-- scaffold:line rest -->           | `@repo/lib` `api`                           |
| GraphQL   | `src/panels/PanelGraphQL.tsx`   | `GraphQL health: ok` <!-- scaffold:line graphql -->                         | `@repo/lib` `graphqlRequest`                |
| WebSocket | `src/panels/PanelWebSocket.tsx` | `WebSocket: connected`, live counter, echo <!-- scaffold:line websocket --> | `@repo/lib` `connectWs`                     |
| Databases | `src/panels/PanelDatabases.tsx` | The state of each database <!-- scaffold:line db-status -->                 | `@repo/lib` `api` (`GET /health/databases`) |

The REST and GraphQL panels also list the items stored in the database, and the REST one can create them. <!-- scaffold:line items -->

## Rules

- A panel does not import another panel, and panels share no hooks or stores.
- Query keys start with the channel name.
- The only shared things are `@repo/ui`, `@repo/lib` and the `QueryClientProvider` in `main.tsx`.

## Remove a panel

1. Delete the panel file.
2. Remove its import and tag in `src/routes/Home.tsx`.
3. Remove its keys from both `home.json` files.
4. Remove the matching client from `@repo/lib` if no other app uses it.
   See [docs/AI_CONTEXT.md](../../../docs/AI_CONTEXT.md). <!-- scaffold:line template -->

## Why do I see "error"?

Each panel fails on its own, so the message tells you what is down:

| You see                                                                               | Meaning                                               | Fix                                                                                   |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------- |
| A status line says `error` or `disconnected`                                          | The API is not running                                | Start it with `pnpm dev` and read the `@repo/api:dev` lines                           |
| `Could not load items. They live in the SQLite database` <!-- scaffold:line items --> | The API runs, but SQLite is disabled or not reachable | Open the Databases panel. See [docs/SETUP.md](../../../docs/SETUP.md#troubleshooting) |
| `PostgreSQL: not available` <!-- scaffold:line postgres -->                           | Optional. PostgreSQL is not running                   | `pnpm db:up` (only if you use it)                                                     |

The status lines do not need a database.
Only the items lists do (they live in SQLite), so they can fail while the status lines stay green. <!-- scaffold:line items -->
