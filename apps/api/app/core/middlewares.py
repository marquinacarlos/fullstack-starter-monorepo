import logging
import time
import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

from app.core.config import settings

logger = logging.getLogger("app.http")

REQUEST_ID_HEADER = "X-Request-ID"


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Reuses the incoming X-Request-ID or creates one, and echoes it in the response."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        request_id = request.headers.get(REQUEST_ID_HEADER) or uuid.uuid4().hex
        request.state.request_id = request_id
        logger.debug("request received request_id=%s", request_id)
        response = await call_next(request)
        response.headers[REQUEST_ID_HEADER] = request_id
        return response


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        started = time.perf_counter()
        response = await call_next(request)
        elapsed_ms = (time.perf_counter() - started) * 1000
        logger.info(
            "%s %s -> %s (%.1f ms) request_id=%s",
            request.method,
            request.url.path,
            response.status_code,
            elapsed_ms,
            getattr(request.state, "request_id", "-"),
        )
        return response


def add_middlewares(app: FastAPI) -> None:
    # Starlette runs the LAST added middleware first (outermost). Order matters:
    # CORS must answer preflights before anything else, and RequestID must run
    # before Logging so the log line can include the id.
    app.add_middleware(LoggingMiddleware)
    app.add_middleware(RequestIDMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=[REQUEST_ID_HEADER],
    )
