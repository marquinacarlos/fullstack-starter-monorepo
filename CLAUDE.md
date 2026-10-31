# Project instructions

<!-- scaffold:begin template -->

**Read `docs/AI_CONTEXT.md` first.** It has the map of this monorepo, what is core and what you can remove, the decision matrix, conventions and warnings.
<!-- scaffold:end template -->
<!-- scaffold:begin !template -->

**Read `docs/AI_CONTEXT.md` first.** It has the map of this monorepo, its conventions and warnings.
<!-- scaffold:end !template -->

Quick rules (details in the docs):

- Layout: `apps/*` and `packages/*`. pnpm + Turborepo.
- The API is Python, managed with uv. <!-- scaffold:line api -->
- Every channel and library has its own visible, independent proof in the UI. Do not couple panels together and do not add features "just in case". <!-- scaffold:line channels -->
- Responsive is **mobile first**: base classes style the phone, `sm:`/`md:`/`lg:` enlarge. Check 320, 375, 768 and 1280 px before finishing UI work (`docs/TAILWIND.md`). <!-- scaffold:line frontends -->
- Tailwind v4 is CSS-first: never create `tailwind.config.*`. <!-- scaffold:line tailwind -->
- i18n: one JSON file per namespace per language. See `docs/I18N.md`. <!-- scaffold:line frontends -->
- Databases are optional and independent. See `docs/DATABASES.md`. <!-- scaffold:line db-layer -->
- Env files live in each app folder (`.env.development` committed, `.env.production`/`.env.local` ignored). No root `.env`, no real secrets in git. See `docs/SETUP.md`.
- `apps/landing` is a static frontend: no route handlers, no server actions. <!-- scaffold:line landing -->
- The demo section of `apps/landing` calls the API from the browser (see `apps/landing/docs/CONNECTED.md`). <!-- scaffold:line landing-demo -->
- Tests cover logic and data only: no component tests, no E2E.
- Starting a new project from this template? Follow `docs/NEW_PROJECT.md`. <!-- scaffold:line template -->
- Changing the template itself? Every option is in `scripts/scaffold/features.mjs`: read `docs/SCAFFOLD.md` first. <!-- scaffold:line template -->

Commands (from the repo root):

| Command          | Use                                                                  |
| ---------------- | -------------------------------------------------------------------- |
| `pnpm bootstrap` | First run: install and set everything up (no Docker needed)          |
| `pnpm dev`       | Run every app                                                        |
| `pnpm check`     | Before every commit: format check, lint, tests, build (API included) |
