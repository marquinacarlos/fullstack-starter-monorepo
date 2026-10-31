"""Load demo data into every database that is enabled and reachable. Used by `pnpm db:seed`.

Each database may have a seed module `app/seeds/<database name>.py` with a function
`seed(session) -> int` that returns how many rows it added. A database without that module is
skipped. Seeds must be idempotent: running them twice must not duplicate rows.

  python -m app.db.seed            refuses to run when APP_ENV=production
  python -m app.db.seed --force    run anyway
"""

import importlib
import sys
from collections.abc import Callable

from sqlalchemy import inspect
from sqlalchemy.orm import Session

from app.core.config import APP_ENV
from app.db.databases import Database, databases


def _load_seed(db: Database) -> Callable[[Session], int] | None:
    module = f"app.seeds.{db.name}"
    try:
        return importlib.import_module(module).seed
    except ModuleNotFoundError as exc:
        if exc.name != module:
            raise  # the seed exists but one of its own imports is broken
        return None


def main(force: bool = False) -> int:
    if APP_ENV == "production" and not force:
        print("seed refused: APP_ENV is production. Use --force if you really mean it.")
        return 1

    failed = False
    for db in databases:
        if not db.enabled:
            print(f"[{db.name}] skipped: disabled ({db.env_var} is empty)")
            continue
        if db.status() != "connected":
            print(f"[{db.name}] skipped: not available. {db.hint}".strip())
            continue
        seed = _load_seed(db)
        if seed is None:
            print(f"[{db.name}] skipped: no seed (create app/seeds/{db.name}.py)")
            continue

        db.load_models()
        missing = set(db.Base.metadata.tables) - set(inspect(db.engine).get_table_names())
        if missing:
            failed = True
            print(f"[{db.name}] FAILED: missing tables {sorted(missing)}. Run `pnpm db:migrate`.")
            continue

        with db.session() as session:
            added = seed(session)
        print(f"[{db.name}] seeded: {added} row(s) added")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(force="--force" in sys.argv))
