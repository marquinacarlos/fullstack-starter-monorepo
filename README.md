# Fullstack Starter Monorepo

A reusable template for full-stack projects, built as a **pnpm + Turborepo** monorepo.

| Part    | Path           | Stack                                                     |
| ------- | -------------- | --------------------------------------------------------- |
| API     | `apps/api`     | Python, FastAPI, PostgreSQL, REST + GraphQL + WebSocket   |
| Web     | `apps/web`     | React, Vite, React Router                                 |
| Desktop | `apps/desktop` | Electron, React, Vite, electron-builder, electron-updater |
| Landing | `apps/landing` | Next.js (App Router), next-intl                           |
| Shared  | `packages/*`   | `@repo/ui`, `@repo/lib`, `@repo/tailwind-config`          |

Every library and every channel included has its own visible proof on screen when you run `pnpm dev`. If your project does not need something, remove it.

Start with [docs/SETUP.md](docs/SETUP.md). If you are an AI agent, read [docs/AI_CONTEXT.md](docs/AI_CONTEXT.md) first.
