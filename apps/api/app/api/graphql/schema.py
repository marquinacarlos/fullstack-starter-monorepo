import logging

import strawberry
from fastapi import Depends
from graphql import GraphQLError
from sqlalchemy.orm import Session
from strawberry.fastapi import GraphQLRouter
from strawberry.types import ExecutionContext

from app.api.graphql.resolvers import Query
from app.core.errors import DatabaseUnavailable
from app.db.session import get_db

logger = logging.getLogger("app.graphql")


class AppSchema(strawberry.Schema):
    def process_errors(
        self, errors: list[GraphQLError], execution_context: ExecutionContext | None = None
    ) -> None:
        # Strawberry logs every resolver error with a full traceback. For a stopped
        # database that is just noise, so log one line instead.
        for error in errors:
            if isinstance(error.original_error, DatabaseUnavailable):
                logger.warning("GraphQL: database unavailable")
            else:
                super().process_errors([error], execution_context)


schema = AppSchema(query=Query)


async def get_context(db: Session = Depends(get_db)) -> dict:
    return {"db": db}


# GET /graphql serves the GraphiQL explorer; POST /graphql runs queries.
graphql_router = GraphQLRouter(schema, context_getter=get_context)
