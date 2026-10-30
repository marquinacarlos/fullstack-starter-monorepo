# AI context

**Read this file first.** It tells you what is in this repo, what you can remove, and how to extend it.

## What this repo is

A monorepo template (pnpm + Turborepo). Its guiding rule: **every library and channel has independent, visible proof in the UI.** So each piece can be checked alone and removed without breaking the others.

Starting a new project from this template? See [NEW_PROJECT.md](NEW_PROJECT.md).

## Map

```
apps/api       FastAPI. Channels in separate folders: routes/ (REST), graphql/, websocket/
apps/web       React + Vite. Panels: PanelREST, PanelGraphQL, PanelWebSocket
apps/desktop   Electron + React + Vite. Same panels + UpdatesStatus. electron-builder + electron-updater
apps/landing   Next.js App Router + next-intl. Routes: / and /download (under /[locale])
packages/tailwind-config   Tailwind v4 tokens (CSS only)
packages/ui                Button, Input, Card
packages/lib               axios, graphql-client, ws-client, zod schemas
docs/                      Project docs (this folder)
```

Ports: api 8000, web 5173, desktop 5174, landing 3000, Postgres 5432.

## Core vs removable

| Item                                                              | Status                              | Notes                                      |
| ----------------------------------------------------------------- | ----------------------------------- | ------------------------------------------ |
| `package.json`, `pnpm-workspace.yaml`, `turbo.json`, lint configs | Core                                | Keep                                       |
| `packages/tailwind-config`                                        | Core if any frontend stays          | All frontends import it                    |
| `apps/api/app/{core,db,models,schemas}`                           | Core if API stays                   | Shared by REST and GraphQL                 |
| REST (`api/routes`)                                               | Removable                           | See matrix                                 |
| GraphQL (`api/graphql`)                                           | Removable                           | See matrix                                 |
| WebSocket (`api/websocket`)                                       | Removable                           | See matrix                                 |
| `apps/web`, `apps/desktop`, `apps/landing`                        | Each removable alone                | See matrix                                 |
| `packages/ui`, `packages/lib`                                     | Removable if no web/desktop remains |                                            |
| i18n                                                              | Removable per app                   | Heavier to remove: touches every component |
| Auto-update (desktop)                                             | Removable                           | See `apps/desktop/docs/UPDATES.md`         |

## Decision matrix: if you do NOT use X, remove Y

After any removal: update [CHANNELS.md](CHANNELS.md) (and the app docs that mention it), then run `pnpm check` (format check, lint, tests and build, API included).

| If you do not use…      | Remove…                                                                                                                                                                                                                                                                                                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **GraphQL**             | `apps/api/app/api/graphql/`, its import and `include_router` line in `apps/api/app/main.py`, `apps/api/tests/test_graphql.py`, `uv remove strawberry-graphql` in `apps/api`; `PanelGraphQL.tsx` and its tag in `Home.tsx` (web and desktop), `graphql` block in both `home.json` files per app; `packages/lib/src/graphql-client.ts` and its export in `index.ts` |
| **WebSocket**           | `apps/api/app/api/websocket/`, its import and `include_router` line in `main.py`; `PanelWebSocket.tsx` and tag in `Home.tsx` (web, desktop), `websocket` block in `home.json`; `packages/lib/src/ws-client.ts` and its export                                                                                                                                     |
| **REST**                | `apps/api/app/api/routes/`, imports in `main.py`, `test_health.py`, `test_items.py` (keep a `/health` route for container health checks if you deploy); `PanelREST.tsx` and tag in `Home.tsx`, `rest` block in `home.json`; `packages/lib/src/axios.ts`. Note: GraphQL and WebSocket do not depend on REST                                                        |
| **A database**          | `apps/api/app/db`, `models`, `alembic*`, `psycopg`/`sqlalchemy`/`alembic` deps, `db` service in `docker-compose.yml`; the `items` route and query. Then REST/GraphQL `items` features go too                                                                                                                                                                      |
| **Desktop app**         | `apps/desktop`, the `dist:desktop` script in root `package.json`, the `electron` job in `.github/workflows/ci.yml`, `docs/ELECTRON.md`, `apps/desktop/` mentions in docs                                                                                                                                                                                          |
| **Web app**             | `apps/web`, its mentions in docs and CORS origin `5173` in `apps/api/.env.*`                                                                                                                                                                                                                                                                                      |
| **Landing**             | `apps/landing`, its CI mentions, CORS origin `3000`                                                                                                                                                                                                                                                                                                               |
| **API**                 | `apps/api`, `docker-compose.yml`, `apps/api/.env.*` files, `ruff.toml`, `api` job in CI, and all panels/clients in the frontends                                                                                                                                                                                                                                  |
| **i18n**                | In an app: `src/i18n/`, `i18next*`/`react-i18next` deps, replace `t()` calls with plain text, remove EN/ES buttons. In landing: `messages/`, `next-intl`, the `[locale]` route segment, `src/app/page.tsx` (root redirect) and `src/app/layout.tsx`                                                                                                               |
| **Dark mode / zustand** | `apps/*/src/store/theme.ts`, the toggle button in `Layout.tsx`, `zustand` dep. Tailwind tokens can stay                                                                                                                                                                                                                                                           |
| **Shared UI**           | `packages/ui`, `@source` line in each app CSS, replace `@repo/ui` imports                                                                                                                                                                                                                                                                                         |
| **Auto-update**         | See `apps/desktop/docs/UPDATES.md`                                                                                                                                                                                                                                                                                                                                |

