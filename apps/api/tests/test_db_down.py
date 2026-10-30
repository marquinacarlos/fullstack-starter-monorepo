import pytest
from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError

from app.db.session import get_db
from app.main import app


class DeadSession:
    """Looks like a Session, but every database call fails like a stopped Postgres."""

    def _fail(self, *args, **kwargs):
        raise OperationalError("SELECT 1", {}, Exception("connection refused"))

    scalars = add = commit = refresh = _fail


@pytest.fixture
def db_down_client():
    app.dependency_overrides[get_db] = lambda: DeadSession()
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()


def test_rest_items_answer_503_with_a_clear_message(db_down_client):
    response = db_down_client.get("/api/items")
    assert response.status_code == 503
    assert "Database unavailable" in response.json()["detail"]


def test_health_does_not_need_the_database(db_down_client):
    assert db_down_client.get("/health").json() == {"status": "ok"}


def test_graphql_health_works_and_items_report_the_database(db_down_client):
    health = db_down_client.post("/graphql", json={"query": "{ health }"}).json()
    assert health["data"] == {"health": "ok"}

    items = db_down_client.post("/graphql", json={"query": "{ items { id } }"}).json()
    assert items["data"] is None
    assert "Database unavailable" in items["errors"][0]["message"]
    assert "127.0.0.1" not in items["errors"][0]["message"]  # no connection details leak
