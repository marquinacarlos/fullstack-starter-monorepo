from sqlalchemy import create_engine  # scaffold:line postgres

from app.db.databases import (
    postgres_db,  # scaffold:line postgres
    sqlite_db,  # scaffold:line sqlite
)


def statuses(client) -> dict[str, str]:
    body = client.get("/health/databases").json()
    return {db["name"]: db["status"] for db in body["databases"]}


def test_default_state(client):
    assert statuses(client) == {
        "sqlite": "connected",  # scaffold:line sqlite
        "postgres": "disabled",  # scaffold:line postgres
    }


# scaffold:begin postgres
def test_postgres_that_is_not_running_is_reported_not_fatal(client, monkeypatch):
    # Port 1 refuses connections immediately: a real "server is down" case.
    dead = create_engine("postgresql+psycopg://x:y@127.0.0.1:1/z")
    monkeypatch.setattr(postgres_db, "engine", dead)
    assert statuses(client) == {
        "sqlite": "connected",  # scaffold:line sqlite
        "postgres": "unavailable",
    }
    assert client.get("/health").json() == {"status": "ok"}


# scaffold:end postgres
# scaffold:begin sqlite
def test_sqlite_that_is_disabled_is_reported(client, monkeypatch):
    monkeypatch.setattr(sqlite_db, "engine", None)
    monkeypatch.setattr(sqlite_db, "SessionLocal", None)
    assert statuses(client) == {
        "sqlite": "disabled",
        "postgres": "disabled",  # scaffold:line postgres
    }
    assert client.get("/health").json() == {"status": "ok"}


# scaffold:end sqlite
