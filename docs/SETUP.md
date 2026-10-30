# Setup

## Requirements

- Node.js >= 20.19 and pnpm >= 9 (the repo pins `packageManager`)
- Python >= 3.12 and [uv](https://docs.astral.sh/uv/)
- Docker (for PostgreSQL)

## First run

Fast way (needs Docker running and `uv` installed):

```bash
pnpm bootstrap
pnpm dev
```

`pnpm bootstrap` does the manual steps below and is safe to run again. If you prefer to do them yourself:

```bash
pnpm install
(cd apps/api && uv sync)
docker compose up -d db
pnpm --filter @repo/api migrate
pnpm dev
```

`pnpm dev` starts everything:

| App     | URL                                                             |
| ------- | --------------------------------------------------------------- |
| API     | http://localhost:8000 (docs at `/docs`, GraphiQL at `/graphql`) |
| Web     | http://localhost:5173                                           |
| Desktop | Electron window (renderer on port 5174)                         |
| Landing | http://localhost:3000                                           |

Open web or desktop: you should see three panels (REST, GraphQL, WebSocket) with green status. Landing shows EN/ES buttons.

If a panel says "error", the API or DB is not running. Check `docker compose ps`.

## API in Docker (optional)

```bash
docker compose --profile api up -d
```

This builds `apps/api/Dockerfile`, applies migrations and serves on port 8000.

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
| `DATABASE_URL`              | api            | Required, no default. Dev value matches `docker-compose.yml`                                                                   |
| `CORS_ORIGINS`              | api            | Required, no default. Comma-separated browser origins                                                                          |
| `APP_ENV`                   | api            | Picks the file: `.env.<APP_ENV>`. Default `development`                                                                        |
| `VITE_API_URL`              | web, desktop   | **Public** (inside the bundle). Dev: `.env.development`. Build: `.env.production`                                              |
| `POSTGRES_USER/PASSWORD/DB` | docker-compose | Optional. Defaults to `app`. To change them use a root `.env` (git-ignored) and update `DATABASE_URL` in `apps/api/.env.local` |

Landing needs no variables today. If it does, use `NEXT_PUBLIC_*` in `apps/landing/.env.development` (also public).

How files are chosen:

- **API**: real env vars > `.env.local` > `.env.<APP_ENV>`. A missing required value stops the API at startup.
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
```

## Troubleshooting

- **Port already in use**: web and desktop use `strictPort`, so they fail instead of moving to another port (CORS depends on fixed ports).
- **Electron does not open / "Electron uninstall"**: the binary is downloaded by the `postinstall` script of `apps/desktop`. If you were offline, run `pnpm --filter @repo/desktop exec install-electron`.
- **`ERR_PNPM_IGNORED_BUILDS`**: see [MONOREPO_GUIDE.md](MONOREPO_GUIDE.md#dependencies-and-install-scripts).
