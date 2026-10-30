# Evidence panels (desktop)

Same three panels as the web app, copied on purpose so each app can be deleted alone.

| Panel     | File                               | Proves                                                       |
| --------- | ---------------------------------- | ------------------------------------------------------------ |
| REST      | `src/panels/PanelREST.tsx`         | `REST /health: connected`, items list and create, axios, zod |
| GraphQL   | `src/panels/PanelGraphQL.tsx`      | `GraphQL health: ok`, items by query                         |
| WebSocket | `src/panels/PanelWebSocket.tsx`    | `WebSocket: connected`, live counter, echo                   |
| Updates   | `src/components/UpdatesStatus.tsx` | `Updates: dev mode, disabled` (IPC to the main process)      |

Rules and removal steps are the same as in [apps/web/docs/PANELS.md](../../web/docs/PANELS.md).

## Desktop differences

- The router is `HashRouter` (a packaged app loads `file://`).
- `VITE_API_URL` is read at build time: from `.env.development` in dev and from `.env.production` for `pnpm dist:desktop`. A packaged app calls that URL, so create `.env.production` first.
- The renderer is sandboxed: it has no Node.js. All native access goes through `src/preload.ts`.
