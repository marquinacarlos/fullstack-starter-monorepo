from app.db.alembic_env import run
from app.db.databases import postgres_db

run(postgres_db)