When you remove an app or package also run `pnpm install` to refresh the lockfile.

## Conventions

- Package names: `@repo/<name>`. Internal dependencies use `workspace:*`. Shared third-party versions use `catalog:` (defined in `pnpm-workspace.yaml`).
- Every app has the scripts `dev`, `build`, `lint`, `test`. Turborepo runs them by name.
- Shared packages are consumed as TypeScript source. They have no build step.
- Tailwind v4 is **CSS-first**. Never create `tailwind.config.*`. Tokens live in `packages/tailwind-config/shared-styles.css`.
- i18n: one JSON file per namespace per language. Never one big JSON.
- Panels must stay independent: no shared hooks or stores between them. Query keys start with the channel name.
- Env files live in each app folder: `.env.development` (committed, no secrets), `.env.production.example` (committed), `.env.production` and `.env.local` (git-ignored). Never create a root `.env` and never commit real secrets: this repo is public. `VITE_*` values are public. See [SETUP.md](SETUP.md#environment-variables).
- Python: ruff (`ruff.toml` at root), type hints, SQLAlchemy 2 style.
- Tests cover logic and data only. No component tests, no E2E.
- Docs are in English, short sentences, file names in UPPERCASE.

## Warnings

- Do not add a channel "just in case". In production pick one or two ([CHANNELS.md](CHANNELS.md)).
- `apps/landing` is a **static frontend** (`output: "export"`). Never add route handlers (`route.ts`), server actions or `proxy.ts` to it. The backend is `apps/api`. The build fails if you try.
- Do not add `tailwind.config.js`, Playwright, Cypress, or authentication unless the user asks.
- `desktop` and `web` duplicate their panels on purpose. Do not move them into a shared package: it would couple the apps and break "remove one without touching the others".
- Native install scripts are allow-listed in `pnpm-workspace.yaml` (`allowBuilds`). If `pnpm install` fails with `ERR_PNPM_IGNORED_BUILDS`, decide per package and add it there.
- TypeScript is pinned to 6.0 because `typescript-eslint` does not support 7 yet. Check before upgrading.
- Auto-update and installers need a GitHub repo, releases and code signing. See [ELECTRON.md](ELECTRON.md).

## How to add things

| Add…                  | Steps                                                                                                                                                                                                                                         |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **An app**            | [MONOREPO_GUIDE.md](MONOREPO_GUIDE.md#add-an-app)                                                                                                                                                                                             |
| **A package**         | [MONOREPO_GUIDE.md](MONOREPO_GUIDE.md#add-a-package)                                                                                                                                                                                          |
| **A backend channel** | Create `apps/api/app/api/<channel>/`, mount it in `main.py`, add a test, document it in [CHANNELS.md](CHANNELS.md) and `apps/api/docs/CHANNELS.md`. If frontends use it: add a client in `packages/lib` and an independent panel per frontend |
| **An i18n namespace** | [I18N.md](I18N.md#add-a-namespace)                                                                                                                                                                                                            |
| **An i18n language**  | [I18N.md](I18N.md#add-a-language)                                                                                                                                                                                                             |
| **A DB model**        | `apps/api/docs/STRUCTURE.md` (last section)                                                                                                                                                                                                   |
| **A REST endpoint**   | New file in `apps/api/app/api/routes/`, include it in `main.py`, test it in `apps/api/tests/`                                                                                                                                                 |
