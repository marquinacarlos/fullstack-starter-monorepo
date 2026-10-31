# Monorepo guide

## Layout

`pnpm-workspace.yaml` lists the workspaces: `apps/*` and `packages/*`. It also holds the `catalog:` of shared versions and the `allowBuilds` list.

## Commands

| Command                            | What it does                                                                  |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| `pnpm bootstrap`                   | First run: installs, migrations (no Docker needed)                            |
| `pnpm db:up` / `pnpm db:down`      | Start / stop the optional PostgreSQL (Docker) <!-- scaffold:line postgres --> |
| `pnpm db:migrate`                  | Upgrades every enabled and reachable database <!-- scaffold:line db-layer --> |
| `pnpm dev`                         | Runs `dev` in every app                                                       |
| `pnpm check`                       | Format check + lint + test + build                                            |
| `pnpm build`                       | Builds everything                                                             |
| `pnpm lint` / `pnpm test`          | Lint / test everywhere                                                        |
| `pnpm dist:desktop`                | Builds the Electron installers <!-- scaffold:line desktop -->                 |
| `pnpm --filter @repo/web dev`      | Runs one app <!-- scaffold:line web -->                                       |
| `pnpm --filter @repo/web... build` | One app and its dependencies <!-- scaffold:line web -->                       |

## turbo.json

| Task    | Config                                                   | Why                                        |
| ------- | -------------------------------------------------------- | ------------------------------------------ |
| `dev`   | `persistent`, no cache                                   | Long-running servers                       |
| `build` | `dependsOn: ["^build"]`, `outputs` for the build folders | Build dependencies first, cache the output |
| `lint`  | `dependsOn: ["^lint"]`                                   |                                            |
| `test`  | `dependsOn: ["^build"]`                                  |                                            |

`globalEnv` lists env vars that change the build. The `build` task has `.env*` as inputs, so editing an env file (even an ignored one like `.env.production`) invalidates the cache.
`globalPassThroughEnv` lets the API see its environment variables (Turborepo hides undeclared variables). <!-- scaffold:line api -->

## CI

One workflow per piece, so adding or removing an app is adding or deleting a file. The steps they share live in `.github/actions/`.

| File                 | What it runs                                                                                                                                                          |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ci-base.yml`        | Prettier on the whole repo                                                                                                                                            |
| `ci-web.yml`         | `turbo run lint test build` for the web app and the packages it uses. On pull requests only when the change affects it (`--affected`) <!-- scaffold:line web -->      |
| `ci-landing.yml`     | `turbo run lint test build` for the Next app and the packages it uses. On pull requests only when the change affects it (`--affected`) <!-- scaffold:line landing --> |
| `ci-api.yml`         | `ruff` and `pytest` <!-- scaffold:line api -->                                                                                                                        |
| `ci-desktop.yml`     | Electron installers on Ubuntu, macOS and Windows <!-- scaffold:line desktop -->                                                                                       |
| `actions/setup-node` | Shared setup: pnpm, Node and install                                                                                                                                  |
| `actions/setup-uv`   | Shared setup: uv and the API dependencies <!-- scaffold:line api -->                                                                                                  |

Every workflow runs on pull requests and on pushes to `main`, with read-only permissions.

## Add an app

1. Create `apps/<name>/package.json` with `"name": "@repo/<name>"` and scripts `dev`, `build`, `lint`, `test`.
2. Use `catalog:` for shared versions and `workspace:*` for `@repo/*` packages.
3. If it uses Tailwind, copy the CSS header from the `src/index.css` of an existing app. <!-- scaffold:line frontends -->
4. Pick a free port and add its origin to `CORS_ORIGINS` (`apps/api/.env.development` and `.env.production.example`) if it calls the API. <!-- scaffold:line api -->
5. Run `pnpm install`. Add a README and `docs/`.
6. Add its CI: copy the workflow closest to it in `.github/workflows/` (see [CI](#ci)).

## Add a package

1. Create `packages/<name>/package.json` with `"name": "@repo/<name>"` and an `exports` field that points to the source (`./src/index.ts`).
2. In the consumer: `"@repo/<name>": "workspace:*"`, then `pnpm install`.
3. If the package has Tailwind classes, add `@source` to the consumer CSS (see [TAILWIND.md](TAILWIND.md)). <!-- scaffold:line tailwind -->

## Remove an app or package

1. Delete the folder.
2. Remove `workspace:*` references to it in other `package.json` files.
3. Run `pnpm install`.
4. Delete its workflow in `.github/workflows/` (`ci-<app>.yml`). Clean docs and env file mentions.
   See the matrix in [AI_CONTEXT.md](AI_CONTEXT.md). <!-- scaffold:line template -->

## Dependencies and install scripts

pnpm blocks dependency install scripts unless they are allowed. Allowed or denied packages are in `allowBuilds` in `pnpm-workspace.yaml`. When `pnpm install` stops with `ERR_PNPM_IGNORED_BUILDS`, add the package there as `true` or `false`.
pnpm 11 also delays very new package versions (`minimumReleaseAge`). It adds exceptions to `minimumReleaseAgeExclude` when needed.
