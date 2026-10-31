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
apps/landing   Next.js App Router + next-intl. Routes: / and /download (under /[locale]). Home has an "Everything is connected" demo (live panels)
packages/tailwind-config   Tailwind v4 tokens (CSS only)
packages/ui                Button, Input, Card
packages/lib               axios, graphql-client, ws-client, zod schemas
docs/                      Project docs (this folder)
```

Ports: api 8000, web 5173, desktop 5174, landing 3000, Postgres 5432 (optional).

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

| If you do not use…           | Remove…                                                                                                                                                                                                                                                                                                                                                              |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **GraphQL**                  | `apps/api/app/api/graphql/`, its import and `include_router` line in `apps/api/app/main.py`, `apps/api/tests/test_graphql.py`, `uv remove strawberry-graphql` in `apps/api`; `PanelGraphQL.tsx` and its tag in `Home.tsx` (web and desktop), `graphql` block in both `home.json` files per app; `packages/lib/src/graphql-client.ts` and its export in `index.ts`    |
| **WebSocket**                | `apps/api/app/api/websocket/`, its import and `include_router` line in `main.py`; `PanelWebSocket.tsx` and tag in `Home.tsx` (web, desktop), `websocket` block in `home.json`; `packages/lib/src/ws-client.ts` and its export                                                                                                                                        |
| **REST**                     | `apps/api/app/api/routes/`, imports in `main.py`, `test_health.py`, `test_items.py` (keep a `/health` route for container health checks if you deploy); `PanelREST.tsx` and tag in `Home.tsx`, `rest` block in `home.json`; `packages/lib/src/axios.ts`. Note: GraphQL and WebSocket do not depend on REST; also `PanelDatabases` (it calls `GET /health/databases`) |
| **SQLite**                   | Easy: empty `SQLITE_URL`. To delete it: [Remove SQLite](#remove-sqlite). The demo items live in SQLite, so they go too                                                                                                                                                                                                                                               |
| **PostgreSQL**               | Easy: empty `POSTGRES_URL`. To delete it: [Remove PostgreSQL](#remove-postgresql)                                                                                                                                                                                                                                                                                    |
| **Any database**             | Do both of the above, then [Remove the whole database layer](#remove-the-whole-database-layer)                                                                                                                                                                                                                                                                       |
| **Desktop app**              | `apps/desktop`, the `dist:desktop` script in root `package.json`, the `electron` job in `.github/workflows/ci.yml`, `docs/ELECTRON.md`, `apps/desktop/` mentions in docs                                                                                                                                                                                             |
| **Web app**                  | `apps/web`, its mentions in docs and CORS origin `5173` in `apps/api/.env.*`                                                                                                                                                                                                                                                                                         |
| **Landing**                  | `apps/landing`, its CI mentions, CORS origin `3000`                                                                                                                                                                                                                                                                                                                  |
| **Live demo in the landing** | Only that section: follow [apps/landing/docs/CONNECTED.md](../apps/landing/docs/CONNECTED.md#remove-the-demo-section). The rest of the landing does not depend on it                                                                                                                                                                                                 |
| **API**                      | `apps/api`, `docker-compose.yml`, `apps/api/.env.*` files, `ruff.toml`, `api` job in CI, and all panels/clients in the frontends                                                                                                                                                                                                                                     |
| **i18n**                     | In an app: `src/i18n/`, `i18next*`/`react-i18next` deps, replace `t()` calls with plain text, remove EN/ES buttons. In landing: `messages/`, `next-intl`, the `[locale]` route segment, `src/app/page.tsx` (root redirect) and `src/app/layout.tsx`                                                                                                                  |
| **Dark mode / zustand**      | `apps/*/src/store/theme.ts`, the toggle button (`Layout.tsx` in web and desktop; in landing `ThemeToggle.tsx`, `ThemeScript.tsx`, and the `<head>` block in `layout.tsx`: see [apps/landing/docs/THEME.md](../apps/landing/docs/THEME.md#remove-the-theme-toggle)), `zustand` dep. Tailwind tokens can stay                                                          |
| **Shared UI**                | `packages/ui`, `@source` line in each app CSS, replace `@repo/ui` imports                                                                                                                                                                                                                                                                                            |
| **Auto-update**              | See `apps/desktop/docs/UPDATES.md`                                                                                                                                                                                                                                                                                                                                   |

When you remove an app or package also run `pnpm install` to refresh the lockfile.

### Removing databases (steps verified in temporary copies)

Each scenario below was applied to a copy of the repo. After it, `pnpm check` passed and the API started and answered. Always finish with `pnpm check`. A removed database never needs the others to change.

#### Remove SQLite

1. Delete `apps/api/app/models/sqlite/`, `apps/api/app/seeds/sqlite.py`, `apps/api/alembic/sqlite/` and the `[sqlite]` section of `apps/api/alembic.ini`.
2. In `app/db/databases.py`: delete the `sqlite_db` instance and take it out of the `databases` list.
3. In `app/core/config.py`: delete `sqlite_url` and its name in `empty_means_disabled`.
4. Delete the `SQLITE_URL` lines in `apps/api/.env.development` and `.env.production.example`, and `"SQLITE_URL"` in `globalPassThroughEnv` (`turbo.json`).
5. In `app/api/deps.py`: delete `SqliteSession`.
6. The demo items live in SQLite, so remove them too:
   - Delete `app/api/routes/items.py` and `app/schemas/item.py`. In `app/main.py` remove `items` from the import and its `include_router` line.
   - In `app/api/graphql/resolvers.py`: delete `ItemType` and the `items` field (keep `health`).
   - Tests: delete `tests/test_items.py`, `tests/test_seed.py` and the items test in `tests/test_graphql.py`. Make `tests/conftest.py` a plain `TestClient` fixture. Remove `SQLITE_URL` from `tests/__init__.py` and the SQLite cases from `tests/test_databases.py`.
   - Web and desktop: remove the items parts of `PanelREST.tsx` and `PanelGraphQL.tsx` (keep the health status) and their `items` keys in the `home.json` files.

#### Remove PostgreSQL

1. Delete `apps/api/app/models/postgres/`, `apps/api/alembic/postgres/` and the `[postgres]` section of `apps/api/alembic.ini`.
2. In `app/db/databases.py`: delete the `postgres_db` instance and take it out of the `databases` list.
3. In `app/core/config.py`: delete `postgres_url` and its name in `empty_means_disabled`.
4. In `app/api/deps.py`: delete `PostgresSession`.
5. Delete the `POSTGRES_URL` lines in `apps/api/.env.*`, and `"POSTGRES_URL"` in `turbo.json`.
6. Delete `docker-compose.yml`, the `db:up` and `db:down` scripts in the root `package.json`, and the "PostgreSQL is optional" line in `scripts/bootstrap.mjs`.
7. In `apps/api`: `uv remove "psycopg[binary]"`.
8. Tests: remove `POSTGRES_URL` from `tests/__init__.py` and the PostgreSQL case from `tests/test_databases.py`.

#### Remove the whole database layer

After removing SQLite and PostgreSQL:

1. Delete `apps/api/app/db/`, `apps/api/app/models/`, `apps/api/app/seeds/`, `apps/api/alembic/`, `apps/api/alembic.ini`, `app/api/routes/databases.py`, `app/schemas/database.py`, `app/api/deps.py`, `tests/test_databases.py` and `tests/test_seed.py`.
2. In `app/main.py`: remove the `databases` route (import and `include_router`), the `lifespan` (and `lifespan=lifespan`), and the `register_db_error_handlers` line with its import.
3. In `app/core/config.py`: delete the database fields, the validator and the `field_validator` import. In the comment above `model_config`, drop "alembic" from "where uvicorn, alembic and pytest run".
4. Remove `migrate`, `seed` and every `db:*` script from `apps/api/package.json`, and `migrate` and `seed` from the root `package.json`. In `apps/api/package.json`, make `dev` just `uvicorn`. In `apps/api/Dockerfile`, drop `python -m app.db.migrate &&` from the CMD and the two comment lines above it ("Apply migrations...").
5. Delete the migrations step in `scripts/bootstrap.mjs`.
6. In `apps/api`: `uv remove sqlalchemy alembic`.
7. Env files: keep only `CORS_ORIGINS`.
8. Web and desktop: delete `PanelDatabases.tsx`, its import and tag in `Home.tsx`, and the `databases` keys in both `home.json` files.

With no database left, the API still serves `/health`, GraphQL `health` and the WebSocket.

## Conventions

- Package names: `@repo/<name>`. Internal dependencies use `workspace:*`. Shared third-party versions use `catalog:` (defined in `pnpm-workspace.yaml`).
- Every app has the scripts `dev`, `build`, `lint`, `test`. Turborepo runs them by name.
- Shared packages are consumed as TypeScript source. They have no build step.
- **Mobile first**: base classes are for phones; add `sm:`/`md:`/`lg:` for wider screens. Every grid has a base `grid-cols-1`. Touch targets are 44 px on phones. See [TAILWIND.md](TAILWIND.md#responsive-design-mobile-first).
- Tailwind v4 is **CSS-first**. Never create `tailwind.config.*`. Tokens live in `packages/tailwind-config/shared-styles.css`.
- i18n: one JSON file per namespace per language. Never one big JSON.
- Panels must stay independent: no shared hooks or stores between them. Query keys start with the channel name.
- Databases are optional and independent: SQLite is on by default, PostgreSQL is ready (`pnpm db:up`). Each has its own models package and Alembic history. Never assume one exists. See [DATABASES.md](DATABASES.md).
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
