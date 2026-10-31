from sqlalchemy import func, select

from app.db import seed as seed_runner
from app.db.databases import sqlite_db
from app.models.sqlite import Item


def count_items() -> int:
    with sqlite_db.session() as session:
        return session.scalar(select(func.count()).select_from(Item)) or 0


def test_seed_is_idempotent(client):
    assert count_items() == 0

    assert seed_runner.main() == 0
    first_run = count_items()
    assert first_run > 0

    assert seed_runner.main() == 0
    assert count_items() == first_run


def test_seed_keeps_rows_that_already_exist(client):
    with sqlite_db.session() as session:
        session.add(Item(name="First item", description="mine"))
        session.commit()

    seed_runner.main()

    with sqlite_db.session() as session:
        mine = session.scalars(select(Item).where(Item.name == "First item")).all()
    assert [item.description for item in mine] == ["mine"]


def test_seed_refuses_to_run_in_production(client, monkeypatch):
    monkeypatch.setattr(seed_runner, "APP_ENV", "production")

    assert seed_runner.main() == 1
    assert count_items() == 0

    assert seed_runner.main(force=True) == 0
    assert count_items() > 0


def test_seed_reports_missing_tables():
    # No `client` fixture: the tables were never created, as before `pnpm db:migrate`.
    assert seed_runner.main() == 1
