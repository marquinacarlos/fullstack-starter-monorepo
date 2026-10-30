"""Registry of databases. Each one is optional and independent of the others.

To add another database: add its URL to Settings (app/core/config.py), create an instance
below, create a models package, and add an Alembic section. See docs/DATABASES.md.
"""

import asyncio
import importlib
import logging
from collections.abc import Iterator
from contextlib import contextmanager
from typing import Literal

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine, make_url
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import settings
from app.db.errors import DatabaseDisabled, DatabaseUnavailable

logger = logging.getLogger("app.db")

Status = Literal["connected", "disabled", "unavailable"]


def _create_engine(url: str) -> Engine:
    parsed = make_url(url)
    backend = parsed.get_backend_name()
    if backend == "sqlite":
        options: dict = {"connect_args": {"check_same_thread": False}}
        if parsed.database in (None, "", ":memory:"):
            # An in-memory database lives in one connection: share it across threads.
            options["poolclass"] = StaticPool
        return create_engine(url, **options)
    if backend == "postgresql":
        # Short timeout: an unreachable host must not freeze startup or the status endpoint.
        return create_engine(url, pool_pre_ping=True, connect_args={"connect_timeout": 3})
    return create_engine(url, pool_pre_ping=True)


class Database:
    def __init__(
        self, name: str, label: str, env_var: str, url: str | None, models: str, hint: str = ""
    ) -> None:
        self.name = name
        self.label = label
        self.env_var = env_var
        self.models = models
        self.hint = hint

        class Base(DeclarativeBase):
            pass

        # Every database has its own Base, so its tables and migrations never mix with others.
        self.Base = Base
        self.engine: Engine | None = _create_engine(url) if url else None
        self.SessionLocal: sessionmaker[Session] | None = (
            sessionmaker(bind=self.engine, autoflush=False, expire_on_commit=False)
            if self.engine
            else None
        )

    @property
    def enabled(self) -> bool:
        return self.engine is not None

    @property
    def url(self) -> str | None:
        return self.engine.url.render_as_string(hide_password=False) if self.engine else None

    def load_models(self) -> None:
        importlib.import_module(self.models)

    def status(self) -> Status:
        if self.engine is None:
            return "disabled"
        try:
            with self.engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            return "connected"
        except OperationalError:
            return "unavailable"

    @contextmanager
    def session(self) -> Iterator[Session]:
        if self.SessionLocal is None:
            raise DatabaseDisabled(self.name, self.env_var)
        try:
            with self.SessionLocal() as session:
                yield session
        except OperationalError as exc:
            raise DatabaseUnavailable(self.name, self.hint) from exc

    def get_session(self) -> Iterator[Session]:
        """FastAPI dependency. A disabled or stopped database answers 503, never a traceback."""
        with self.session() as session:
            yield session


sqlite_db = Database(
    name="sqlite",
    label="SQLite",
    env_var="SQLITE_URL",
    url=settings.sqlite_url,
    models="app.models.sqlite",
)

postgres_db = Database(
    name="postgres",
    label="PostgreSQL",
    env_var="POSTGRES_URL",
    url=settings.postgres_url,
    models="app.models.postgres",
    hint="Start it with `pnpm db:up`.",
)

databases: list[Database] = [sqlite_db, postgres_db]


async def log_database_status() -> None:
    """Startup summary. Never fails: no database is required to start the API."""
    statuses = await asyncio.to_thread(lambda: {db.name: db.status() for db in databases})
    logger.info("Databases: %s", ", ".join(f"{name}={status}" for name, status in statuses.items()))
    for db in databases:
        if statuses[db.name] == "unavailable":
            logger.warning("Database '%s' is unavailable (optional). %s", db.name, db.hint)
