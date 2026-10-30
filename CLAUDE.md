# Project instructions

**Read `docs/AI_CONTEXT.md` first.** It has the map of this monorepo, what is core and what you can remove, the decision matrix, conventions and warnings.

Quick rules (details in the docs):

- Layout: `apps/{api,web,desktop,landing}` and `packages/{ui,lib,tailwind-config}`. pnpm + Turborepo; Python managed with uv.
- Every channel (REST, GraphQL, WebSocket) and library has its own visible, independent proof in the UI. Do not couple panels together and do not add features "just in case".
- Responsive is **mobile first**: base classes style the phone, `sm:`/`md:`/`lg:` enlarge. Check 320, 375, 768 and 1280 px before finishing UI work (`docs/TAILWIND.md`).
- Tailwind v4 is CSS-first: never create `tailwind.config.*`.
- i18n: one JSON file per namespace per language. See `docs/I18N.md`.
- Databases are optional and independent (SQLite on by default, PostgreSQL ready). See `docs/DATABASES.md`.
- Env files live in each app folder (`.env.development` committed, `.env.production`/`.env.local` ignored). No root `.env`, no real secrets in git. See `docs/SETUP.md`.
- `apps/landing` is a static frontend: no route handlers, no server actions. Its demo section calls the API from the browser (see `apps/landing/docs/CONNECTED.md`).
- Tests cover logic and data only: no component tests, no E2E.
- Starting a new project from this template? Follow `docs/NEW_PROJECT.md`.

Commands (from the repo root):

| Command          | Use                                                                  |
| ---------------- | -------------------------------------------------------------------- |
| `pnpm bootstrap` | First run: install, `uv sync`, migrations (no Docker needed)         |
| `pnpm dev`       | Run every app                                                        |
| `pnpm check`     | Before every commit: format check, lint, tests, build (API included) |
