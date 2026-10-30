# Web (React + Vite)

Browser app. Port **5173**. The Home page has three independent panels (REST, GraphQL, WebSocket).

| Command      | What it does                               |
| ------------ | ------------------------------------------ |
| `pnpm dev`   | Vite dev server on http://localhost:5173   |
| `pnpm build` | Type check + production build into `dist/` |
| `pnpm lint`  | ESLint (root config)                       |
| `pnpm test`  | Vitest (logic only, one smoke test)        |

Env: `VITE_API_URL` is read from the root `.env` (see `envDir` in `vite.config.ts`).

Docs: [ROUTES](docs/ROUTES.md), [I18N](docs/I18N.md), [PANELS](docs/PANELS.md).
