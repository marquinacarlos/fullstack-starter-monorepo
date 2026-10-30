# Start a new project from this template

Goal: clone, rename a few values, remove what you do not need, and start building.

## 1. Create the repo

- On GitHub: **Use this template** (enable it once in Settings → Template repository), or
- Locally: clone, then `rm -rf .git && git init` to start with a clean history.

## 2. Run it

```bash
pnpm bootstrap
pnpm dev
```

`pnpm bootstrap` installs JS and Python dependencies and runs the migrations (it creates the SQLite file). It needs `uv`; **Docker is not needed**. It is safe to run again. PostgreSQL is optional: `pnpm db:up`. There is nothing to copy: development values already come in each app's `.env.development`.

Note: the script is called `bootstrap` because `pnpm setup` is a built-in pnpm command.

## 3. Rename the example values

Search results of the template placeholders. Change only what applies to your project.

| File                                                 | Value                                                                | Change to                                                                          |
| ---------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `package.json`                                       | `"name": "fullstack-starter-monorepo"`                               | Your project name                                                                  |
| `README.md`                                          | Title and description                                                | Your project                                                                       |
| `apps/web/index.html`                                | `<title>Fullstack Starter</title>`                                   | Your app name                                                                      |
| `apps/desktop/index.html`                            | `<title>Fullstack Starter Desktop</title>`                           | Your app name                                                                      |
| `apps/web/src/i18n/locales/{en,es}/common.json`      | `appName`                                                            | Your app name                                                                      |
| `apps/desktop/src/i18n/locales/{en,es}/common.json`  | `appName`                                                            | Your app name                                                                      |
| `apps/landing/messages/{en,es}/common.json`          | `appName`                                                            | Your app name                                                                      |
| `apps/desktop/electron-builder.yml`                  | `appId`, `productName`, `copyright`, `publish.owner`, `publish.repo` | Your values. `appId` cannot change after your first release                        |
| `apps/desktop/package.json`                          | `description`, `author`                                              | Your values                                                                        |
| `apps/landing/src/app/[locale]/download/page.tsx`    | `RELEASES_URL` (`OWNER/REPO`)                                        | Your GitHub releases URL                                                           |
| `docker-compose.yml` and `apps/api/.env.development` | `POSTGRES_*` defaults and `POSTGRES_URL` (`app`)                     | Your database name and user (only if you keep PostgreSQL). Keep both files in sync |

**Production values** (when you deploy): in `apps/api`, `apps/web`, `apps/desktop` and `apps/landing`, copy `.env.production.example` to `.env.production` (git-ignored) with your real URLs, or set the variables in your hosting or CI. Never commit them. See [SETUP.md](SETUP.md#environment-variables).

Replace the placeholder icon `apps/desktop/build/icon.png` before releasing the desktop app.

The `@repo/*` package names are internal. You can keep them.

## 4. Remove what you do not need

Decide your databases first: SQLite (demo), PostgreSQL, both, or none. Each is optional. See [DATABASES.md](DATABASES.md).

Use the decision matrix in [AI_CONTEXT.md](AI_CONTEXT.md#decision-matrix-if-you-do-not-use-x-remove-y). Easiest way: tell your AI agent which apps and channels the project will not use and let it follow the matrix. Then run `pnpm check`.

## 5. Update dependencies

The template ages. Do this once at the start:

```bash
pnpm outdated -r                  # what is old
cd apps/api && uv lock --upgrade && uv sync
```

Versions shared by several apps are in the `catalog:` block of `pnpm-workspace.yaml`. Change them there. Keep TypeScript on 6.0 until `typescript-eslint` supports 7.

## 6. Check and commit

```bash
pnpm check
```

When it is green, make your first commit.

## What not to change at the start

Folder structure, ports (CORS depends on them), the independent panels, and the i18n file layout. They are the decisions this template already made for you.

## Before publishing the desktop app

See [ELECTRON.md](ELECTRON.md): signing, `publish` settings and the GitHub release flow.
