import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import OperationalError

from app.core.errors import PublicError

logger = logging.getLogger("app.errors")


class DatabaseDisabled(PublicError):
    status_code = 503

    def __init__(self, name: str, env_var: str) -> None:
        super().__init__(f"Database '{name}' is disabled. Set {env_var} to enable it.")


class DatabaseUnavailable(PublicError):
    status_code = 503

    def __init__(self, name: str, hint: str = "") -> None:
        super().__init__(f"Database '{name}' is unavailable. {hint}".strip())


def register_db_error_handlers(app: FastAPI) -> None:
    # Safety net for a database error that Database.session() did not translate.
    @app.exception_handler(OperationalError)
    async def database_error(request: Request, exc: OperationalError) -> JSONResponse:
        logger.warning("%s %s -> 503 database error", request.method, request.url.path)
        return JSONResponse(
            status_code=503,
            content={"detail": "A database is unavailable."},
        )
