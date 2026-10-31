"""Shared body of every Alembic env.py (one per database)."""

from logging.config import fileConfig

from alembic import context

from app.db.databases import Database
from app.db.errors import DatabaseDisabled


def run(db: Database) -> None:
    if db.engine is None:
        raise DatabaseDisabled(db.name, db.env_var)

    config = context.config
    if config.config_file_name is not None:
        fileConfig(config.config_file_name)

    db.load_models()
    target_metadata = db.Base.metadata

    if context.is_offline_mode():
        context.configure(
            url=db.url,
            target_metadata=target_metadata,
            literal_binds=True,
            dialect_opts={"paramstyle": "named"},
        )
        with context.begin_transaction():
            context.run_migrations()
        return

    with db.engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            # scaffold:begin sqlite
            # SQLite cannot ALTER most things in place; batch mode recreates the table.
            render_as_batch=db.engine.dialect.name == "sqlite",
            # scaffold:end sqlite
        )
        with context.begin_transaction():
            context.run_migrations()
