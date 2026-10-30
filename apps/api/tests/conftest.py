from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from app.db.databases import sqlite_db
from app.main import app
from app.models.sqlite import Item  # noqa: F401  (registers the table on sqlite_db.Base)


@pytest.fixture
def client() -> Iterator[TestClient]:
    # The real SQLite Database, in memory (see tests/__init__.py): no Docker, no files.
    sqlite_db.Base.metadata.create_all(sqlite_db.engine)
    with TestClient(app) as test_client:
        yield test_client
    sqlite_db.Base.metadata.drop_all(sqlite_db.engine)
