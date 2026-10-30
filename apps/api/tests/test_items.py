def test_list_items_starts_empty(client):
    response = client.get("/api/items")
    assert response.status_code == 200
    assert response.json() == []


def test_create_item_then_list_it(client):
    created = client.post("/api/items", json={"name": "First", "description": "hello"})
    assert created.status_code == 201
    body = created.json()
    assert body["id"] == 1
    assert body["name"] == "First"
    assert body["description"] == "hello"
    assert body["created_at"]

    listed = client.get("/api/items").json()
    assert [item["name"] for item in listed] == ["First"]


def test_create_item_rejects_empty_name(client):
    response = client.post("/api/items", json={"name": ""})
    assert response.status_code == 422
