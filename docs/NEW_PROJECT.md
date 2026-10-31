<!-- scaffold:begin template -->

# Start a new project from this template

Goal: clone, rename a few values, remove what you do not need, and start building.
<!-- scaffold:end template -->
<!-- scaffold:begin !template -->

# Customize your project

Goal: rename the template placeholders, check the setup and start building.
<!-- scaffold:end !template -->

## Install the tools (once per machine)

The repo manages its own dependencies, but not these tools. Install them first:

- Node.js >= 22.13 (pnpm 11 needs it; CI uses 24) and pnpm (the repo pins the `packageManager` version)
- Python >= 3.12 and [uv](https://docs.astral.sh/uv/) <!-- scaffold:line api -->
- Docker (optional: only if you want PostgreSQL) <!-- scaffold:line postgres -->

Details and versions: [SETUP.md](SETUP.md#requirements).

<!-- scaffold:begin template -->

## Create the repo

- On GitHub: **Use this template** (enable it once in Settings → Template repository), or
- Locally: clone, then `rm -rf .git && git init` to start with a clean history.

<!-- scaffold:end template -->

## Run it

```bash
pnpm bootstrap
pnpm dev
```

`pnpm bootstrap` installs the dependencies and sets everything up. It is safe to run again. There is nothing to copy: development values already come in each app's `.env.development`.

- It needs `uv` for the Python dependencies. <!-- scaffold:line api -->
- It runs the migrations. Docker is **not** needed. <!-- scaffold:line db-layer -->
- It does not add data: run `pnpm db:seed` if you want the demo items (see [DATABASES.md](DATABASES.md#seeds-demo-data)). <!-- scaffold:line items -->
- PostgreSQL is optional: `pnpm db:up`. <!-- scaffold:line postgres -->

Note: the script is called `bootstrap` because `pnpm setup` is a built-in pnpm command.

## Rename the example values

Search results of the template placeholders. Change only what applies to your project.

| File                                                 | Value                                                                                        | Change to                                                                                                          |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `package.json`                                       | `"name": "fullstack-starter-monorepo"`                                                       | Your project name                                                                                                  |
| `README.md`                                          | Title and description                                                                        | Your project                                                                                                       |
| `apps/web/index.html`                                | `<title>Fullstack Starter</title>`                                                           | Your app name <!-- scaffold:line web -->                                                                           |
| `apps/desktop/index.html`                            | `<title>Fullstack Starter Desktop</title>`                                                   | Your app name <!-- scaffold:line desktop -->                                                                       |
| `apps/web/src/i18n/locales/{en,es}/common.json`      | `appName`                                                                                    | Your app name <!-- scaffold:line web -->                                                                           |
| `apps/desktop/src/i18n/locales/{en,es}/common.json`  | `appName`                                                                                    | Your app name <!-- scaffold:line desktop -->                                                                       |
| `apps/landing/messages/{en,es}/common.json`          | `appName`                                                                                    | Your app name <!-- scaffold:line landing -->                                                                       |
| `apps/desktop/electron-builder.yml`                  | `appId`, `productName`, `copyright`, `linux.executableName`, `publish.owner`, `publish.repo` | Your values. `appId` cannot change after your first release <!-- scaffold:line desktop -->                         |
| `apps/desktop/package.json`                          | `description`, `author`                                                                      | Your values <!-- scaffold:line desktop -->                                                                         |
| `apps/landing/src/app/[locale]/download/page.tsx`    | `RELEASES_URL` (`OWNER/REPO`)                                                                | Your GitHub releases URL <!-- scaffold:line desktop,landing -->                                                    |
| `docker-compose.yml` and `apps/api/.env.development` | `POSTGRES_*` defaults and `POSTGRES_URL` (`app`)                                             | Your database name and user (only if you keep PostgreSQL). Keep both files in sync <!-- scaffold:line postgres --> |

**Production values** (when you deploy): in each app that has one, copy `.env.production.example` to `.env.production` (git-ignored) with your real URLs, or set the variables in your hosting or CI. Never commit them. See [SETUP.md](SETUP.md#environment-variables).

Replace the placeholder icon `apps/desktop/build/icon.png` before releasing the desktop app. <!-- scaffold:line desktop -->

The `@repo/*` package names are internal. You can keep them.

<!-- scaffold:begin template -->

## Remove what you do not need

Decide first which apps, channels and databases your project keeps. Run the pruning CLI: it asks, deletes the rest and refuses to finish if anything still mentions what you removed.

```bash
pnpm scaffold --dry-run   # shows what would change and touches nothing
pnpm scaffold             # asks what to keep (or use --preset <name>)
```

Then run `pnpm check`. All the options, the presets and the limits are in [SCAFFOLD.md](SCAFFOLD.md).
The manual way (the decision matrix in [AI_CONTEXT.md](AI_CONTEXT.md#decision-matrix-if-you-do-not-use-x-remove-y)) still works, but it does not check for leftovers.
<!-- scaffold:end template -->

## Update dependencies

The template ages. Do this once at the start:

```bash
pnpm outdated -r                  # what is old
cd apps/api && uv lock --upgrade && uv sync <!-- scaffold:line api -->
```

Versions shared by several apps are in the `catalog:` block of `pnpm-workspace.yaml`. Change them there. Keep TypeScript on 6.0 until `typescript-eslint` supports 7.

## Check and commit

```bash
pnpm check
```

When it is green, make your first commit.

## What not to change at the start

Folder structure, ports (CORS depends on them), the independent panels, and the i18n file layout. They are the decisions this template already made for you.

<!-- scaffold:begin desktop -->

## Before publishing the desktop app

See [ELECTRON.md](ELECTRON.md): signing, `publish` settings and the GitHub release flow.
<!-- scaffold:end desktop -->
