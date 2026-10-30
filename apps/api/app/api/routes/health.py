from fastapi import APIRouter

from app.schemas.health import HealthResponse

router = APIRouter(tags=["rest"])


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    # Deliberately no DB access: this is a liveness probe.
    return HealthResponse(status="ok")
