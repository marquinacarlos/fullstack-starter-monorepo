def run(client, query: str) -> dict:
    response = client.post("/graphql", json={"query": query})
    assert response.status_code == 200
    return response.json()


def test_graphql_health_query(client):
    body = run(client, "{ health }")
    assert body["data"] == {"health": "ok"}


def test_graphql_items_reads_rows_created_through_rest(client):
    client.post("/api/items", json={"name": "From REST"})
    body = run(client, "{ items { id name } }")
    assert body["data"]["items"] == [{"id": 1, "name": "From REST"}]
