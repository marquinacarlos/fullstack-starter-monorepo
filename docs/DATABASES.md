# Databases

Every database is **optional** and **independent**. The monorepo works with both on, one on, or none. SQLite is on by default so the demo shows real data without Docker.

## The two databases that come included

| Database   | Setting        | Default in dev                        | What it is for                                |
| ---------- | -------------- | ------------------------------------- | --------------------------------------------- |
| SQLite     | `SQLITE_URL`   | `sqlite:///./dev.db` (a file, **on**) | The demo `items` table. No Docker needed      |
| PostgreSQL | `POSTGRES_URL` | `postgresql+psycopg://app:app@...`    | Ready to connect. Needs `pnpm db:up` (Docker) |

Settings live in `apps/api/.env.development` (see [SETUP.md](SETUP.md#environment-variables)).

## The three states

| State           | When                                          | What the API does                                    |
| --------------- | --------------------------------------------- | ---------------------------------------------------- |
| **connected**   | The URL is set and the database answers       | Works normally                                       |
| **disabled**    | The URL is empty or missing                   | Never connects, no warnings. Shown as "disabled"     |
| **unavailable** | The URL is set but the server does not answer | Starts anyway, logs one short warning, answers `503` |

You can see the state of each database at `GET /health/databases`, and in the **Databases** panel of the web and desktop apps.

No database blocks the API from starting. `/health`, GraphQL `health` and the WebSocket never use a database.

## Turn a database off

Empty its variable. To keep the committed file untouched, do it in `apps/api/.env.local` (git-ignored):

```
SQLITE_URL=
```

To remove it for good, delete its code: see the decision matrix in [AI_CONTEXT.md](AI_CONTEXT.md#decision-matrix-if-you-do-not-use-x-remove-y).

## Use PostgreSQL

```bash
pnpm db:up          # starts Postgres in Docker and waits until it is healthy
pnpm migrate        # upgrades every database that is enabled and reachable
```

The API notices the change by itself: the panel goes from "not available" to "connected" without a restart. Stop it with `pnpm db:down`.

PostgreSQL ships connected but **empty**: there is no demo model on it. Add your own (below).

## Seeds (demo data)

```bash
pnpm migrate        # the tables must exist first
pnpm seed           # adds demo data to every database that is enabled, reachable and has a seed
```

Each database can have **its own seed**: a file named like the database, `apps/api/app/seeds/<name>.py`, with one function:

```python
# apps/api/app/seeds/sqlite.py
def seed(session: Session) -> int:
    """Add what is missing and return how many rows were added."""
```

The runner (`app/db/seed.py`) finds the file by the database name, so it works for any database you add. A database without a seed file is skipped with a message. Today only SQLite has one (the demo items); PostgreSQL has no models yet, so there is nothing to seed.

Rules:

- **Idempotent.** Running `pnpm seed` twice must not duplicate rows. The SQLite seed matches by `name`. Do the same in yours.
- **Manual.** `pnpm bootstrap` and `pnpm dev` never seed. Run `pnpm seed` when you want data.
- **Not for production.** With `APP_ENV=production` it refuses to run. `pnpm seed --force` overrides that.
- **Needs the tables.** If they are missing it says so and exits with code 1: run `pnpm migrate`.

Package scripts in `apps/api` (run them from the root with `pnpm --filter @repo/api <script>`):

| Script              | What it does                                                                             |
| ------------------- | ---------------------------------------------------------------------------------------- |
| `db:migrate`        | Upgrade head on every enabled and reachable database (same as `pnpm migrate`)            |
| `db:migrate:create` | Autogenerate a migration for SQLite: `... db:migrate:create "message"`                   |
| `db:rollback`       | Downgrade the SQLite database by one migration                                           |
| `db:seed`           | Seeding (same as `pnpm seed`): `python -m app.seeds.run_seeds`                           |
| `db:setup`          | `db:migrate`, then `db:seed`. The migration (DDL) always runs before the seed data (DML) |

For PostgreSQL migrations use Alembic directly with its section: `uv run alembic -n postgres revision --autogenerate -m "message"`.

## Add a model to a database

Each database has its own models package and its own migrations. A model belongs to **one** database.

1. Create the model with that database's `Base`:

   ```python
   # apps/api/app/models/postgres/note.py
   from app.db.databases import postgres_db

   class Note(postgres_db.Base):
       __tablename__ = "notes"
       ...
   ```

2. Import it in `apps/api/app/models/postgres/__init__.py` (so Alembic can see it).
3. Create the migration for that database, then apply it:

   ```bash
   cd apps/api
   uv run alembic -n postgres revision --autogenerate -m "create notes"
   pnpm migrate
   ```

4. In a route, use the matching dependency from `app/api/deps.py`: `PostgresSession` (or `SqliteSession`). In GraphQL, use `with postgres_db.session() as db:`.

To **move** the demo `items` table to PostgreSQL: change `Item` to inherit from `postgres_db.Base`, move it to `app/models/postgres/`, move its migration to `alembic/postgres/versions/`, and use `PostgresSession`.

## Add another database (for example a second PostgreSQL)

1. Add `analytics_url: str | None = None` to `Settings` (`app/core/config.py`) and to its `empty_means_disabled` validator.
2. Add an instance in `app/db/databases.py` and put it in the `databases` list:

   ```python
   analytics_db = Database(
       name="analytics", label="Analytics", env_var="ANALYTICS_URL",
       url=settings.analytics_url, models="app.models.analytics",
   )
   ```

3. Create `app/models/analytics/__init__.py`. If it needs demo data, add `app/seeds/analytics.py` (see [Seeds](#seeds-demo-data)).
4. Copy `alembic/postgres/` to `alembic/analytics/`, change its `env.py` to use `analytics_db`, and add an `[analytics]` section to `alembic.ini`.
5. Add `ANALYTICS_URL` to the env files and to `globalPassThroughEnv` in `turbo.json`.

The status endpoint, the panel, the startup summary and `pnpm migrate` pick it up automatically.

## Things to know

- **No transactions across databases.** A request that writes to two databases can end up saved in one and not in the other.
- **No joins or foreign keys across databases.** A model lives in one database.
- **Tests run on in-memory SQLite.** They do not cover PostgreSQL-only features. If your app depends on them, add tests against a real Postgres.
- **Dev and production can differ.** SQLite returns `created_at` without a time zone, PostgreSQL with one. The demo model uses only portable types.
- **A forgotten variable is a disabled database.** In production, check `GET /health/databases` (or the startup log line `Databases: ...`) after a deploy.
