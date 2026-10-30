import pytest
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError

from app.db.databases import postgres_db, sqlite_db


class DeadSession:
    """Looks like a Session, but every call fails like a stopped database server."""

    def __enter__(self):
        return self

    def __exit__(self, *exc_info):
        return False

    def _fail(self, *args, **kwargs):
        raise OperationalError("SELECT 1", {}, Exception("connection refused"))

    scalars = add = commit = refresh = _fail


@pytest.fixture
def sqlite_disabled(monkeypatch):
    monkeypatch.setattr(sqlite_db, "engine", None)
    monkeypatch.setattr(sqlite_db, "SessionLocal", None)


@pytest.fixture
def sqlite_down(monkeypatch):
    monkeypatch.setattr(sqlite_db, "SessionLocal", lambda: DeadSession())


def statuses(client) -> dict[str, str]:
    body = client.get("/health/databases").json()
    return {db["name"]: db["status"] for db in body["databases"]}


def test_default_state_sqlite_connected_postgres_disabled(client):
    assert statuses(client) == {"sqlite": "connected", "postgres": "disabled"}


def test_postgres_that_is_not_running_is_reported_not_fatal(client, monkeypatch):
    # Port 1 refuses connections immediately: a real "server is down" case.
    dead = create_engine("postgresql+psycopg://x:y@127.0.0.1:1/z")
    monkeypatch.setattr(postgres_db, "engine", dead)
    assert statuses(client) == {"sqlite": "connected", "postgres": "unavailable"}
    assert client.get("/health").json() == {"status": "ok"}


def test_sqlite_disabled_items_explain_why_and_the_rest_keeps_working(client, sqlite_disabled):
    assert statuses(client) == {"sqlite": "disabled", "postgres": "disabled"}

    response = client.get("/api/items")
    assert response.status_code == 503
    assert "disabled" in response.json()["detail"]
    assert "SQLITE_URL" in response.json()["detail"]

    assert client.get("/health").json() == {"status": "ok"}
    health = client.post("/graphql", json={"query": "{ health }"}).json()
    assert health["data"] == {"health": "ok"}
    items = client.post("/graphql", json={"query": "{ items { id } }"}).json()
    assert items["data"] is None
    assert "disabled" in items["errors"][0]["message"]


def test_sqlite_that_is_down_answers_503_with_a_clear_message(client, sqlite_down):
    response = client.get("/api/items")
    assert response.status_code == 503
    assert "unavailable" in response.json()["detail"]

    items = client.post("/graphql", json={"query": "{ items { id } }"}).json()
    assert "unavailable" in items["errors"][0]["message"]
    assert "127.0.0.1" not in items["errors"][0]["message"]  # no connection details leak


def test_health_and_graphql_health_do_not_need_a_database(client, sqlite_down):
    assert client.get("/health").json() == {"status": "ok"}
    health = client.post("/graphql", json={"query": "{ health }"}).json()
    assert health["data"] == {"health": "ok"}
