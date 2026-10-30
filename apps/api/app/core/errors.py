import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import OperationalError

logger = logging.getLogger("app.errors")

DB_UNAVAILABLE = (
    "Database unavailable. Start it with `docker compose up -d db` (or run `pnpm bootstrap`)."
)


class DatabaseUnavailable(Exception):
    """Raised by resolvers so GraphQL can answer with a short, safe message."""

    def __init__(self) -> None:
        super().__init__(DB_UNAVAILABLE)


def register_error_handlers(app: FastAPI) -> None:
    # A stopped database must not turn into a 500 with a huge traceback on every request.
    # Handled here (inside the CORS middleware), the 503 also keeps its CORS headers, so the
    # browser shows the real error instead of a misleading "blocked by CORS policy".
    @app.exception_handler(OperationalError)
    async def database_unavailable(request: Request, exc: OperationalError) -> JSONResponse:
        logger.warning("%s %s -> 503 database unavailable", request.method, request.url.path)
        return JSONResponse(status_code=503, content={"detail": DB_UNAVAILABLE})
