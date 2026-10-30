from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.databases import postgres_db, sqlite_db

# One dependency per database. Use the one that matches where your model lives.
SqliteSession = Annotated[Session, Depends(sqlite_db.get_session)]
PostgresSession = Annotated[Session, Depends(postgres_db.get_session)]
