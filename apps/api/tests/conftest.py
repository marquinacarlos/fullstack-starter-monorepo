from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError  # scaffold:line items

from app.db.databases import sqlite_db  # scaffold:line items
from app.main import app
from app.models.sqlite import Item  # noqa: F401  (registers the table on sqlite_db.Base)  # scaffold:line items


@pytest.fixture
def client() -> Iterator[TestClient]:
    # scaffold:begin items
    # The real SQLite Database, in memory (see tests/__init__.py): no Docker, no files.
    sqlite_db.Base.metadata.create_all(sqlite_db.engine)
    # scaffold:end items
    with TestClient(app) as test_client:
        yield test_client
    # scaffold:begin items
    sqlite_db.Base.metadata.drop_all(sqlite_db.engine)
    # scaffold:end items


# scaffold:begin items
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


# scaffold:end items
