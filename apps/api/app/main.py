import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.graphql.schema import graphql_router  # scaffold:line graphql
from app.api.routes import (
    databases,  # scaffold:line db-status
    health,
    items,  # scaffold:line items-rest
)
from app.api.websocket import ws  # scaffold:line websocket
from app.core.errors import register_error_handlers
from app.core.middlewares import add_middlewares
from app.db.databases import log_database_status  # scaffold:line db-layer
from app.db.errors import register_db_error_handlers  # scaffold:line db-layer

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    await log_database_status()  # scaffold:line db-layer
    yield


def create_app() -> FastAPI:
    app = FastAPI(title="API", lifespan=lifespan)
    add_middlewares(app)
    register_error_handlers(app)
    register_db_error_handlers(app)  # scaffold:line db-layer

    # Each channel is mounted independently. Remove a line to remove the channel.
    app.include_router(health.router)  # REST (no database)
    app.include_router(databases.router)  # REST: status of each database  # scaffold:line db-status
    app.include_router(items.router)  # REST (SQLite demo)  # scaffold:line items-rest
    app.include_router(graphql_router, prefix="/graphql")  # GraphQL  # scaffold:line graphql
    app.include_router(ws.router)  # WebSocket  # scaffold:line websocket
    return app


app = create_app()
