"""Upgrade every database that is enabled and reachable. Used by `pnpm db:migrate` and `pnpm dev`.

A disabled or unreachable database is skipped with a message: a database that is not there
must never block the API from starting.

  python -m app.db.migrate               strict: exit code 1 if a migration fails (CI, deploys)
  python -m app.db.migrate --keep-going  report the failure and carry on (used by `pnpm dev`)
"""

import sys
from pathlib import Path

from alembic import command
from alembic.config import Config

from app.db.databases import databases

ALEMBIC_INI = Path(__file__).resolve().parents[2] / "alembic.ini"


def main(keep_going: bool = False) -> int:
    failed = False
    for db in databases:
        if not db.enabled:
            print(f"[{db.name}] skipped: disabled ({db.env_var} is empty)")
            continue
        if db.status() != "connected":
            print(f"[{db.name}] skipped: not available. {db.hint}".strip())
            continue
        print(f"[{db.name}] upgrading to head")
        try:
            command.upgrade(Config(str(ALEMBIC_INI), ini_section=db.name), "head")
        except Exception as exc:  # noqa: BLE001  (any migration error is reported the same way)
            failed = True
            print(f"[{db.name}] migration FAILED: {exc}")
            if not keep_going:
                raise
    return 0 if keep_going or not failed else 1


if __name__ == "__main__":
    sys.exit(main(keep_going="--keep-going" in sys.argv))
