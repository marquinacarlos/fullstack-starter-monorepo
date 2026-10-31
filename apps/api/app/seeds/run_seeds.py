"""Entry point of `pnpm db:seed`: python -m app.seeds.run_seeds [--force].

The runner lives in app/db/seed.py (next to app/db/migrate.py); this module exposes it beside the
seeds. Seeds are DML only: they never create tables. Run `pnpm db:migrate` first, otherwise the
seeding stops with a message naming the missing tables.
"""

import sys

from app.db.seed import main

if __name__ == "__main__":
    sys.exit(main(force="--force" in sys.argv))
