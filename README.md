# Fullstack Starter Monorepo

A reusable template for full-stack projects, built as a **pnpm + Turborepo** monorepo.

| Part           | Path                       | Stack                                                                                    |
| -------------- | -------------------------- | ---------------------------------------------------------------------------------------- |
| API            | `apps/api`                 | Python, FastAPI <!-- scaffold:line api -->                                               |
| Web            | `apps/web`                 | React, Vite, React Router <!-- scaffold:line web -->                                     |
| Desktop        | `apps/desktop`             | Electron, React, Vite, electron-builder, electron-updater <!-- scaffold:line desktop --> |
| Landing        | `apps/landing`             | Next.js (App Router), next-intl <!-- scaffold:line landing -->                           |
| Shared UI      | `packages/ui`              | React components <!-- scaffold:line ui -->                                               |
| Shared clients | `packages/lib`             | Typed API clients and zod schemas <!-- scaffold:line lib -->                             |
| Shared styles  | `packages/tailwind-config` | Tailwind v4 tokens <!-- scaffold:line tailwind -->                                       |

Every library and every channel included has its own visible proof on screen when you run `pnpm dev`.

- REST: `/health`. <!-- scaffold:line rest -->
- Demo items, listed by the panels. <!-- scaffold:line items -->
- Database status: `GET /health/databases`. <!-- scaffold:line db-status -->
- GraphQL: `POST /graphql`, with the GraphiQL explorer. <!-- scaffold:line graphql -->
- WebSocket: `/ws`, a counter and an echo. <!-- scaffold:line websocket -->
- SQLite: a local file, on by default in development. <!-- scaffold:line sqlite -->
- PostgreSQL: ready to connect with `pnpm db:up` (Docker). <!-- scaffold:line postgres -->

If your project does not need something, remove it. <!-- scaffold:line template -->

## Quick start

```bash
pnpm bootstrap   # install everything and create the tables (no Docker needed)
pnpm db:seed     # optional: demo data <!-- scaffold:line items -->
pnpm dev         # run every app
```

- Starting a new project from this template: [docs/NEW_PROJECT.md](docs/NEW_PROJECT.md).
- Requirements, ports and environment variables: [docs/SETUP.md](docs/SETUP.md).
- If you are an AI agent, read [docs/AI_CONTEXT.md](docs/AI_CONTEXT.md) first.
