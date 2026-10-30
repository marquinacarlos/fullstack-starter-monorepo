from app.db.alembic_env import run
from app.db.databases import sqlite_db

run(sqlite_db)
