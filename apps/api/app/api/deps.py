from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.session import get_db

# Shared dependencies. Add auth dependencies here when the project needs them.
DbSession = Annotated[Session, Depends(get_db)]
