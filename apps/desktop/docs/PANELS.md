# Evidence panels (desktop)

Same panels as the web app, copied on purpose so each app can be deleted alone.

| Panel     | File                               | Proves                                                                      |
| --------- | ---------------------------------- | --------------------------------------------------------------------------- |
| REST      | `src/panels/PanelREST.tsx`         | `REST /health: connected`, axios, zod <!-- scaffold:line rest -->           |
| GraphQL   | `src/panels/PanelGraphQL.tsx`      | `GraphQL health: ok` <!-- scaffold:line graphql -->                         |
| WebSocket | `src/panels/PanelWebSocket.tsx`    | `WebSocket: connected`, live counter, echo <!-- scaffold:line websocket --> |
| Databases | `src/panels/PanelDatabases.tsx`    | The state of each database <!-- scaffold:line db-status -->                 |
| Updates   | `src/components/UpdatesStatus.tsx` | `Updates: dev mode, disabled` (IPC to the main process)                     |

Rules and removal steps are the same as in [apps/web/docs/PANELS.md](../../web/docs/PANELS.md). <!-- scaffold:line web,channels -->

## Desktop differences

- The router is `HashRouter` (a packaged app loads `file://`).
- `VITE_API_URL` is read at build time: from `.env.development` in dev and from `.env.production` for `pnpm dist:desktop`. A packaged app calls that URL, so create `.env.production` first. <!-- scaffold:line channels -->
- The renderer is sandboxed: it has no Node.js. All native access goes through `src/preload.ts`.
