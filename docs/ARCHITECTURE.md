# Architecture

This file explains the decisions and the reason for each one.

## Monorepo with pnpm + Turborepo

- **One repo, many apps.** API, web, desktop and landing change together (same API contract), so one PR can update all of them.
- **pnpm workspaces** give strict dependencies (an app cannot import a package it did not declare) and fast installs.
- **Turborepo** runs `dev`, `build`, `lint`, `test` across apps in the right order and caches results.
- **`catalog:`** keeps shared versions (React, Vite, TypeScript, Tailwind) in one place.

## The API is a workspace too

`apps/api/package.json` only wraps `uv run ...` commands. Python stays managed by `uv`, but Turborepo can still start it with the others in `pnpm dev`.

## Independent channels

The rule: **each channel has its own folder in the API, its own client in `@repo/lib`, and its own panel in the UI.**

- You can test one channel without the others.
- You can delete one channel by deleting files, not by untangling shared code.
- Shared code is limited to `models/` and `schemas/` in the API, and `@repo/ui` / `@repo/lib` in the frontends.

Channels do not import each other. GraphQL reads the DB through its own context, not through REST routes.

## Shared packages without a build step

`@repo/ui`, `@repo/lib` and `@repo/tailwind-config` export TypeScript or CSS **source**. Vite and Electron-Vite compile them as part of the app. This removes watch/build pipelines for packages and makes "go to definition" work.
Trade-off: a consumer must be able to compile TypeScript. That is true for every app here. That is why the landing (Next.js) only uses the CSS package and does not need `transpilePackages`.

## Landing is a static frontend

Next.js is used only to build static HTML (`output: "export"` in `apps/landing/next.config.ts`). There is no Node server at runtime and no API in Next: the API is `apps/api`. Because of `output: "export"`, the build fails if someone adds route handlers or server actions. It also means no `proxy.ts` (middleware), so `/` is a normal page that redirects to the default language.
You can host `apps/landing/out/` on any static host or CDN.

## Tailwind v4, CSS-first

No JavaScript config. Tokens are CSS variables in a `@theme` block. Dark mode is a `.dark` class, controlled by a zustand store, so the user's choice wins over the OS setting. See [TAILWIND.md](TAILWIND.md).

## Duplicated panels in web and desktop

The desktop renderer is a copy of the web UI. We accept the duplication because:

- Desktop has real differences (HashRouter, IPC, sandbox).
- Removing one app must not require editing the other.

## Electron

- `electron-vite` builds main, preload and renderer.
- The renderer is sandboxed (`contextIsolation`, no Node). Only `window.updates` is exposed.
- Renderer dependencies are `devDependencies`: Vite bundles them, so the installer only ships `electron-updater`.

## Database

PostgreSQL in Docker Compose for development only. Alembic owns the schema. Tests use in-memory SQLite through a dependency override, so `pytest` needs no Docker. The model uses only portable types for this reason. If you add Postgres-only types (JSONB, arrays), tests need a real Postgres.

## Environment variables

- **One set of files per app, in the app folder.** The API has secrets and the frontends are public, so they must not share a file. A single root `.env` hid that difference and mixed development with production values.
- **Development is committed, production is not.** `.env.development` has safe `localhost` values, so `pnpm dev` needs no setup. Real values go in ignored files (`.env.production`, `.env.local`) or in the hosting/CI. The `.gitignore` ignores every `.env*` by default and allows only the safe ones.
- **No silent defaults.** The API requires `DATABASE_URL` and `CORS_ORIGINS`, and `@repo/lib` throws if `VITE_API_URL` is missing. A production build must never fall back to `localhost`.
- **Tests do not read env files.** `apps/api/tests/__init__.py` sets safe values first.
- **Turborepo** treats `.env*` as build inputs. Without it, editing `.env.production` could reuse a cached build with the old URL (we hit this while testing).

## Not included on purpose

Authentication (`core/security.py` is a placeholder), E2E/component tests, production deployment, an ORM-agnostic layer. Add them when a project needs them.
