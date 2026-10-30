import logging

from fastapi import FastAPI

from app.api.graphql.schema import graphql_router
from app.api.routes import health, items
from app.api.websocket import ws
from app.core.middlewares import add_middlewares

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")


def create_app() -> FastAPI:
    app = FastAPI(title="API")
    add_middlewares(app)

    # Each channel is mounted independently. Remove a line to remove the channel.
    app.include_router(health.router)  # REST
    app.include_router(items.router)  # REST (DB)
    app.include_router(graphql_router, prefix="/graphql")  # GraphQL
    app.include_router(ws.router)  # WebSocket
    return app


app = create_app()
