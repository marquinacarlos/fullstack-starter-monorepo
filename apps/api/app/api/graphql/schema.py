import logging

import strawberry
from graphql import GraphQLError
from strawberry.fastapi import GraphQLRouter
from strawberry.types import ExecutionContext

from app.api.graphql.resolvers import Query
from app.core.errors import PublicError

logger = logging.getLogger("app.graphql")


class AppSchema(strawberry.Schema):
    def process_errors(
        self, errors: list[GraphQLError], execution_context: ExecutionContext | None = None
    ) -> None:
        # Strawberry logs every resolver error with a full traceback. Expected errors
        # (a disabled or stopped database) get one line instead.
        for error in errors:
            if isinstance(error.original_error, PublicError):
                logger.warning("GraphQL: %s", error.original_error)
            else:
                super().process_errors([error], execution_context)


schema = AppSchema(query=Query)

# GET /graphql serves the GraphiQL explorer; POST /graphql runs queries.
graphql_router = GraphQLRouter(schema)
