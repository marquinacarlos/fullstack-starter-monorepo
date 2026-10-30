import asyncio
import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.graphql.schema import graphql_router
from app.api.routes import health, items
from app.api.websocket import ws
from app.core.errors import DB_UNAVAILABLE, register_error_handlers
from app.core.middlewares import add_middlewares
from app.db.session import database_is_reachable

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("app")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    # Not fatal: /health and WebSocket work without a DB. This only tells you why items fail.
    if not await asyncio.to_thread(database_is_reachable):
        logger.warning("Cannot reach the database. %s", DB_UNAVAILABLE)
    yield


def create_app() -> FastAPI:
    app = FastAPI(title="API", lifespan=lifespan)
    add_middlewares(app)
    register_error_handlers(app)

    # Each channel is mounted independently. Remove a line to remove the channel.
    app.include_router(health.router)  # REST
    app.include_router(items.router)  # REST (DB)
    app.include_router(graphql_router, prefix="/graphql")  # GraphQL
    app.include_router(ws.router)  # WebSocket
    return app


app = create_app()
