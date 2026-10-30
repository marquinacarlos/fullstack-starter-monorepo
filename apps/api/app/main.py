import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.graphql.schema import graphql_router
from app.api.routes import databases, health, items
from app.api.websocket import ws
from app.core.errors import register_error_handlers
from app.core.middlewares import add_middlewares
from app.db.databases import log_database_status
from app.db.errors import register_db_error_handlers

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    await log_database_status()
    yield


def create_app() -> FastAPI:
    app = FastAPI(title="API", lifespan=lifespan)
    add_middlewares(app)
    register_error_handlers(app)
    register_db_error_handlers(app)

    # Each channel is mounted independently. Remove a line to remove the channel.
    app.include_router(health.router)  # REST (no database)
    app.include_router(databases.router)  # REST: status of each database
    app.include_router(items.router)  # REST (SQLite demo)
    app.include_router(graphql_router, prefix="/graphql")  # GraphQL
    app.include_router(ws.router)  # WebSocket
    return app


app = create_app()
