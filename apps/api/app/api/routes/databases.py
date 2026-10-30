from fastapi import APIRouter

from app.db.databases import databases
from app.schemas.database import DatabasesResponse, DatabaseStatus

router = APIRouter(tags=["rest"])


@router.get("/health/databases", response_model=DatabasesResponse)
def databases_status() -> DatabasesResponse:
    # Always 200: a disabled or stopped database is a state to report, not an API failure.
    return DatabasesResponse(
        databases=[
            DatabaseStatus(name=db.name, label=db.label, status=db.status()) for db in databases
        ]
    )
