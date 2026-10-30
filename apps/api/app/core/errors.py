import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

logger = logging.getLogger("app.errors")


class PublicError(Exception):
    """An expected error that is safe to show to clients and not worth a traceback."""

    status_code = 500


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(PublicError)
    async def public_error(request: Request, exc: PublicError) -> JSONResponse:
        # One short line instead of a traceback. Handled here (inside the CORS middleware),
        # the response keeps its CORS headers, so the browser shows the real error and not
        # a misleading "blocked by CORS policy".
        logger.warning("%s %s -> %s %s", request.method, request.url.path, exc.status_code, exc)
        return JSONResponse(status_code=exc.status_code, content={"detail": str(exc)})
