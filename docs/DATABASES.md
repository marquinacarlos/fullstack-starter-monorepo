# Databases

Every database is **optional** and **independent**. The monorepo works with any of them on, or none.
SQLite is on by default so the demo shows real data without Docker. <!-- scaffold:line sqlite -->

## The databases that come included

| Database   | Setting        | Default in dev                        | What it is for                                                                |
| ---------- | -------------- | ------------------------------------- | ----------------------------------------------------------------------------- |
| SQLite     | `SQLITE_URL`   | `sqlite:///./dev.db` (a file, **on**) | The demo `items` table. No Docker needed <!-- scaffold:line sqlite -->        |
| PostgreSQL | `POSTGRES_URL` | `postgresql+psycopg://app:app@...`    | Ready to connect. Needs `pnpm db:up` (Docker) <!-- scaffold:line postgres --> |

Settings live in `apps/api/.env.development` (see [SETUP.md](SETUP.md#environment-variables)).

## The three states

| State           | When                                          | What the API does                                    |
| --------------- | --------------------------------------------- | ---------------------------------------------------- |
| **connected**   | The URL is set and the database answers       | Works normally                                       |
| **disabled**    | The URL is empty or missing                   | Never connects, no warnings. Shown as "disabled"     |
| **unavailable** | The URL is set but the server does not answer | Starts anyway, logs one short warning, answers `503` |

You can see the state of each database at `GET /health/databases`, and in the **Databases** panel of the frontends. <!-- scaffold:line db-status -->

No database blocks the API from starting. `/health` never uses a database.
GraphQL `health` never uses a database either. <!-- scaffold:line graphql -->
The WebSocket never uses a database either. <!-- scaffold:line websocket -->

## Turn a database off

Empty its variable. To keep the committed file untouched, do it in `apps/api/.env.local` (git-ignored). For example:

- `SQLITE_URL=` <!-- scaffold:line sqlite -->
- `POSTGRES_URL=` <!-- scaffold:line postgres -->

To remove it for good, delete its code: see the decision matrix in [AI_CONTEXT.md](AI_CONTEXT.md#decision-matrix-if-you-do-not-use-x-remove-y), or use `pnpm scaffold` on a fresh copy of the template. <!-- scaffold:line template -->

<!-- scaffold:begin postgres -->

## Use PostgreSQL

```bash
pnpm db:up          # starts Postgres in Docker and waits until it is healthy
pnpm db:migrate        # upgrades every database that is enabled and reachable
```

The API notices the change by itself: the panel goes from "not available" to "connected" without a restart. <!-- scaffold:line db-status -->
Stop it with `pnpm db:down`.

PostgreSQL ships connected but **empty**: there is no demo model on it. Add your own (below).

<!-- scaffold:end postgres -->

## Seeds (demo data)

```bash
pnpm db:migrate        # the tables must exist first
pnpm db:seed           # adds demo data to every database that is enabled, reachable and has a seed
```

Each database can have **its own seed**: a file named like the database, `apps/api/app/seeds/<name>.py`, with one function:

```python
# apps/api/app/seeds/<name>.py
def seed(session: Session) -> int:
    """Add what is missing and return how many rows were added."""
```

The runner (`app/db/seed.py`) finds the file by the database name, so it works for any database you add. A database without a seed file is skipped with a message.
Today only SQLite has one (the demo items). <!-- scaffold:line items -->
PostgreSQL has no models yet, so there is nothing to seed. <!-- scaffold:line postgres -->

Rules:

- **Idempotent.** Running `pnpm db:seed` twice must not duplicate rows. Match rows by a natural key, such as a `name`.
- **Manual.** `pnpm bootstrap` and `pnpm dev` never seed. Run `pnpm db:seed` when you want data.
- **Not for production.** With `APP_ENV=production` it refuses to run. `pnpm db:seed --force` overrides that.
- **Needs the tables.** If they are missing it says so and exits with code 1: run `pnpm db:migrate`.

Package scripts in `apps/api`. `pnpm db:migrate` and `pnpm db:seed` also work from the root; for the others use `pnpm --filter @repo/api <script>`:

| Script              | What it does                                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `db:migrate`        | Upgrade head on every enabled and reachable database                                                             |
| `db:migrate:create` | Autogenerate a migration for SQLite: `... db:migrate:create "message"` <!-- scaffold:line sqlite -->             |
| `db:migrate:create` | Autogenerate a migration for PostgreSQL: `... db:migrate:create "message"` <!-- scaffold:line !only-postgres --> |
| `db:rollback`       | Downgrade the SQLite database by one migration <!-- scaffold:line sqlite -->                                     |
| `db:rollback`       | Downgrade the PostgreSQL database by one migration <!-- scaffold:line !only-postgres -->                         |
| `db:seed`           | Seeding: `python -m app.seeds.run_seeds`                                                                         |
| `db:setup`          | `db:migrate`, then `db:seed`. The migration (DDL) always runs before the seed data (DML)                         |

For PostgreSQL migrations use Alembic directly with its section: `uv run alembic -n postgres revision --autogenerate -m "message"`. <!-- scaffold:line postgres,only-postgres -->

## Add a model to a database

Each database has its own models package and its own migrations. A model belongs to **one** database.

1. Create the model with that database's `Base`:

   ```python
   # apps/api/app/models/<name>/note.py
   from app.db.databases import <name>_db

   class Note(<name>_db.Base):
       __tablename__ = "notes"
       ...
   ```

2. Import it in `apps/api/app/models/<name>/__init__.py` (so Alembic can see it).
3. Create the migration for that database, then apply it:

   ```bash
   cd apps/api
   uv run alembic -n <name> revision --autogenerate -m "create notes"
   pnpm db:migrate
   ```

4. In a route, use the matching dependency from `app/api/deps.py` (for example `<Name>Session`).
   In GraphQL, use `with <name>_db.session() as db:`. <!-- scaffold:line graphql -->

To **move** the demo `items` table to PostgreSQL: change `Item` to inherit from `postgres_db.Base`, move it to `app/models/postgres/`, move its migration to `alembic/postgres/versions/`, and use `PostgresSession`. <!-- scaffold:line items,postgres -->

## Add another database

1. Add `analytics_url: str | None = None` to `Settings` (`app/core/config.py`) and to its `empty_means_disabled` validator.
2. Add an instance in `app/db/databases.py` and put it in the `databases` list:

   ```python
   analytics_db = Database(
       name="analytics", label="Analytics", env_var="ANALYTICS_URL",
       url=settings.analytics_url, models="app.models.analytics",
   )
   ```

3. Create `app/models/analytics/__init__.py`. If it needs demo data, add `app/seeds/analytics.py` (see [Seeds](#seeds-demo-data)).
4. Copy an existing `alembic/<name>/` folder to `alembic/analytics/`, change its `env.py` to use `analytics_db`, and add an `[analytics]` section to `alembic.ini`.
5. Add `ANALYTICS_URL` to the env files and to `globalPassThroughEnv` in `turbo.json`.

The startup summary and `pnpm db:migrate` pick it up automatically.
The status endpoint and the panel pick it up too. <!-- scaffold:line db-status -->

## Things to know

- **No transactions across databases.** A request that writes to two databases can end up saved in one and not in the other.
- **No joins or foreign keys across databases.** A model lives in one database.
- **Tests run on in-memory SQLite.** They do not cover PostgreSQL-only features. If your app depends on them, add tests against a real PostgreSQL. <!-- scaffold:line sqlite,postgres -->
- **Dev and production can differ.** SQLite returns `created_at` without a time zone, PostgreSQL with one. The demo model uses only portable types. <!-- scaffold:line sqlite,postgres -->
- **A forgotten variable is a disabled database.** In production, check `GET /health/databases` (or the startup log line `Databases: ...`) after a deploy. <!-- scaffold:line db-status -->
