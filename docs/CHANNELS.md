# Channels

The template includes three ways for a client to talk to the API. Each one is independent.

|                               | REST                              | GraphQL                         | WebSocket                     |
| ----------------------------- | --------------------------------- | ------------------------------- | ----------------------------- |
| API folder                    | `apps/api/app/api/routes/`        | `apps/api/app/api/graphql/`     | `apps/api/app/api/websocket/` |
| Endpoint                      | `/health`, `/api/items`           | `POST /graphql`                 | `/ws`                         |
| Client                        | `@repo/lib` `axios.ts`            | `@repo/lib` `graphql-client.ts` | `@repo/lib` `ws-client.ts`    |
| Panel (web, desktop, landing) | `PanelREST.tsx`                   | `PanelGraphQL.tsx`              | `PanelWebSocket.tsx`          |
| Returns                       | Plain JSON                        | JSON from a query               | Messages in both directions   |
| Test                          | `test_health.py`, `test_items.py` | `test_graphql.py`               | none (see note)               |

Note: the WebSocket channel has no automated test in this template. Its proof is the live panel.

## How they work

- **REST**: one URL per resource and one HTTP method per action. Simple, cacheable, easy to debug with curl. Good default.
- **GraphQL**: one URL, the client chooses the fields in the query. Good when many clients need different shapes of the same data, or to avoid many round trips. More server complexity (schema, resolvers, N+1 risk).
- **WebSocket**: one long-lived connection. The server can push data at any time. Use it only for real-time features (chat, live data). Every open socket costs server memory and needs reconnection logic.

The WebSocket demo sends a counter every second and echoes what you send.

## How to remove a channel

Use the decision matrix in [AI_CONTEXT.md](AI_CONTEXT.md#decision-matrix-if-you-do-not-use-x-remove-y). Short version, per channel: delete the API folder and its `include_router` line, delete the client in `@repo/lib`, delete the panel in web and desktop (and its i18n keys), delete the test. Then update this file and `apps/api/docs/CHANNELS.md`.

## Production advice

**Choose one or two channels.** Running all three means three contracts to document, secure, version and test. A common choice: REST (or GraphQL) for data, plus WebSocket only if you need live updates.
Also remember this template has no authentication. Add it before exposing any channel.
