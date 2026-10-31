# Scaffold: prune the template into your project

`pnpm scaffold` removes what your project does not need: apps, API channels, databases and a few extras. It is a **subtractive** generator: the template stays a real project that builds and passes CI, and the CLI only deletes and edits.

## Use it

Run it once, on a fresh copy of the template, with a clean git tree:

```bash
pnpm scaffold --dry-run               # what would change (touches nothing)
pnpm scaffold                         # asks what to keep
pnpm scaffold --preset api-web-postgres
pnpm scaffold --without desktop,landing,sqlite
```

Then review the diff, run `pnpm check` and commit. The CLI deletes itself (`scripts/scaffold`, this file, its CI) and refreshes `pnpm-lock.yaml` and `uv.lock`.

| Flag            | What it does                                  |
| --------------- | --------------------------------------------- |
| `--preset <n>`  | Ready-made answers (`--list` shows them)      |
| `--without a,b` | Remove these options                          |
| `--dry-run`     | Print the plan and stop                       |
| `--yes`         | Do not ask for confirmation                   |
| `--no-install`  | Skip `pnpm install`, `uv lock` and formatting |
| `--force`       | Skip the clean git tree check                 |
| `--check`       | Only validate the markers of the template     |

## Options

| Option         | What goes away                                                              |
| -------------- | --------------------------------------------------------------------------- |
| `api`          | The whole backend, its CI, `ruff.toml`, and every channel and database      |
| `web`          | `apps/web`, its CI and its CORS origin                                      |
| `desktop`      | `apps/desktop`, Electron docs, its CI, the `/download` page of the Next app |
| `landing`      | `apps/landing`, its CI and its CORS origin                                  |
| `rest`         | The REST panels and client (`/health` stays)                                |
| `graphql`      | The GraphQL folder, test, panels, client and the Strawberry dependency      |
| `websocket`    | The WebSocket folder, panels and client                                     |
| `sqlite`       | SQLite models, migrations and seed (the demo items go with it)              |
| `postgres`     | PostgreSQL models, migrations, `docker-compose.yml`, `db:up` and `db:down`  |
| `items`        | The demo items: model, migration, seed, routes and panels                   |
| `landing-demo` | The live demo section of the Next app                                       |
| `dark-mode`    | The theme toggle and the `zustand` dependency                               |

Some things follow from your answers. No API removes its channels and databases. No databases removes the whole database layer. No frontend removes `packages/ui`, `packages/tailwind-config` and the i18n and Tailwind docs. At least one app must stay.

## What it does not do

- **Rename the project** (name, `appId`, titles): see `docs/NEW_PROJECT.md`.
- **Remove i18n**: it means rewriting every `t()` call. Keep it, or do it by hand.
- **Add anything.** PWA, other frameworks and other databases are out of scope.
- A project with only PostgreSQL has tests with no database. When you add tests with data, add a PostgreSQL service to `ci-api.yml`.

## How it works

1. `features.mjs` is the single source of truth: each option lists its `delete` paths, its `json` and `text` edits and its `cors` origins. Derived options (`db-layer`, `channels`, `lib`, ...) follow from your answers.
2. Shared files carry **markers**. A block or line of a removed option disappears; one of a kept option only loses its marker. Markers vanish from every generated project.
3. `engine.mjs` plans every change in memory, then writes it: edits first, deletions last. It fails loudly on an unbalanced or unknown marker, or on an edit that does not match.
4. `pnpm install`, `uv lock`, `ruff format` and Prettier run on what changed.
5. `scan.mjs` looks for words of what was removed (`electron`, `graphql`, `sqlite`...) in every file. A match fails the run.

### Marker syntax

Use the comment style of the file. A name is a feature of `features.mjs`. Several names separated by commas mean "when any of them is removed". `!name` flips the rule (kept only when the option is removed).

```
# scaffold:begin sqlite        <- block, whole line (also // or <!-- --> or {/* */})
...
# scaffold:end sqlite
code()  # scaffold:line sqlite  <- just this line (in Markdown: <!-- scaffold:line sqlite -->)
```

Rules: put markers only where deleting the line leaves valid code. Do not mark a file that must compile in two forms at once (both forms would exist in the template). In a Markdown table, put the marker inside the last cell.

## Verify

```bash
pnpm scaffold:verify                       # every preset, on temporary copies
pnpm scaffold:verify --preset web-only     # some presets
pnpm scaffold:verify --quick               # skip `pnpm check`
pnpm scaffold:verify --docker              # also apply a real PostgreSQL migration
```

For each preset it copies the template, runs the real `pnpm scaffold`, then `pnpm check` and a smoke test of the API (health, GraphQL, items, WebSocket, database status). It never touches your repository. `ci-scaffold.yml` runs a subset in CI.

## Add an option to the template

1. Add it to `FEATURES` in `features.mjs` (`user: true` if people choose it), with its `delete` paths and edits.
2. Mark the shared files it touches, and write the docs so they stay true without it.
3. Add the words that must not survive to `RESIDUE`.
4. Add a preset if it creates a combination worth protecting, then run `pnpm scaffold:verify`.
