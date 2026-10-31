from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.databases import (
    postgres_db,  # scaffold:line postgres
    sqlite_db,  # scaffold:line sqlite
)

# One dependency per database. Use the one that matches where your model lives.
SqliteSession = Annotated[Session, Depends(sqlite_db.get_session)]  # scaffold:line sqlite
PostgresSession = Annotated[Session, Depends(postgres_db.get_session)]  # scaffold:line postgres
