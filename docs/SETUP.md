# Setup

## Requirements

- Node.js >= 22.13 (pnpm 11 needs it; CI uses 24) and pnpm >= 11 (the repo pins `packageManager`)
- Python >= 3.12 and [uv](https://docs.astral.sh/uv/)
- Docker (optional: only if you want PostgreSQL)

## First run

Fast way (needs `uv`; Docker is **not** needed):

```bash
pnpm bootstrap
pnpm dev
```

`pnpm bootstrap` does the manual steps below and is safe to run again. If you prefer to do them yourself:

```bash
pnpm install
(cd apps/api && uv sync)
pnpm db:migrate
pnpm dev
```

`pnpm dev` starts everything:

| App     | URL                                                             |
| ------- | --------------------------------------------------------------- |
| API     | http://localhost:8000 (docs at `/docs`, GraphiQL at `/graphql`) |
| Web     | http://localhost:5173                                           |
| Desktop | Electron window (renderer on port 5174)                         |
| Landing | http://localhost:3000                                           |

Open web or desktop: you should see three panels (REST, GraphQL, WebSocket) with green status. The items lists are empty until you run `pnpm db:seed` (it adds 3 demo items; see [DATABASES.md](DATABASES.md#seeds-demo-data)). Landing shows EN/ES buttons.

If something shows an error, see [Troubleshooting](#troubleshooting).

## API in Docker (optional)

```bash
docker compose --profile api up -d
```

This builds `apps/api/Dockerfile`, starts PostgreSQL, applies its migrations and serves on port 8000 (in the container only PostgreSQL is enabled).

## Environment variables

Each app reads its env files from **its own folder**. There is no root `.env`. Development values come ready, so you copy nothing.

| File (in each app folder) | In git? | Purpose                                                                  |
| ------------------------- | ------- | ------------------------------------------------------------------------ |
| `.env.development`        | Yes     | Safe local defaults, used by `pnpm dev`. **Never put real secrets here** |
| `.env.production.example` | Yes     | Template for production, with placeholder values                         |
| `.env.production`         | No      | The real production values (copy from the template)                      |
| `.env.local`              | No      | Your personal overrides and any secret you need locally                  |

Production values can also come from your hosting or CI as real environment variables. For the API they always win over files.

| Variable                    | App            | Notes                                                                                                                          |
| --------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `SQLITE_URL`                | api            | Optional. Dev: `sqlite:///./dev.db` (on). Empty = disabled                                                                     |
| `POSTGRES_URL`              | api            | Optional. Dev matches `docker-compose.yml`. Empty = disabled                                                                   |
| `CORS_ORIGINS`              | api            | Required, no default. Comma-separated browser origins                                                                          |
| `APP_ENV`                   | api            | Picks the file: `.env.<APP_ENV>`. Default `development`                                                                        |
| `VITE_API_URL`              | web, desktop   | **Public** (inside the bundle). Dev: `.env.development`. Build: `.env.production`                                              |
| `POSTGRES_USER/PASSWORD/DB` | docker-compose | Optional. Defaults to `app`. To change them use a root `.env` (git-ignored) and update `POSTGRES_URL` in `apps/api/.env.local` |

Landing: `NEXT_PUBLIC_API_URL` in `apps/landing/.env.development` (same value as `VITE_API_URL`). It is **public** and baked into the static files. Without it the landing still works; only its demo section shows a hint.

How files are chosen:

- **API**: real env vars > `.env.local` > `.env.<APP_ENV>`. `CORS_ORIGINS` is required and stops the API at startup if missing. The database URLs are optional: empty means that database is off (see [DATABASES.md](DATABASES.md)).
- **Web and desktop (Vite)**: `pnpm dev` uses `.env.development`; `pnpm build` uses `.env.production`. Personal `.env.local` applies to both. If `VITE_API_URL` is missing, the app stops with a clear error instead of calling `localhost`.
- **Turborepo**: `.env*` files are build inputs, so editing one (even an ignored one) rebuilds instead of reusing the cache.

Rules: never commit secrets (this repo is public), and remember `VITE_*` values are public.

## Other commands

```bash
pnpm check           # format check + lint + tests + build, API included (run before a commit)
pnpm lint            # ESLint everywhere + ruff for the API
pnpm test            # vitest per app + pytest for the API
pnpm build           # build all, including Electron (compile only)
pnpm dist:desktop    # create installers (see ELECTRON.md)
pnpm format          # Prettier for TS/JS/CSS/MD/JSON
pnpm db:migrate         # create or upgrade the tables of every enabled database
pnpm db:seed            # add demo data (needs the tables; see DATABASES.md#seeds-demo-data)
```

## Troubleshooting

- **"Could not load items"** (REST or GraphQL panel): the demo items live in SQLite. Open the **Databases** panel (or `GET /health/databases`). If SQLite shows "disabled", set `SQLITE_URL` again. If it shows "not available", check the file path and permissions. Everything else keeps working on purpose: each panel proves its own channel.
- **PostgreSQL shows "not available"**: it is optional and not running. Start it with `pnpm db:up`. The panel updates by itself.
- **`REST /health: error`** or **`WebSocket: disconnected`**: the API itself is not running. Look at the `@repo/api:dev` lines in the terminal.
- **The terminal prints the same error again and again**: read the first one. Usually it is the database (above) or a port already in use.

- **Port already in use**: web and desktop use `strictPort`, so they fail instead of moving to another port (CORS depends on fixed ports).
- **Electron does not open / "Electron uninstall"**: the binary is downloaded by the `postinstall` script of `apps/desktop`. If you were offline, run `pnpm --filter @repo/desktop exec install-electron`.
- **`ERR_PNPM_IGNORED_BUILDS`**: see [MONOREPO_GUIDE.md](MONOREPO_GUIDE.md#dependencies-and-install-scripts).
