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
cp .env.example .env
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

Defined in `.env` (root). Both the API and the Vite apps read this file.

| Variable                                            | Used by                   | Default                                                             |
| --------------------------------------------------- | ------------------------- | ------------------------------------------------------------------- |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | docker-compose            | `app`                                                               |
| `DATABASE_URL`                                      | API                       | `postgresql+psycopg://app:app@localhost:5432/app`                   |
| `CORS_ORIGINS`                                      | API (comma-separated)     | `http://localhost:5173,http://localhost:5174,http://localhost:3000` |
| `VITE_API_URL`                                      | web, desktop (build time) | `http://localhost:8000`                                             |

`VITE_*` values are public: they end up in the JS bundle. Never put secrets there.

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
