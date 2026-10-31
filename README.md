# Fullstack Starter Monorepo

A reusable template for full-stack projects, built as a **pnpm + Turborepo** monorepo.

| Part    | Path           | Stack                                                                       |
| ------- | -------------- | --------------------------------------------------------------------------- |
| API     | `apps/api`     | Python, FastAPI, REST + GraphQL + WebSocket, optional SQLite and PostgreSQL |
| Web     | `apps/web`     | React, Vite, React Router                                                   |
| Desktop | `apps/desktop` | Electron, React, Vite, electron-builder, electron-updater                   |
| Landing | `apps/landing` | Next.js (App Router), next-intl                                             |
| Shared  | `packages/*`   | `@repo/ui`, `@repo/lib`, `@repo/tailwind-config`                            |

Every library and every channel included has its own visible proof on screen when you run `pnpm dev`. If your project does not need something, remove it.

## Quick start

```bash
pnpm bootstrap   # install everything and create the tables (no Docker needed)
pnpm db:seed     # optional: demo data
pnpm dev         # run every app
```

- Starting a new project from this template: [docs/NEW_PROJECT.md](docs/NEW_PROJECT.md).
- Requirements, ports and environment variables: [docs/SETUP.md](docs/SETUP.md).
- If you are an AI agent, read [docs/AI_CONTEXT.md](docs/AI_CONTEXT.md) first.
