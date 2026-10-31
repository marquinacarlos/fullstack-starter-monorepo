# Web (React + Vite)

Browser app. Port **5173**.
The Home page has one independent panel per channel. <!-- scaffold:line channels -->

| Command      | What it does                               |
| ------------ | ------------------------------------------ |
| `pnpm dev`   | Vite dev server on http://localhost:5173   |
| `pnpm build` | Type check + production build into `dist/` |
| `pnpm lint`  | ESLint (root config)                       |
| `pnpm test`  | Vitest (logic only, one smoke test)        |

Env: `VITE_API_URL` comes from `.env.development` (dev) or `.env.production` (build) in this folder. See [docs/SETUP.md](../../docs/SETUP.md#environment-variables). <!-- scaffold:line channels -->

Docs: [ROUTES](docs/ROUTES.md), [I18N](docs/I18N.md).
Panels: [PANELS](docs/PANELS.md). <!-- scaffold:line channels -->
