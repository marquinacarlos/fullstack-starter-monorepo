# scaffold:begin items
from app.db.databases import sqlite_db
from app.models.sqlite import Item

# scaffold:end items


def run(client, query: str) -> dict:
    response = client.post("/graphql", json={"query": query})
    assert response.status_code == 200
    return response.json()


def test_graphql_health_query(client):
    body = run(client, "{ health }")
    assert body["data"] == {"health": "ok"}


# scaffold:begin items
def test_graphql_items_reads_stored_rows(client):
    with sqlite_db.session() as db:
        db.add(Item(name="Stored"))
        db.commit()
    body = run(client, "{ items { id name } }")
    assert body["data"]["items"] == [{"id": 1, "name": "Stored"}]


def test_graphql_items_explain_why_when_sqlite_is_disabled(client, sqlite_disabled):
    health = run(client, "{ health }")
    assert health["data"] == {"health": "ok"}
    items = run(client, "{ items { id } }")
    assert items["data"] is None
    assert "disabled" in items["errors"][0]["message"]
    assert "SQLITE_URL" in items["errors"][0]["message"]


def test_graphql_items_when_sqlite_is_down(client, sqlite_down):
    health = run(client, "{ health }")
    assert health["data"] == {"health": "ok"}
    items = run(client, "{ items { id } }")
    assert "unavailable" in items["errors"][0]["message"]
    assert "127.0.0.1" not in items["errors"][0]["message"]  # no connection details leak


# scaffold:end items
