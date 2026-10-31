def test_health_returns_ok_without_db(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


# scaffold:begin items
def test_health_does_not_need_a_database(client, sqlite_down):
    assert client.get("/health").json() == {"status": "ok"}


# scaffold:end items
def test_health_sets_request_id_header(client):
    response = client.get("/health", headers={"X-Request-ID": "abc-123"})
    assert response.headers["X-Request-ID"] == "abc-123"


def test_health_generates_request_id_when_missing(client):
    response = client.get("/health")
    assert response.headers["X-Request-ID"]
