# Monorepo guide

## Layout

`pnpm-workspace.yaml` lists the workspaces: `apps/*` and `packages/*`. It also holds the `catalog:` of shared versions and the `allowBuilds` list.

## Commands

| Command                            | What it does                                           |
| ---------------------------------- | ------------------------------------------------------ |
| `pnpm bootstrap`                   | First run: installs, migrations (no Docker needed)     |
| `pnpm db:up` / `pnpm db:down`      | Start / stop the optional PostgreSQL (Docker)          |
| `pnpm migrate`                     | Upgrades every enabled and reachable database          |
| `pnpm dev`                         | Runs `dev` in every app (api, web, desktop, landing)   |
| `pnpm check`                       | Format check + lint + test + build, API included       |
| `pnpm build`                       | Builds everything (Electron is compiled, not packaged) |
| `pnpm lint` / `pnpm test`          | Lint / test everywhere                                 |
| `pnpm dist:desktop`                | Builds the Electron installers                         |
| `pnpm --filter @repo/web dev`      | Runs one app                                           |
| `pnpm --filter @repo/web... build` | One app and its dependencies                           |

## turbo.json

| Task    | Config                                                        | Why                                        |
| ------- | ------------------------------------------------------------- | ------------------------------------------ |
| `dev`   | `persistent`, no cache                                        | Long-running servers                       |
| `build` | `dependsOn: ["^build"]`, `outputs` for `dist`, `out`, `.next` | Build dependencies first, cache the output |
| `lint`  | `dependsOn: ["^lint"]`                                        |                                            |
| `test`  | `dependsOn: ["^build"]`                                       |                                            |

`globalEnv` lists env vars that change the build (`VITE_API_URL`). The `build` task has `.env*` as inputs, so editing an env file (even an ignored one like `.env.production`) invalidates the cache. `globalPassThroughEnv` lets the API see `APP_ENV`, `SQLITE_URL`, `POSTGRES_URL` and `CORS_ORIGINS` (Turborepo hides undeclared variables).

## Add an app

1. Create `apps/<name>/package.json` with `"name": "@repo/<name>"` and scripts `dev`, `build`, `lint`, `test`.
2. Use `catalog:` for shared versions and `workspace:*` for `@repo/*` packages.
3. If it uses Tailwind, copy the CSS header from `apps/web/src/index.css`.
4. Pick a free port and add its origin to `CORS_ORIGINS` (`apps/api/.env.development` and `.env.production.example`) if it calls the API.
5. Run `pnpm install`. Add a README and `docs/`.
6. Add it to CI if it needs a special job.

## Add a package

1. Create `packages/<name>/package.json` with `"name": "@repo/<name>"` and an `exports` field that points to the source (`./src/index.ts`).
2. In the consumer: `"@repo/<name>": "workspace:*"`, then `pnpm install`.
3. If the package has Tailwind classes, add `@source` to the consumer CSS (see [TAILWIND.md](TAILWIND.md)).

## Remove an app or package

1. Delete the folder.
2. Remove `workspace:*` references to it in other `package.json` files.
3. Run `pnpm install`.
4. Clean docs, CI and env file mentions. See the matrix in [AI_CONTEXT.md](AI_CONTEXT.md).

## Dependencies and install scripts

pnpm blocks dependency install scripts unless they are allowed. Allowed or denied packages are in `allowBuilds` in `pnpm-workspace.yaml`. When `pnpm install` stops with `ERR_PNPM_IGNORED_BUILDS`, add the package there as `true` or `false`.
pnpm 11 also delays very new package versions (`minimumReleaseAge`). It adds exceptions to `minimumReleaseAgeExclude` when needed.
